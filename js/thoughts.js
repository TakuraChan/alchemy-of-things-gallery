// Thought experiments: shared loader for the index and the reader page.
// Entries live in data/thoughts/*.json and are aggregated into data/thoughts.json
// by the admin. Numbering is positional: sort by `order`, then count from one.

function escapeText(s){
    return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

// An entry either points at a hand-built page (link) or is read here.
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
        .map(p=>'<p>'+escapeText(p.trim()).replace(/\n/g,'<br>')+'</p>').join('');
}
