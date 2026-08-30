// The ascent: one line at the top of every page below the hub. The site's mark
// when home is more than one step away, then the name of the level above — the
// name is the way back, so there is no arrow anywhere. On a section index home
// and "up one" are the same place, so the symbol is left off and the name does
// both jobs.
function ascentEscape(s){
    return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

function ascentLine(name,href,showHome){
    return '<p class="ascent">'
        +(showHome&&href!=='/'?'<a class="ascent-home" href="/" aria-label="Home"><img src="/images/symbol.svg" alt=""></a>':'')
        +'<a class="ascent-up" href="'+ascentEscape(href)+'">'+ascentEscape(name)+'</a></p>';
}

// Dynamic navigation loader
async function loadNav(){
    try{
        const nav=document.querySelector('.nav');
        const navLinks=document.querySelector('.nav-links');
        if(!nav)return;

        // Remove nav-links, just use symbol as home button
        if(navLinks)navLinks.remove();

        // Add symbol as home button
        let symbol=document.getElementById('nav-symbol');
        if(!symbol){
            symbol=document.createElement('img');
            symbol.src='/images/symbol.svg';
            symbol.alt='Home';
            symbol.className='symbol';
            symbol.id='nav-symbol';
            symbol.style.cursor='pointer';
            nav.appendChild(symbol);
        }

        // Click symbol to go home
        symbol.addEventListener('click',()=>{
            window.location.href='/';
        });
    }catch{
        console.log('Using default navigation');
    }
}

// Track page visit (fire and forget)
if(!location.pathname.startsWith('/admin')){
    fetch('/.netlify/functions/visit',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({path:location.pathname+location.search})
    }).catch(()=>{});
}

// Load navigation when DOM is ready
if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',loadNav);
}else{
    loadNav();
}
