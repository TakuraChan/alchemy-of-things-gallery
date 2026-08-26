// Thought experiments: shared loader and renderer for the index and the reader.
//
// Entries live in data/thoughts/*.json and are aggregated into data/thoughts.json
// by the admin. Numbering is positional: sort by `order`, then count from one.
//
// An entry is either short (a `text` field) or structured (a `sections` array).
// A structured entry carries: title, standfirst, edition, note, sections[], closing,
// closeLine, email, pdf, colophon. Each section has part, numeral, heading, lede, body.
//
// Section bodies use a small set of marks, blank line between blocks:
//   ### text      a subheading
//   > line        a set-apart line; consecutive ones form one block
//   1. item       a numbered procedure
//   : term        a table entry — term, then a definition line, then "Label — value" lines
//   anything else a paragraph
// Inline: *emphasis* and [text](#section-id).

function escapeText(s){
    return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

function inlineText(s){
    return escapeText(s)
        .replace(/\[([^\]]+)\]\(#([a-z0-9-]+)\)/gi,'<a href="#$2">$1</a>')
        .replace(/\*([^*]+)\*/g,'<em>$1</em>');
}

function thoughtHref(e){
    return e.link||('/thoughts/entry.html?id='+encodeURIComponent(e.id));
}

async function loadThoughts(){
    try{
        const r=await fetch('/data/thoughts.json?_='+Date.now());
        if(!r.ok)return [];
        const entries=await r.json();
        if(!Array.isArray(entries))return [];
        return entries.sort((a,b)=>(a.order??999)-(b.order??999));
    }catch{return []}
}

// Plain text to paragraphs, blank line between them, single newlines kept.
function thoughtBody(text){
    return String(text||'').split(/\n\s*\n/).filter(p=>p.trim())
        .map(p=>'<p>'+inlineText(p.trim()).replace(/\n/g,'<br>')+'</p>').join('');
}

// One section body to its blocks.
function renderBlocks(body){
    return String(body||'').split(/\n\s*\n/).filter(b=>b.trim()).map(chunk=>{
        const lines=chunk.split('\n').map(l=>l.trim()).filter(Boolean);
        if(lines[0].startsWith('### '))
            return '<h3>'+inlineText(lines[0].slice(4))+'</h3>';
        if(lines.every(l=>l.startsWith('> ')))
            return '<div class="law">'+lines.map(l=>'<p>'+inlineText(l.slice(2))+'</p>').join('')+'</div>';
        if(/^\d+\.\s/.test(lines[0]))
            return '<ol>'+lines.map(l=>'<li>'+inlineText(l.replace(/^\d+\.\s*/,''))+'</li>').join('')+'</ol>';
        if(lines[0].startsWith(': ')){
            const term=lines[0].slice(2);
            let html='<div class="entry"><p class="entry-term">'+inlineText(term)+'</p>';
            lines.slice(1).forEach(l=>{
                const split=l.split(' — ');
                if(split.length>1){
                    html+='<p class="entry-note"><span class="entry-label">'+inlineText(split[0])
                        +' — </span>'+inlineText(split.slice(1).join(' — '))+'</p>';
                }else{
                    html+='<p class="entry-def">'+inlineText(l)+'</p>';
                }
            });
            return html+'</div>';
        }
        return '<p>'+inlineText(lines.join(' '))+'</p>';
    }).join('');
}

function sectionLabel(s){
    return (s.numeral?s.numeral+'. ':'')+(s.heading||'');
}

// A structured entry to the full reading layout. `number` is its position.
function renderThought(e,number){
    let h='<p class="thoughts-segment"><a href="/thoughts.html">Thought experiment '+number+'</a></p>';
    h+='<h1 class="thoughts-title">'+escapeText(e.title||'Untitled')+'</h1>';
    if(e.standfirst)h+='<p class="thoughts-standfirst">'+escapeText(e.standfirst)+'</p>';
    if(e.edition)h+='<p class="thoughts-edition">'+escapeText(e.edition)+'</p>';
    if(e.note)h+='<div class="thoughts-note">'+thoughtBody(e.note)+'</div>';

    const sections=(e.sections||[]).filter(s=>s.heading||s.body);
    if(sections.length>1){
        let part='';
        h+='<nav class="thoughts-contents">';
        sections.forEach(s=>{
            if(s.part&&s.part!==part){part=s.part;h+='<p class="thoughts-part">'+escapeText(part)+'</p>'}
            h+='<a href="#'+escapeText(s.id||'')+'">'+escapeText(sectionLabel(s))+'</a>';
        });
        h+='</nav>';
    }

    sections.forEach(s=>{
        h+='<section id="'+escapeText(s.id||'')+'">';
        if(s.heading)h+='<h2>'+(s.numeral?'<span class="numeral">'+escapeText(s.numeral)+'</span>':'')
            +escapeText(s.heading)+'</h2>';
        if(s.lede)h+='<p class="lede">'+inlineText(s.lede)+'</p>';
        h+=renderBlocks(s.body);
        h+='</section>';
    });

    if(e.image)h+='<img class="thought-image" src="'+escapeText(e.image)+'" alt="">';
    if(e.closing)h+='<section id="closing">'+renderBlocks(e.closing)+'</section>';

    if(e.closeLine||e.email||e.pdf||e.colophon){
        h+='<div class="thoughts-close">';
        if(e.closeLine)h+='<p>'+inlineText(e.closeLine)+'</p>';
        if(e.email)h+='<a class="thoughts-email" href="mailto:'+escapeText(e.email)
            +'?subject='+encodeURIComponent((e.title||'')+' — response')+'">'+escapeText(e.email)+'</a>';
        if(e.pdf)h+='<a class="thoughts-pdf" href="'+escapeText(e.pdf)+'">Read as a PDF <span class="external-icon">↗</span></a>';
        if(e.colophon)h+='<p class="thoughts-colophon">'+escapeText(e.colophon).replace(/\n/g,'<br>')+'</p>';
        h+='</div>';
    }
    return h;
}
