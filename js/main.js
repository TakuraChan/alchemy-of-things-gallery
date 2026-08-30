// The document scrolls on a phone, so anything laid over it holds it still.
function lockScroll(on){document.body.classList.toggle('locked',on)}

// What is laid over the page closes the way a phone expects: a swipe down, or
// Escape at a desk. No horizontal gesture anywhere — iOS already uses an edge
// swipe for back, and the galleries here scroll sideways; taking that over would
// fight both. The name at the top of the page is the way up instead.
function dismissible(el,close){
    if(!el)return;
    let y0=null,tracking=false;
    el.addEventListener('touchstart',e=>{
        if(e.touches.length!==1)return;
        // Only from the top of anything that scrolls inside, or it fights the scroll.
        const box=e.target.closest&&e.target.closest('[data-scrolls],.work-lightbox-content,.portfolio-modal-content');
        if(box&&box.scrollTop>4)return;
        tracking=true;y0=e.touches[0].clientY;
    },{passive:true});
    el.addEventListener('touchend',e=>{
        if(!tracking)return;
        tracking=false;
        const dy=e.changedTouches[0].clientY-y0;
        if(dy>70)close();
    },{passive:true});
    document.addEventListener('keydown',e=>{
        if(e.key==='Escape'&&el.classList.contains('active'))close();
    });
}

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
        if(r.ok){
            const data=await r.json();
            // The function reports storage trouble as {error}; ignore it rather than
            // treating the error object as rating data.
            ratingsCache=(data&&!data.error)?data:{};
        }
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
            if(data&&data.error)return null;
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
        // A tap, not a scroll that happened to begin on a heart: with the page
        // scrolling under the finger, a swipe from here would otherwise appreciate.
        let start=null;
        heart.addEventListener('touchstart',(e)=>{const t=e.touches[0];start=t?{x:t.clientX,y:t.clientY}:null},{passive:true});
        heart.addEventListener('touchend',(e)=>{
            const t=e.changedTouches[0];
            if(start&&t&&Math.abs(t.clientY-start.y)+Math.abs(t.clientX-start.x)>12)return;
            e.preventDefault();
            rate(val);
        });
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

    // Try category-specific file first, then fallback to legacy names
    if(type==='paintings'){
        // Try paintings-collections.json first, fallback to collections.json
        const tryNew=await fetch('/data/paintings-collections.json');
        collectionsFile=tryNew.ok?'/data/paintings-collections.json':'/data/collections.json';
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
        const collections=colRes.ok?await colRes.json().catch(()=>[]):[];
        const allWorks=workRes.ok?await workRes.json().catch(()=>[]):[];

        if(!collections.length){c.innerHTML='<p class="empty">new work coming soon</p>';c.style.opacity='1';return}

        // Filter and sort collections (unfinished always last)
        const visible=collections.filter(col=>col.visible!==false&&col.active).sort((a,b)=>{
            const aUnfinished=a.isUnfinished||a.id==='unfinished';
            const bUnfinished=b.isUnfinished||b.id==='unfinished';
            if(aUnfinished&&!bUnfinished)return 1;
            if(!aUnfinished&&bUnfinished)return -1;
            return a.order-b.order;
        });

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
                        const encoded=JSON.stringify(w).replace(/'/g,"&#39;");
                        if(w.type==='text'&&!w.image){
                            return `<div class="work-thumb work-thumb-text" data-work='${encoded}' data-type="${type}"><span class="work-thumb-title">${w.title}</span></div>`;
                        }
                        return `<div class="work-thumb${workIsUnfinished?' work-unfinished':''}" data-work='${encoded}' data-type="${type}">
                            ${w.image?`<img src="${w.image}${cacheBust}" alt="${w.title||'Unfinished work'}" loading="lazy">`:''}
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
        const closeWorkLightbox=()=>{lightbox.classList.remove('active');lockScroll(false)};
        dismissible(lightbox,closeWorkLightbox);

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
                const isTextWork=w.type==='text';
                const content=lightbox.querySelector('.work-lightbox-content');
                content.innerHTML=`
                    ${w.image?`<img src="${w.image}${cacheBust}" alt="${w.title||''}" style="${isUnfinished?'filter:grayscale(90%);opacity:0.9':''}">`:'' }
                    ${isTextWork&&w.text?`<div class="work-lightbox-text">${w.text.replace(/\n/g,'<br>')}</div>`:''}
                    <div class="work-lightbox-info">
                        ${!isUnfinished&&w.title?`<h1>${w.title}</h1>`:''}
                        ${isTextWork||isUnfinished?'':(`<p>${w.year||''} · ${w.medium||''} · ${w.dimensions||''}</p>`)}
                        ${editionInfo}
                        ${isUnfinished?'<p style="font-style:italic;color:#888">Work in progress</p>':isTextWork?'':(`<p>${w.available?'Available':'Sold'}</p>`)}
                        ${!isUnfinished&&!isTextWork&&w.available?`<a href="/inquire.html?work=${encodeURIComponent(w.title)}&id=${encodeURIComponent(w.id||'')}&type=${encodeURIComponent(t)}${w.collectionId?'&collection='+encodeURIComponent(w.collectionId):''}" class="inquire-btn">Inquire</a>`:''}
                        ${isTextWork?'':createHeartRatingUI(w.id,isUnfinished)}
                    </div>
                `;
                lightbox.classList.add('active');
                lockScroll(true);
                // Initialize heart rating interaction
                initHeartRating(content);
            });
        });

        lightbox.addEventListener('click',e=>{
            if(e.target===lightbox||e.target.classList.contains('lightbox-close')){
                lightbox.classList.remove('active');
                lockScroll(false);
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
        back='/paintings.html';
        backText='Paintings';
    }else if(type==='photography'){
        back='/photography.html';
        backText='Photography';
    }else{
        back='/'+type+'.html';
        // Capitalize first letter
        backText=type.charAt(0).toUpperCase()+type.slice(1);
    }

    // One line at the top, the same one every page below the hub carries.
    const ascent=document.getElementById('ascent');
    if(ascent)ascent.outerHTML=ascentLine(backText,back,true);

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
            c.innerHTML=`<div class="collection-soon"><p>${comingSoonText}</p></div>`;
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
        backBase='/paintings.html';
    }else if(type==='photography'){
        backBase='/photography.html';
    }else{
        backBase='/'+type+'.html';
    }

    const back=collectionId?`/collection.html?id=${collectionId}&type=${type}`:backBase;
    let backText=type.charAt(0).toUpperCase()+type.slice(1);

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
        // The name of what this work belongs to, when it belongs to one.
        if(collectionId){
            try{
                const cr=await fetch('/data/'+(type==='paintings'?'paintings-collections':type==='photography'?'observations':type+'-collections')+'.json?_='+Date.now());
                if(cr.ok){
                    const cols=await cr.json();
                    const col=Array.isArray(cols)?cols.find(x=>x&&x.id===collectionId):null;
                    if(col&&col.name)backText=col.name;
                }
            }catch(e){}
        }

        // Hide the footer on mobile so the work has the page
        if(window.innerWidth<=768){
            document.querySelector('.footer').style.display='none';
            document.querySelector('.main').style.marginTop='0';
            document.querySelector('.main').style.marginBottom='0';
            // A floor, not a ceiling: a fixed 100vh is taller than the visible
            // window on a phone, so the meta below the image became unreachable.
            document.querySelector('.main').style.minHeight='100dvh';
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
            ${ascentLine(backText,back,true)}
            <img class="work-full" src="${w.image}${cacheBust}" alt="${w.title}" onerror="this.src='/images/symbol.svg'">
            <div class="single-work-meta">
                <div><h1>${w.title}</h1><p>${w.year} · ${w.medium} · ${w.dimensions}</p>${editionInfo}${showAvailability?`<p>${w.available?'Available':'Sold'}</p>`:''}</div>
                ${w.available?`<a href="/inquire.html?work=${encodeURIComponent(w.title)}&id=${encodeURIComponent(w.id||id)}&type=${encodeURIComponent(type)}${collectionId?'&collection='+encodeURIComponent(collectionId):''}" class="inquire-btn">Inquire</a>`:''}
            </div>
        `;

        // Add lightbox functionality. Name the work's own image: the ascent line
        // above it carries the symbol, and a bare querySelector('img') took that.
        const img=c.querySelector('img.work-full');
        const lightbox=document.createElement('div');
        lightbox.className='lightbox';
        lightbox.innerHTML=`<img src="${w.image}${cacheBust}" alt="${w.title}"><button class="lightbox-close" aria-label="Close">×</button>`;
        document.body.appendChild(lightbox);

        const closeImage=()=>{lightbox.classList.remove('active');lockScroll(false)};
        dismissible(lightbox,closeImage);
        img.addEventListener('click',()=>{lightbox.classList.add('active');lockScroll(true)});
        lightbox.addEventListener('click',(e)=>{
            if(e.target===lightbox||e.target.classList.contains('lightbox-close')){
                lightbox.classList.remove('active');
                lockScroll(false);
            }
        });
    }catch{c.innerHTML='<p class="empty">Error loading work.</p>'}
}
