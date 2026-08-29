// Moments: a short video, autoplaying, silent until asked.
//
// Entries live in data/moments/*.json and are aggregated into data/moments.json
// by the admin. Each carries: id, title, video, poster, width, height, duration,
// hasAudio, order. The poster is the first frame, so the page paints at once and
// a reader whose phone refuses to autoplay still sees the moment.

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

// One moment, filling the page. Width and height are set so nothing shifts when
// the video arrives, and muted+playsinline is what every browser requires before
// it will start on its own.
function renderMoment(m){
    const w=m.width||1080,h=m.height||1920;
    let s='<p class="thoughts-segment"><a href="/moments.html">Moments</a></p>';
    s+='<div class="moment-frame">'
        +'<video class="moment-video" width="'+w+'" height="'+h+'"'
        +' src="'+momentEscape(m.video||'')+'"'
        +((m.poster||m.image)?' poster="'+momentEscape(m.poster||m.image)+'"':'')
        +' autoplay muted loop playsinline preload="metadata"></video>'
        +'</div>';
    s+='<p class="moment-title">'+momentEscape(m.title||'')+'</p>';
    if(m.hasAudio)s+='<p class="moment-sound"><button type="button" id="moment-sound">sound</button></p>';
    return s;
}

// Autoplay is refused in low power mode and on a first visit in some browsers.
// The poster is already showing, so a tap starts it rather than nothing happening.
function wireMoment(root){
    const v=root.querySelector('.moment-video');
    if(!v)return;
    v.addEventListener('click',()=>{v.paused?v.play().catch(()=>{}):v.pause()});
    const btn=root.querySelector('#moment-sound');
    if(btn)btn.addEventListener('click',()=>{
        v.muted=!v.muted;
        btn.textContent=v.muted?'sound':'silence';
        if(v.paused)v.play().catch(()=>{});
    });
    const play=v.play();
    if(play&&play.catch)play.catch(()=>{}); // refused; the poster stands in
}
