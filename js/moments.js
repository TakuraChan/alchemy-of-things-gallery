// Moments: a short video, autoplaying, silent until asked.
//
// Entries live in data/moments/*.json and are aggregated into data/moments.json
// by the admin. Each carries: id, title, video, image (the poster, the first
// frame of the published window), width, height, duration, hasAudio, order.
//
// The moment page holds nothing but the moment: no symbol, no footer. You move
// between moments by swiping, and up to the list of names. The order is shuffled
// once per visit, so what comes next is not the order they were uploaded in.

function momentEscape(s){
    return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

function momentHref(m){
    return '/moments/entry.html?id='+encodeURIComponent(m.id);
}

async function loadMoments(){
    try{
        const r=await fetch('/data/moments.json?_='+Date.now());
        if(!r.ok)return [];
        const list=await r.json();
        if(!Array.isArray(list))return [];
        return list.sort((a,b)=>(a.order??999)-(b.order??999));
    }catch{return []}
}

// A horn: the waves appear when the sound is on and fade when it is not.
const SOUND_ICON='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
    +'<path d="M4 9.5h3.6L12 5.6v12.8L7.6 14.5H4z"/>'
    +'<path class="wave" d="M15.4 9.9a3.6 3.6 0 0 1 0 4.2"/>'
    +'<path class="wave" d="M18 7.7a7.2 7.2 0 0 1 0 8.6"/>'
    +'</svg>';

function renderMoment(m){
    const w=m.width||1080,h=m.height||1920;
    const poster=m.poster||m.image||'';
    let s=ascentLine('Moments','/moments.html',true);
    s+='<div class="moment-frame">'
        +'<video class="moment-video" width="'+w+'" height="'+h+'"'
        +' src="'+momentEscape(m.video||'')+'"'
        +(poster?' poster="'+momentEscape(poster)+'"':'')
        +' autoplay muted loop playsinline preload="metadata"></video>'
        +'</div>';
    s+='<p class="moment-title">'+momentEscape(m.title||'')+'</p>';
    // Always present, hidden when this moment carries no sound — the next one
    // swiped to may carry it, and the button has to be there when it does.
    s+='<p class="moment-sound"'+(m.hasAudio?'':' hidden')+'><button type="button" id="moment-sound"'
        +' aria-pressed="false" aria-label="Turn sound on">'+SOUND_ICON+'</button></p>';
    return s;
}

// Shuffled once, then kept for the visit: swiping back should return you to the
// moment you came from, not to another random one.
function momentOrder(moments){
    const ids=moments.map(m=>m.id);
    const KEY='alchemy_moment_order';
    try{
        const saved=JSON.parse(sessionStorage.getItem(KEY)||'null');
        if(Array.isArray(saved)&&saved.length===ids.length&&saved.every(id=>ids.indexOf(id)>=0))return saved;
    }catch{}
    for(let i=ids.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [ids[i],ids[j]]=[ids[j],ids[i]];
    }
    try{sessionStorage.setItem(KEY,JSON.stringify(ids))}catch{}
    return ids;
}

function wireMoment(root,moments,startId){
    const order=momentOrder(moments||[]);
    const at=id=>order.indexOf(id);
    let currentId=startId;

    const video=()=>root.querySelector('.moment-video');
    const title=()=>root.querySelector('.moment-title');
    const button=()=>root.querySelector('#moment-sound');
    const find=id=>(moments||[]).find(m=>m.id===id);

    // Once sound has been asked for it stays asked for, even across a moment
    // that carries none.
    let soundWanted=false;
    const setSound=(on)=>{
        const v=video(),b=button();
        if(!v||!b)return;
        v.muted=!on;
        b.setAttribute('aria-pressed',on?'true':'false');
        b.setAttribute('aria-label',on?'Turn sound off':'Turn sound on');
        b.classList.toggle('on',on);
        if(on&&v.paused)v.play().catch(()=>{});
    };

    // The poster of what comes next, so a swipe paints at once.
    const warm=(id)=>{const m=find(id);if(m&&(m.poster||m.image))new Image().src=m.poster||m.image};

    const show=(id,push)=>{
        const m=find(id);
        if(!m||id===currentId)return;
        const v=video();
        root.classList.add('swapping');
        setTimeout(()=>{
            currentId=id;
            const poster=m.poster||m.image||'';
            if(v){
                v.pause();
                if(poster)v.setAttribute('poster',poster); else v.removeAttribute('poster');
                v.width=m.width||1080;v.height=m.height||1920;
                v.src=m.video||'';
                v.load();
                v.play().catch(()=>{});
            }
            if(title())title().textContent=m.title||'';
            const holder=root.querySelector('.moment-sound');
            if(holder)holder.hidden=!m.hasAudio;
            setSound(soundWanted&&!!m.hasAudio);
            document.title=(m.title||'Moments')+' — Alchemy of Things';
            if(push)history.pushState({momentId:id},'',momentHref(m));
            root.classList.remove('swapping');
            const i=at(id);
            warm(order[(i+1)%order.length]);warm(order[(i-1+order.length)%order.length]);
        },300);
    };

    const step=(d)=>{
        if(order.length<2)return;
        const i=at(currentId);
        if(i<0)return;
        show(order[(i+d+order.length)%order.length],true);
    };
    const up=()=>{location.href='/moments.html'};

    // A tap plays or pauses; a swipe moves. Autoplay is refused in Low Power
    // Mode and the poster stands in, so a tap has to be able to start it.
    let x0=0,y0=0,moved=false,tracking=false;
    root.addEventListener('touchstart',e=>{
        if(e.touches.length!==1)return;
        tracking=true;moved=false;x0=e.touches[0].clientX;y0=e.touches[0].clientY;
    },{passive:true});
    root.addEventListener('touchmove',e=>{
        if(!tracking)return;
        const dx=e.touches[0].clientX-x0,dy=e.touches[0].clientY-y0;
        if(Math.abs(dx)>10||Math.abs(dy)>10)moved=true;
    },{passive:true});
    root.addEventListener('touchend',e=>{
        if(!tracking)return;
        tracking=false;
        const t=e.changedTouches[0];
        const dx=t.clientX-x0,dy=t.clientY-y0;
        if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)){step(dx<0?1:-1);return}
        if(dy<-60&&Math.abs(dy)>Math.abs(dx)){up();return}
    },{passive:true});

    const v0=video();
    if(v0)v0.addEventListener('click',()=>{
        if(moved){moved=false;return}
        v0.paused?v0.play().catch(()=>{}):v0.pause();
    });

    const b0=button();
    if(b0)b0.addEventListener('click',()=>{soundWanted=!!(video()&&video().muted);setSound(soundWanted)});

    document.addEventListener('keydown',e=>{
        if(e.key==='ArrowRight')step(1);
        else if(e.key==='ArrowLeft')step(-1);
        else if(e.key==='ArrowUp'||e.key==='Escape')up();
    });

    window.addEventListener('popstate',()=>{
        const id=new URLSearchParams(location.search).get('id');
        if(id&&id!==currentId&&find(id))show(id,false);
    });

    const i=at(currentId);
    if(i>=0){warm(order[(i+1)%order.length]);warm(order[(i-1+order.length)%order.length])}
    if(v0){const p=v0.play();if(p&&p.catch)p.catch(()=>{})}
}
