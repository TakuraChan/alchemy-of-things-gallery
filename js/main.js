// Content cache to avoid redundant fetches
let contentCache=null;

// Rating system
const RATINGS_API='/.netlify/functions/ratings';
let ratingsCache={};

function getVisitorId(){
    let id=localStorage.getItem('alchemy_visitor');
    if(!id){
        id='v_'+Date.now()+'_'+Math.random().toString(36).substr(2,9);
        localStorage.setItem('alchemy_visitor',id);
    }
    return id;
}

function getUserRating(workId){
    const ratings=JSON.parse(localStorage.getItem('alchemy_ratings')||'{}');
    return ratings[workId];
}

function saveUserRating(workId,rating){
    const ratings=JSON.parse(localStorage.getItem('alchemy_ratings')||'{}');
    ratings[workId]=rating;
    localStorage.setItem('alchemy_ratings',JSON.stringify(ratings));
}

async function loadRatings(){
    try{
        const r=await fetch(RATINGS_API);
        if(r.ok)ratingsCache=await r.json();
    }catch(e){console.log('Ratings not available')}
}

async function submitRating(workId,rating){
    saveUserRating(workId,rating);
    try{
        const r=await fetch(RATINGS_API,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({workId,rating,visitorId:getVisitorId()})
        });
        if(r.ok){
            const data=await r.json();
            ratingsCache[workId]={avgSize:data.avgSize,count:data.count};
            return data;
        }
    }catch(e){console.log('Could not submit rating')}
    return null;
}

const HEART_SVG='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

function createHeartRatingUI(workId,isUnfinished){
    if(isUnfinished)return '';

    const userRating=getUserRating(workId);
    const ratingData=ratingsCache[workId];

    // If user already rated, show result
    if(userRating){
        const count=ratingData?.count||1;
        return `<div class="heart-rating">
            <div class="heart-rating-result">
                <svg viewBox="0 0 24 24"><path d="${HEART_SVG}"/></svg>
                ${count} ${count===1?'appreciation':'appreciations'}
            </div>
            <div class="heart-rating-thanks">Thank you</div>
        </div>`;
    }

    // Show 3 hearts to tap
    return `<div class="heart-rating" data-work="${workId}">
        <div class="heart-rating-hearts">
            <div class="heart-rating-heart" data-value="1"><svg viewBox="0 0 24 24"><path d="${HEART_SVG}"/></svg></div>
            <div class="heart-rating-heart" data-value="2"><svg viewBox="0 0 24 24"><path d="${HEART_SVG}"/></svg></div>
            <div class="heart-rating-heart" data-value="3"><svg viewBox="0 0 24 24"><path d="${HEART_SVG}"/></svg></div>
        </div>
        <div class="heart-rating-hint">Tap to appreciate</div>
    </div>`;
}

function initHeartRating(container){
    const ratingEl=container.querySelector('.heart-rating[data-work]');
    if(!ratingEl)return;

    const workId=ratingEl.dataset.work;
    const hearts=ratingEl.querySelectorAll('.heart-rating-heart');
    const hint=ratingEl.querySelector('.heart-rating-hint');

    // Preview on hover/touch
    const preview=(level)=>{
        hearts.forEach((h,i)=>{
            h.classList.toggle('preview',i<level);
        });
    };

    // Submit rating on click
    const rate=async(level)=>{
        // Map 1-3 to rating values (33, 66, 100)
        const rating=Math.round((level/3)*100);

        // Show filled state
        hearts.forEach((h,i)=>{
            h.classList.remove('preview');
            h.classList.toggle('filled',i<level);
        });
        hint.textContent='...';

        const result=await submitRating(workId,rating);
        const count=result?.count||1;

        // Update to result view
        ratingEl.innerHTML=`
            <div class="heart-rating-result">
                <svg viewBox="0 0 24 24"><path d="${HEART_SVG}"/></svg>
                ${count} ${count===1?'appreciation':'appreciations'}
            </div>
            <div class="heart-rating-thanks">Thank you</div>
        `;
    };

    hearts.forEach(heart=>{
        const val=parseInt(heart.dataset.value);
        heart.addEventListener('mouseenter',()=>preview(val));
        heart.addEventListener('mouseleave',()=>preview(0));
        heart.addEventListener('click',()=>rate(val));
        heart.addEventListener('touchend',(e)=>{e.preventDefault();rate(val);});
    });
}

