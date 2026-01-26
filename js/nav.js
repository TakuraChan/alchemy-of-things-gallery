// Dynamic navigation loader
async function loadNav(){
    try{
        const r=await fetch('/data/categories.json');
        const categories=await r.json();
        const visible=categories.filter(c=>c.visible).sort((a,b)=>a.order-b.order);

        const nav=document.querySelector('.nav');
        const navLinks=document.querySelector('.nav-links');
        if(!nav||!navLinks)return;

        // Build menu items
        let html='';
        visible.forEach(cat=>{
            const url=cat.file==='index.html'?'/':'/'+cat.file;
            html+=`<a href="${url}">${cat.name}</a>`;
        });
        html+='<a href="/about.html">About</a>';
        navLinks.innerHTML=html;

        // Add symbol above nav-links
        let symbol=document.getElementById('nav-symbol');
        if(!symbol){
            symbol=document.createElement('img');
            symbol.src='/images/symbol.svg';
            symbol.alt='';
            symbol.className='symbol';
            symbol.id='nav-symbol';
            symbol.style.cursor='pointer';
            nav.insertBefore(symbol,navLinks);
        }

        // Add click handler to symbol for landing page
        symbol.addEventListener('click',()=>{
            if(window.location.pathname==='/'||window.location.pathname==='/index.html'){
                sessionStorage.removeItem('hasVisited');
                location.reload();
            }else{
                window.location.href='/';
            }
        });
    }catch{
        // Fallback if categories.json doesn't exist
        console.log('Using default navigation');
    }
}

// Load navigation when DOM is ready
if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',loadNav);
}else{
    loadNav();
}
