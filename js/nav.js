// Dynamic navigation loader
async function loadNav(){
    try{
        const r=await fetch('/data/categories.json');
        const categories=await r.json();
        const visible=categories.filter(c=>c.visible).sort((a,b)=>a.order-b.order);

        const navLinks=document.querySelector('.nav-links');
        if(!navLinks)return;

        let html='<a href="/"><img src="/images/symbol.svg" alt="" class="symbol"></a>';
        visible.forEach(cat=>{
            const url=cat.file==='index.html'?'/':'/'+cat.file;
            html+=`<a href="${url}">${cat.name}</a>`;
        });
        html+='<a href="/about.html">About</a>';

        navLinks.innerHTML=html;
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
