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
//   >> name       names the set-apart block that follows
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

// What the section calls itself, and whether its entries are numbered, both come
// from the category — so they are editable in the admin rather than written here.
const THOUGHTS_DEFAULTS={name:'Thoughts',entryLabel:'Thought experiment',showEntryLabel:true};

async function thoughtsMeta(){
    try{
        const r=await fetch('/data/categories.json?_='+Date.now());
        if(!r.ok)return THOUGHTS_DEFAULTS;
        const cats=await r.json();
        const c=Array.isArray(cats)?cats.find(x=>x&&x.id==='thoughts'):null;
        if(!c)return THOUGHTS_DEFAULTS;
        return {name:c.name||THOUGHTS_DEFAULTS.name,
                entryLabel:c.entryLabel||THOUGHTS_DEFAULTS.entryLabel,
                showEntryLabel:c.showEntryLabel!==false};
    }catch{return THOUGHTS_DEFAULTS}
}

// The line that names where you are: the entry's number when they are numbered,
// the name of the section when they are not.
function thoughtAscent(meta,number){
    const m=meta||THOUGHTS_DEFAULTS;
    return m.showEntryLabel?(m.entryLabel+' '+number):m.name;
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
        // A set-apart block, optionally named by a leading '>> ' line: a block
        // stating the laws should say so rather than simply appearing.
        const named=lines[0].startsWith('>> ');
        const said=named?lines.slice(1):lines;
        if(said.length&&said.every(l=>l.startsWith('> ')))
            return '<div class="law">'
                +(named?'<p class="law-name">'+inlineText(lines[0].slice(3))+'</p>':'')
                +said.map(l=>'<p>'+inlineText(l.slice(2))+'</p>').join('')+'</div>';
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

// A closed block named by what it holds. Printing opens it; see the print styles.
function fold(name,inner,cls,tag){
    const t=tag||'div';
    return '<details class="thoughts-fold"><summary>'+escapeText(name)+'</summary>'
        +'<'+t+' class="'+cls+'">'+inner+'</'+t+'>'
        +'</details>';
}

// One section, folded shut behind its own heading.
function sectionFold(s){
    return '<details class="section-fold" id="'+escapeText(s.id||'')+'">'
        +'<summary><h2>'+(s.numeral?'<span class="numeral">'+escapeText(s.numeral)+'</span>':'')
        +escapeText(s.heading||'')+'</h2></summary>'
        +'<div class="section-body">'
        +(s.lede?'<p class="lede">'+inlineText(s.lede)+'</p>':'')
        +renderBlocks(s.body)
        +'</div></details>';
}

function sectionLabel(s){
    return (s.numeral?s.numeral+'. ':'')+(s.heading||'');
}

// A link into a section that is folded shut must open it — from the note, from
// the contents in a printed copy someone is following, or from a shared URL.
function openThoughtTarget(hash){
    if(!hash||hash.length<2)return;
    let el=null;
    try{el=document.querySelector(hash)}catch(e){return}
    if(!el)return;
    // Open every fold above it — a section now sits inside its part.
    let node=el;
    while(node){
        if(node.tagName==='DETAILS')node.open=true;
        node=node.parentElement;
    }
    if(el.scrollIntoView)el.scrollIntoView({block:'start'});
}

function wireThought(root){
    root.addEventListener('click',e=>{
        const a=e.target.closest&&e.target.closest('a[href^="#"]');
        if(!a)return;
        const hash=a.getAttribute('href');
        if(!hash||hash==='#')return;
        e.preventDefault();
        history.replaceState(null,'',hash);
        openThoughtTarget(hash);
    });
    if(location.hash)setTimeout(()=>openThoughtTarget(location.hash),0);
    window.addEventListener('hashchange',()=>openThoughtTarget(location.hash));
}

// A structured entry to the full reading layout. `number` is its position.
function renderThought(e,number,meta){
    let h=ascentLine(thoughtAscent(meta,number),'/thoughts.html',true);
    h+='<h1 class="thoughts-title">'+escapeText(e.title||'Untitled')+'</h1>';
    if(e.standfirst)h+='<p class="thoughts-standfirst">'+escapeText(e.standfirst)+'</p>';
    if(e.edition)h+='<p class="thoughts-edition">'+escapeText(e.edition)+'</p>';
    // The note and the contents are folded shut, so the piece opens with the piece.
    // A fold is the site's ordinary move: a name that opens into what it names.
    if(e.note)h+=fold(e.noteLabel||'A note',thoughtBody(e.note),'thoughts-note');

    const sections=(e.sections||[]).filter(s=>s.heading||s.body);

    // A printed page cannot be opened, so it keeps a contents. On screen there
    // is none: the document itself is the contents, each section a name that
    // opens. `.thoughts-contents` is print-only for exactly that reason.
    if(sections.length>1){
        let part='',list='';
        sections.forEach(s=>{
            if(s.part&&s.part!==part){part=s.part;list+='<p class="thoughts-part">'+escapeText(part)+'</p>'}
            list+='<a href="#'+escapeText(s.id||'')+'">'+escapeText(sectionLabel(s))+'</a>';
        });
        h+='<nav class="thoughts-contents">'+list+'</nav>';
    }

    // A part is a level, not a label: it folds, and opens on the names of its
    // sections, each of which folds onto the prose. The closed page is the whole
    // document at its widest reading — the parts alone.
    const groups=[];
    sections.forEach(s=>{
        const name=s.part||'';
        const last=groups[groups.length-1];
        if(last&&last.name===name)last.items.push(s);
        else groups.push({name,items:[s]});
    });
    groups.forEach(g=>{
        const inner=g.items.map(sectionFold).join('');
        if(!g.name){h+=inner;return}   // a section belonging to no part stands alone
        h+='<details class="part-fold">'
            +'<summary><h2 class="part-name">'+escapeText(g.name)+'</h2></summary>'
            +'<div class="part-body">'+inner+'</div>'
            +'</details>';
    });

    if(e.image)h+='<img class="thought-image" src="'+escapeText(e.image)+'" alt="">';
    // The conclusion is a peer of the parts, not of the sections inside them,
    // so it folds and reads as one.
    if(e.closing)h+='<details class="part-fold" id="closing">'
        +'<summary><h2 class="part-name">'+escapeText(e.closingLabel||'Conclusion')+'</h2></summary>'
        +'<div class="part-body">'+renderBlocks(e.closing)+'</div></details>';

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
