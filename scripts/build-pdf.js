// Renders thoughts/alchemy-of-things.html to documents/alchemy-of-things.pdf
//
//   node scripts/build-pdf.js
//
// The web page is the source of truth; the PDF is generated from it, so the two
// can never drift. Fonts are fetched from Google as static TTF and inlined as
// data URIs: Chromium's print pipeline silently drops woff2 web fonts and falls
// back to DejaVu, so woff2 must not be used here.

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execFileSync } = require('child_process');

let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'documents', 'alchemy-of-things.pdf');
const TEMP = path.join(ROOT, '_print.html');
const UA = 'Mozilla/5.0'; // a bare UA makes Google serve truetype rather than woff2

const FAMILIES = ['Jost:300,400', 'Cormorant+Garamond:300,400,400italic'];

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
                '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp',
                '.png': 'image/png', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg' };

const curl = (url) => execFileSync('curl', ['-sS', '-A', UA, url], { maxBuffer: 1 << 26 });

function fontCss() {
    let css = FAMILIES.map(f => curl('https://fonts.googleapis.com/css?family=' + f).toString()).join('\n');
    const urls = [...new Set([...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map(m => m[1]))];
    for (const u of urls) {
        const buf = curl(u);
        const magic = buf.subarray(0, 4).toString('latin1');
        if (!['\x00\x01\x00\x00', 'true', 'OTTO'].includes(magic)) throw new Error('not a truetype file: ' + u);
        css = css.split(u).join('data:font/ttf;base64,' + buf.toString('base64'));
    }
    console.log('inlined ' + urls.length + ' font files');
    return css;
}

function serve() {
    const server = http.createServer((req, res) => {
        const file = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
        fs.readFile(file, (err, data) => {
            if (err) { res.writeHead(404); return res.end(); }
            res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
            res.end(data);
        });
    });
    return new Promise(r => server.listen(0, '127.0.0.1', () => r(server)));
}

(async () => {
    const page = fs.readFileSync(path.join(ROOT, "thoughts", "alchemy-of-things.html"), 'utf8')
        .replace(/ *<link href="https:\/\/fonts\.googleapis\.com[^>]*>\n/, '')
        .replace('</head>', '<style>\n' + fontCss() + '\n</style>\n</head>');
    fs.writeFileSync(TEMP, page);

    const server = await serve();
    const browser = await chromium.launch();
    try {
        const p = await browser.newPage();
        await p.goto('http://127.0.0.1:' + server.address().port + '/_print.html', { waitUntil: 'networkidle' });
        await p.evaluate(() => document.fonts.ready);
        await p.emulateMedia({ media: 'print' });
        await p.pdf({
            path: OUT, format: 'A4', printBackground: false,
            displayHeaderFooter: true, headerTemplate: '<span></span>',
            footerTemplate: '<div style="width:100%;text-align:center;font-size:8pt;color:#999"><span class="pageNumber"></span></div>',
            margin: { top: '20mm', bottom: '20mm', left: '22mm', right: '22mm' }
        });
    } finally {
        await browser.close();
        server.close();
        fs.unlinkSync(TEMP);
    }
    console.log('wrote ' + path.relative(ROOT, OUT) + ' (' + Math.round(fs.statSync(OUT).size / 1024) + 'KB)');
})();
