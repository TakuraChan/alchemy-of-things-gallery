async function loadWorks(type){
    const c=document.getElementById('works'),path=type==='paintings'?'/data/works.json':'/data/photography.json';
    try{
        const r=await fetch(path),works=await r.json();
        if(!works.length){c.innerHTML='<p class="empty">No works yet.</p>';return}
        works.sort((a,b)=>(a.order||999)-(b.order||999)||b.year-a.year);
        c.innerHTML=works.map((w,i)=>`
            <article class="work-item" style="animation-delay:${i*.1}s">
                <a href="/work.html?id=${w.id}&type=${type}" class="work-link">
                    <img src="${w.image}" alt="${w.title}" class="work-image" loading="lazy">
                </a>
                <div class="work-meta">
                    <span class="work-title">${w.title}</span>
                    <span>${w.year}</span>
                    <span>${w.medium}</span>
                    <span>${w.dimensions}</span>
                    <span class="work-availability ${w.available?'available':''}">${w.available?'Available':'Sold'}</span>
                </div>
            </article>
        `).join('');

        // Add navigation arrows for desktop
        if(window.innerWidth>768){
            const nav=document.createElement('div');
            nav.className='gallery-nav';
            nav.innerHTML='<button class="gallery-arrow gallery-arrow-left" aria-label="Previous">‹</button><button class="gallery-arrow gallery-arrow-right" aria-label="Next">›</button>';
            document.querySelector('.main').appendChild(nav);

            const left=nav.querySelector('.gallery-arrow-left'),right=nav.querySelector('.gallery-arrow-right');
            left.addEventListener('click',()=>{const w=c.scrollLeft;c.scrollTo({left:w-c.clientWidth,behavior:'smooth'})});
            right.addEventListener('click',()=>{const w=c.scrollLeft;c.scrollTo({left:w+c.clientWidth,behavior:'smooth'})});

            // Update arrow visibility
            const updateArrows=()=>{
                left.style.opacity=c.scrollLeft<=10?'0':'1';
                left.style.pointerEvents=c.scrollLeft<=10?'none':'auto';
                right.style.opacity=c.scrollLeft>=c.scrollWidth-c.clientWidth-10?'0':'1';
                right.style.pointerEvents=c.scrollLeft>=c.scrollWidth-c.clientWidth-10?'none':'auto';
            };
            c.addEventListener('scroll',updateArrows);
            updateArrows();
        }
    }catch{c.innerHTML='<p class="empty">Error loading works.</p>'}
}

async function loadCollections(type){
    const c=document.getElementById('works');
    // Determine collections file based on type
    let collectionsFile,worksFile;
    if(type==='paintings'){
        collectionsFile='/data/collections.json';
        worksFile='/data/works.json';
    }else if(type==='photography'){
        collectionsFile='/data/observations.json';
        worksFile='/data/photography.json';
    }else{
        collectionsFile='/data/'+type+'-collections.json';
        worksFile='/data/'+type+'.json';
    }

    try{
        const r=await fetch(collectionsFile),collections=await r.json();
        if(!collections.length){c.innerHTML='<p class="empty">No collections yet.</p>';return}

        // Check if any works exist in any collection
        let hasWorksInCollections=false;
        try{
            const wr=await fetch(worksFile),works=await wr.json();
            hasWorksInCollections=works.some(w=>w.collectionId);
        }catch{}

        // Sort by order
        collections.sort((a,b)=>a.order-b.order);

        // If no works in any collection, only show first collection
        // Otherwise show all active + next inactive
        let visible;
        if(!hasWorksInCollections){
            visible=[collections[0]];
        }else{
            const active=collections.filter(c=>c.active);
            const nextInactive=collections.find(c=>!c.active&&c.order>Math.max(...active.map(a=>a.order),0));
            visible=nextInactive?[...active,nextInactive]:active;
        }

        // Add collections view class
        c.classList.add('collections-view');

        c.innerHTML=visible.map((col,i)=>`
            <article class="work-item" style="animation-delay:${i*.1}s">
                <a href="/collection.html?id=${col.id}&type=${type}" class="work-link collection-link">
                    <div class="collection-title">${col.name}</div>
                </a>
            </article>
        `).join('');

        // Set up intersection observer to highlight centered collection
        if(window.IntersectionObserver&&visible.length>1){
            const items=c.querySelectorAll('.work-item');
            const observer=new IntersectionObserver((entries)=>{
                entries.forEach(entry=>{
                    if(entry.isIntersecting&&entry.intersectionRatio>0.5){
                        items.forEach(item=>item.classList.remove('collection-centered'));
                        entry.target.classList.add('collection-centered');
                    }
                });
            },{threshold:[0.5],rootMargin:'-20% 0px'});

            items.forEach(item=>observer.observe(item));

            // Scroll to the latest active collection by default
            const activeCollections=visible.filter(col=>col.active);
            if(activeCollections.length>0){
                const latestActive=activeCollections[activeCollections.length-1];
                const idx=visible.findIndex(col=>col.id===latestActive.id);
                if(idx>=0){
                    setTimeout(()=>{
                        items[idx].scrollIntoView({block:'center',behavior:'smooth'});
                        items[idx].classList.add('collection-centered');
                    },100);
                }
            }
        }else if(visible.length===1){
            // If only one collection, make it centered by default
            c.querySelector('.work-item')?.classList.add('collection-centered');
        }
    }catch{c.innerHTML='<p class="empty">Error loading collections.</p>'}
}

