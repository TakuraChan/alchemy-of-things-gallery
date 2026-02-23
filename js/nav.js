// Dynamic navigation loader
async function loadNav(){
    try{
        const nav=document.querySelector('.nav');
        const navLinks=document.querySelector('.nav-links');
        if(!nav||!navLinks)return;

        // Just show home link
        navLinks.innerHTML='<a href="/">home</a>';

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
        console.log('Using default navigation');
    }
}

// Load navigation when DOM is ready
if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',loadNav);
}else{
    loadNav();
}
