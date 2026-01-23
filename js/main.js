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
    let collectionsFile;
    if(type==='paintings'){
        collectionsFile='/data/collections.json';
    }else if(type==='photography'){
        collectionsFile='/data/observations.json';
    }else{
        collectionsFile='/data/'+type+'-collections.json';
    }

    try{
        const r=await fetch(collectionsFile),collections=await r.json();
        if(!collections.length){c.innerHTML='<p class="empty">No collections yet.</p>';return}

        // Sort by order and show all active + next inactive
        collections.sort((a,b)=>a.order-b.order);
        const active=collections.filter(c=>c.active);
        const nextInactive=collections.find(c=>!c.active&&c.order>Math.max(...active.map(a=>a.order),0));
        const visible=nextInactive?[...active,nextInactive]:active;

        c.innerHTML=visible.map((col,i)=>`
            <article class="work-item" style="animation-delay:${i*.1}s">
                <a href="/collection.html?id=${col.id}&type=${type}" class="work-link collection-link">
                    <div class="collection-title">${col.name}</div>
                </a>
            </article>
        `).join('');
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
            c.innerHTML=`<div class="collection-soon"><p>New work arriving soon</p><a href="${back}" class="back-link">${backText}</a></div>`;
            return;
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
    }catch{c.innerHTML='<p class="empty">Error loading work.</p>'}
}