async function loadCollection(){
    const c=document.getElementById('works'),p=new URLSearchParams(location.search);
    const id=p.get('id'),type=p.get('type')||'paintings';
    if(!id){c.innerHTML='<p class="empty">Collection not found.</p>';return}

    // Determine back link and text
    let back,backText;
    if(type==='paintings'){
        back='/';
        backText='Paintings';
    }else if(type==='photography'){
        back='/photography.html';
        backText='Photography';
    }else{
        back='/'+type+'.html';
        // Capitalize first letter
        backText=type.charAt(0).toUpperCase()+type.slice(1);
    }

    try{
        // Determine works file
        let worksPath;
        if(type==='paintings'){
            worksPath='/data/works.json';
        }else if(type==='photography'){
            worksPath='/data/photography.json';
        }else{
            worksPath='/data/'+type+'.json';
        }

        const r=await fetch(worksPath),works=await r.json();
        const collectionWorks=works.filter(w=>w.collectionId===id);

        if(!collectionWorks.length){
            // Empty collection - show "soon" message
            let comingSoonText='New work arriving soon';
            try{
                const cr=await fetch('/data/content.json');
                const content=await cr.json();
                if(content.general?.comingSoon)comingSoonText=content.general.comingSoon;
            }catch{}
            c.innerHTML=`<div class="collection-soon"><p>${comingSoonText}</p><a href="${back}" class="back-link">${backText}</a></div>`;
            return;
        }

        // Add class for mobile horizontal scrolling
        if(window.innerWidth<=768){
            c.classList.add('collection-artworks-view');
        }

        collectionWorks.sort((a,b)=>(a.order||999)-(b.order||999)||b.year-a.year);
        c.innerHTML=collectionWorks.map((w,i)=>`
            <article class="work-item" style="animation-delay:${i*.1}s">
                <a href="/work.html?id=${w.id}&type=${type}&collection=${id}" class="work-link">
                    <img src="${w.image}" alt="${w.title}" class="work-image" loading="lazy">
                </a>
                <div class="work-meta">
                    <span class="work-title">${w.title}</span>
                    <span>${w.year}</span>
                    <span>${w.medium}</span>
                    <span>${w.dimensions}</span>
                    <span class="work-availability ${w.available?'available':''}">${w.available?'Available':'Sold'}</span>
                </div>
            </article>
        `).join('');

        // Add navigation arrows for desktop
        if(window.innerWidth>768){
            const nav=document.createElement('div');
            nav.className='gallery-nav';
            nav.innerHTML='<button class="gallery-arrow gallery-arrow-left" aria-label="Previous">‹</button><button class="gallery-arrow gallery-arrow-right" aria-label="Next">›</button>';
            document.querySelector('.main').appendChild(nav);

            const left=nav.querySelector('.gallery-arrow-left'),right=nav.querySelector('.gallery-arrow-right');
            left.addEventListener('click',()=>{const w=c.scrollLeft;c.scrollTo({left:w-c.clientWidth,behavior:'smooth'})});
            right.addEventListener('click',()=>{const w=c.scrollLeft;c.scrollTo({left:w+c.clientWidth,behavior:'smooth'})});

            const updateArrows=()=>{
                left.style.opacity=c.scrollLeft<=10?'0':'1';
                left.style.pointerEvents=c.scrollLeft<=10?'none':'auto';
                right.style.opacity=c.scrollLeft>=c.scrollWidth-c.clientWidth-10?'0':'1';
                right.style.pointerEvents=c.scrollLeft>=c.scrollWidth-c.clientWidth-10?'none':'auto';
            };
            c.addEventListener('scroll',updateArrows);
            updateArrows();
        }
    }catch{c.innerHTML='<p class="empty">Error loading collection.</p>'}
}

async function loadSingleWork(){
    const c=document.getElementById('work'),p=new URLSearchParams(location.search);
    const id=p.get('id'),type=p.get('type')||'paintings',collectionId=p.get('collection');
    if(!id){c.innerHTML='<p class="empty">Work not found.</p>';return}

    // Determine back link
    let backBase;
    if(type==='paintings'){
        backBase='/';
    }else if(type==='photography'){
        backBase='/photography.html';
    }else{
        backBase='/'+type+'.html';
    }

    const back=collectionId?`/collection.html?id=${collectionId}&type=${type}`:backBase;
    const backText=type.charAt(0).toUpperCase()+type.slice(1);

    // Determine works file
    let path;
    if(type==='paintings'){
        path='/data/works.json';
    }else if(type==='photography'){
        path='/data/photography.json';
    }else{
        path='/data/'+type+'.json';
    }
    try{
        const r=await fetch(path),works=await r.json(),w=works.find(x=>x.id===id);
        if(!w){c.innerHTML='<p class="empty">Work not found.</p>';return}
        document.title=w.title+' — Alchemy of Things';
        c.innerHTML=`
            <a href="${back}" class="back-link">${backText}</a>
            <img src="${w.image}" alt="${w.title}">
            <div class="single-work-meta">
                <div><h1>${w.title}</h1><p>${w.year} · ${w.medium} · ${w.dimensions}</p><p>${w.available?'Available':'Sold'}</p></div>
                ${w.available?`<a href="/inquire.html?work=${encodeURIComponent(w.title)}" class="inquire-btn">Inquire</a>`:''}
            </div>
        `;

        // Add zoom functionality for desktop
        if(window.innerWidth>768){
            const img=c.querySelector('img');
            const exitBtn=document.createElement('button');
            exitBtn.className='zoom-exit';
            exitBtn.innerHTML='×';
            exitBtn.setAttribute('aria-label','Exit zoom');
            document.querySelector('.main').appendChild(exitBtn);

            img.addEventListener('click',()=>{
                img.classList.toggle('zoomed');
                exitBtn.classList.toggle('visible');
            });

            exitBtn.addEventListener('click',()=>{
                img.classList.remove('zoomed');
                exitBtn.classList.remove('visible');
            });
        }
    }catch{c.innerHTML='<p class="empty">Error loading work.</p>'}
}
