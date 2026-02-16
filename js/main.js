// Content cache to avoid redundant fetches
let contentCache=null;
async function getContent(){
    if(contentCache)return contentCache;
    try{
        const r=await fetch('/data/content.json?_='+Date.now());
        contentCache=await r.json();
        return contentCache;
    }catch{
        return {about:{},paintings:{},photography:{},contact:{},general:{}};
    }
}

async function loadWorks(type){
    const c=document.getElementById('works'),path=type==='paintings'?'/data/works.json':'/data/photography.json';
    try{
        const r=await fetch(path),works=await r.json();
        if(!works.length){c.innerHTML='<p class="empty">No works yet.</p>';return}
        works.sort((a,b)=>(a.order||999)-(b.order||999)||b.year-a.year);
        const cacheBust='?_='+Date.now();
        c.innerHTML=works.map((w,i)=>`
            <article class="work-item" style="animation-delay:${i*.1}s">
                <a href="/work.html?id=${w.id}&type=${type}" class="work-link">
                    <img src="${w.image}${cacheBust}" alt="${w.title}" class="work-image" loading="lazy" onerror="this.style.display='none'">
                </a>
                <div class="work-meta">
                    <span class="work-title">${w.title}</span>
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

        // Make works container visible
        setTimeout(()=>{c.style.opacity='1'},50);
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

        // Show all active collections + next inactive
        let visible;
        const active=collections.filter(c=>c.active);
        const nextInactive=collections.find(c=>!c.active&&c.order>Math.max(...active.map(a=>a.order),0));
        visible=nextInactive?[...active,nextInactive]:active;
        // If no active collections, show all collections
        if(!visible.length)visible=collections;

        // Add collections view class
        c.classList.add('collections-view');

        // Check if intro text exists
        const sectionNote=document.querySelector('.section-note');
        const hasIntro=sectionNote&&sectionNote.textContent.trim();

        // Get coming soon text
        const content=await getContent();
        const comingSoonText=content.general?.comingSoon||'coming soon';

        // Delay rendering if intro text exists
        const renderCollections=()=>{
            c.innerHTML=visible.map((col,i)=>`
                <article class="work-item" style="animation-delay:${i*.1}s">
                    <a href="/collection.html?id=${col.id}&type=${type}" class="work-link collection-link">
                        <div class="collection-title">${col.name}</div>
                        ${!col.active?`<div class="collection-coming-soon">${comingSoonText}</div>`:''}
                    </a>
                </article>
            `).join('');
            setupCollectionObserver();
        };

        if(hasIntro){
            // Wait for intro to finish before rendering
            setTimeout(renderCollections,4100);
        }else{
            // No intro, render immediately
            renderCollections();
            c.style.opacity='1';
        }

        function setupCollectionObserver(){
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
        }

        // Handle intro text/image fade (desktop and mobile)
        if(hasIntro){
            // Hide collections initially
            c.style.opacity='0';

            // Show and animate intro content
            sectionNote.style.opacity='0';
            sectionNote.style.display='flex';

            setTimeout(()=>{
                sectionNote.style.transition='opacity 0.8s ease';
                sectionNote.style.opacity='1';
            },100);

            // Fade out intro content after 3 seconds
            setTimeout(()=>{
                sectionNote.style.opacity='0';
            },3100);

            // Remove intro content after fade out
            setTimeout(()=>{
                sectionNote.style.display='none';
                c.style.transition='opacity 1s ease';
                c.style.opacity='1';
            },4100);
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
            const content=await getContent();
            const comingSoonText=content.general?.comingSoon||'new work coming soon';
            c.innerHTML=`<div class="collection-soon"><p>${comingSoonText}</p><a href="${back}" class="back-link">${backText}</a></div>`;
            return;
        }

        // Add class for mobile horizontal scrolling
        if(window.innerWidth<=768){
            c.classList.add('collection-artworks-view');
        }

        collectionWorks.sort((a,b)=>(a.order||999)-(b.order||999)||b.year-a.year);

        const cacheBust='?_='+Date.now();
        c.innerHTML=collectionWorks.map((w,i)=>`
            <article class="work-item" style="animation-delay:${i*.1}s">
                <a href="/work.html?id=${w.id}&type=${type}&collection=${id}" class="work-link">
                    <img src="${w.image}${cacheBust}" alt="${w.title}" class="work-image" loading="lazy" onerror="this.style.display='none'">
                </a>
                <div class="work-meta">
                    <span class="work-title">${w.title}</span>
                </div>
            </article>
        `).join('');

        // Add navigation arrows
        const nav=document.createElement('div');
        nav.className='gallery-nav';
        nav.innerHTML='<button class="gallery-arrow gallery-arrow-left" aria-label="Previous">‹</button><button class="gallery-arrow gallery-arrow-right" aria-label="Next">›</button>';
        document.querySelector('.main').appendChild(nav);

        const left=nav.querySelector('.gallery-arrow-left'),right=nav.querySelector('.gallery-arrow-right');
        const items=Array.from(c.querySelectorAll('.work-item'));
        let currentIndex=0;

        const showItem=(index)=>{
            items.forEach((item,i)=>{
                item.style.display=i===index?'flex':'none';
            });
            left.style.opacity=index<=0?'0':'1';
            left.style.pointerEvents=index<=0?'none':'auto';
            right.style.opacity=index>=items.length-1?'0':'1';
            right.style.pointerEvents=index>=items.length-1?'none':'auto';
            currentIndex=index;
        };

        left.addEventListener('click',()=>{if(currentIndex>0)showItem(currentIndex-1)});
        right.addEventListener('click',()=>{if(currentIndex<items.length-1)showItem(currentIndex+1)});

        showItem(0);

        // Make works container visible
        setTimeout(()=>{c.style.opacity='1'},50);
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
        const r=await fetch(path),works=await r.json();
        let w=works.find(x=>x.id===id);
        // Fallback: if not in aggregated file, try individual data file
        if(!w){
            const folder=type==='paintings'?'paintings':type==='photography'?'photography':type;
            try{const ir=await fetch('/data/'+folder+'/'+id+'.json?_='+Date.now());if(ir.ok)w=await ir.json()}catch{}
        }
        if(!w){c.innerHTML='<p class="empty">Work not found.</p>';return}
        document.title=w.title+' — Alchemy of Things';
        // Hide header and footer on mobile
        if(window.innerWidth<=768){
            document.querySelector('.nav').style.display='none';
            document.querySelector('.footer').style.display='none';
            document.querySelector('.main').style.marginTop='0';
            document.querySelector('.main').style.marginBottom='0';
            document.querySelector('.main').style.height='100vh';
            document.querySelector('.main').style.padding='1.5rem';
        }

        const cacheBust='?_='+Date.now();
        // Build edition info for photography
        let editionInfo='';
        let showAvailability=true;
        if(type==='photography'){
            const parts=[];
            if(w.editionSize){
                const remaining=w.editionRemaining!==undefined?w.editionRemaining:w.editionSize;
                parts.push(`${remaining} of ${w.editionSize} available`);
                showAvailability=false;
            }
            if(w.artistProof)parts.push('artist proof available');
            if(w.signed!==false)parts.push('signed');
            if(parts.length)editionInfo=`<p class="edition-info">${parts.join(' · ')}</p>`;
        }
        c.innerHTML=`
            <a href="${back}" class="back-link mobile-back-arrow">Back</a>
            <img src="${w.image}${cacheBust}" alt="${w.title}" onerror="this.src='/images/symbol.svg'">
            <div class="single-work-meta">
                <div><h1>${w.title}</h1><p>${w.year} · ${w.medium} · ${w.dimensions}</p>${editionInfo}${showAvailability?`<p>${w.available?'Available':'Sold'}</p>`:''}</div>
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