// Load ratings on page load
loadRatings();
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
        const [colRes,workRes]=await Promise.all([fetch(collectionsFile),fetch(worksFile)]);
        const collections=await colRes.json();
        const allWorks=await workRes.json();

        if(!collections.length){c.innerHTML='<p class="empty">No collections yet.</p>';return}

        // Filter and sort collections
        const visible=collections.filter(col=>col.visible!==false&&col.active).sort((a,b)=>a.order-b.order);

        const cacheBust='?_='+Date.now();

        // Build HTML for each collection with its works
        let html='';
        visible.forEach(col=>{
            const isUnfinishedCol=col.isUnfinished||col.id==='unfinished';
            const colWorks=allWorks.filter(w=>w.collectionId===col.id).sort((a,b)=>(a.order||999)-(b.order||999));
            html+=`<section class="collection-section${isUnfinishedCol?' collection-unfinished':''}">
                <h2 class="collection-header${isUnfinishedCol?' collection-header-muted':''}">${col.name}</h2>
                <div class="collection-works">
                    ${colWorks.map(w=>{
                        const workIsUnfinished=w.unfinished||isUnfinishedCol;
                        return `<div class="work-thumb${workIsUnfinished?' work-unfinished':''}" data-work='${JSON.stringify(w).replace(/'/g,"&#39;")}' data-type="${type}">
                            <img src="${w.image}${cacheBust}" alt="${w.title||'Unfinished work'}" loading="lazy">
                            ${workIsUnfinished?'':`<span class="work-thumb-title">${w.title}</span>`}
                        </div>`;
                    }).join('')}
                    ${!colWorks.length?'<p class="empty-collection">new work coming soon</p>':''}
                </div>
            </section>`;
        });

        c.innerHTML=html;
        c.classList.add('collections-expanded');
        c.style.opacity='1';

        // Add lightbox for work details
        const lightbox=document.createElement('div');
        lightbox.className='work-lightbox';
        lightbox.innerHTML=`<div class="work-lightbox-content"></div><button class="lightbox-close">×</button>`;
        document.body.appendChild(lightbox);

        // Click handlers for work thumbnails
        c.querySelectorAll('.work-thumb').forEach(thumb=>{
            thumb.addEventListener('click',()=>{
                const w=JSON.parse(thumb.dataset.work);
                const t=thumb.dataset.type;
                // Check both unfinished flag AND if in unfinished collection
                const isUnfinished=w.unfinished||w.collectionId==='unfinished';
                let editionInfo='';
                if(t==='photography'&&w.editionSize){
                    const remaining=w.editionRemaining!==undefined?w.editionRemaining:w.editionSize;
                    editionInfo=`<p>${remaining} of ${w.editionSize} available</p>`;
                }
                const content=lightbox.querySelector('.work-lightbox-content');
                content.innerHTML=`
                    <img src="${w.image}${cacheBust}" alt="${w.title||'Unfinished work'}" style="${isUnfinished?'filter:grayscale(90%);opacity:0.9':''}">
                    <div class="work-lightbox-info">
                        ${isUnfinished?'':`<h1>${w.title}</h1>`}
                        ${isUnfinished?'':`<p>${w.year||''} · ${w.medium||''} · ${w.dimensions||''}</p>`}
                        ${editionInfo}
                        ${isUnfinished?'<p style="font-style:italic;color:#888">Work in progress</p>':`<p>${w.available?'Available':'Sold'}</p>`}
                        ${!isUnfinished&&w.available?`<a href="/inquire.html?work=${encodeURIComponent(w.title)}" class="inquire-btn">Inquire</a>`:''}
                        ${createHeartRatingUI(w.id,isUnfinished)}
                    </div>
                `;
                lightbox.classList.add('active');
                // Initialize heart rating interaction
                initHeartRating(content);
            });
        });

        lightbox.addEventListener('click',e=>{
            if(e.target===lightbox||e.target.classList.contains('lightbox-close')){
                lightbox.classList.remove('active');
            }
        });

    }catch{c.innerHTML='<p class="empty">Error loading.</p>'}
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

        // Add lightbox functionality
        const img=c.querySelector('img');
        const lightbox=document.createElement('div');
        lightbox.className='lightbox';
        lightbox.innerHTML=`<img src="${w.image}${cacheBust}" alt="${w.title}"><button class="lightbox-close" aria-label="Close">×</button>`;
        document.body.appendChild(lightbox);

        img.addEventListener('click',()=>lightbox.classList.add('active'));
        lightbox.addEventListener('click',(e)=>{
            if(e.target===lightbox||e.target.classList.contains('lightbox-close')){
                lightbox.classList.remove('active');
            }
        });
    }catch{c.innerHTML='<p class="empty">Error loading work.</p>'}
}
