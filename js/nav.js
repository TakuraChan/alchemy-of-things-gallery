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

// Load navigation when DOM is ready
if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',loadNav);
}else{
    loadNav();
}
