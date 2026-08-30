(()=>{'use strict';
const K='system-control-test2-suite-v1';
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||'null')||f}catch{return f}};
const clean=(v,n=300)=>String(v||'').trim().slice(0,n);
function safeUrl(v){try{const raw=String(v||'');if(/^data:(?:image\/(?:png|jpe?g|webp|gif)|application\/pdf);base64,/i.test(raw))return raw;const u=new URL(raw);return /^https?:$/.test(u.protocol)?u.href:''}catch{return''}}
function isPdf(v){return /^data:application\/pdf/i.test(String(v||''))||/\.pdf(?:$|\?)/i.test(String(v||''))}
function eligibleSponsored(){const today=new Date().toISOString().slice(0,10),s=read(K,{}),list=Array.isArray(s.banners)?s.banners:[];return list.filter(b=>b&&b.sponsored===true&&b.active!==false&&(!b.startDate||today>=b.startDate)&&(!b.endDate||today<=b.endDate))}
function ensureCss(){if(document.getElementById('t2FloatingSponsorCss'))return;const s=document.createElement('style');s.id='t2FloatingSponsorCss';s.textContent=`
#t2FloatingSponsor{position:fixed;right:18px;top:116px;width:min(270px,24vw);aspect-ratio:1/1;z-index:2147482000;border-radius:18px;overflow:hidden;box-shadow:0 18px 48px rgba(15,23,42,.28);background:#eef2ff;display:none}
#t2FloatingSponsor.is-visible{display:block}
#t2FloatingSponsor .t2-float-link{display:block;width:100%;height:100%;position:relative;background-size:cover;background-position:center;text-decoration:none;color:#fff;overflow:hidden}
#t2FloatingSponsor .t2-float-pdf{position:absolute;inset:0;width:100%;height:100%;border:0;background:#fff}
#t2FloatingSponsor .t2-float-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.04) 35%,rgba(0,0,0,.75) 100%)}
#t2FloatingSponsor .t2-float-tag{position:absolute;left:10px;top:10px;background:#fff;color:#111827;border-radius:999px;padding:5px 8px;font-size:10px;font-weight:900;letter-spacing:.04em}
#t2FloatingSponsor .t2-float-copy{position:absolute;left:12px;right:12px;bottom:12px;z-index:2;background:rgba(17,24,39,.78);border-radius:12px;padding:10px 11px}
#t2FloatingSponsor .t2-float-copy strong{display:block;font-size:15px;line-height:1.2}
#t2FloatingSponsor .t2-float-copy small{display:block;margin-top:4px;line-height:1.25;color:#f8fafc}
#t2FloatingSponsor .t2-float-close{position:absolute;right:8px;top:8px;z-index:3;border:0;width:28px;height:28px;border-radius:50%;background:rgba(17,24,39,.78);color:#fff;font-size:18px;line-height:28px;cursor:pointer}
@media(max-width:800px){#t2FloatingSponsor{right:10px;top:auto;bottom:92px;width:min(190px,42vw);border-radius:15px}}
@media(max-width:430px){#t2FloatingSponsor{width:150px;right:8px;bottom:88px}.t2-float-copy small{display:none!important}}
`;document.head.append(s)}
let idx=0,currentId='',shownUntil=0,nextDue=0,closedUntil=0;
function host(){let h=document.getElementById('t2FloatingSponsor');if(h)return h;h=document.createElement('aside');h.id='t2FloatingSponsor';h.setAttribute('aria-label','Publicidade patrocinada');document.body.append(h);return h}
function hideInlineSponsored(){const stage=document.getElementById('t2SponsoredBannerStage');if(!stage)return;const sponsored=Boolean(stage.querySelector('.t2-ad-sponsored'));stage.style.display=sponsored?'none':''}
function render(b){const h=host();h.replaceChildren();const link=document.createElement(b.link?'a':'div');link.className='t2-float-link';if(b.link){link.href=safeUrl(b.link)||'#';link.target='_blank';link.rel='noopener noreferrer'}const src=safeUrl(b.imageUrl);if(src){if(isPdf(src)){const obj=document.createElement('object');obj.className='t2-float-pdf';obj.data=src+'#toolbar=0&navpanes=0&scrollbar=0&view=Fit';obj.type='application/pdf';link.append(obj)}else link.style.backgroundImage=`url("${src.replace(/"/g,'')}")`}const shade=document.createElement('span');shade.className='t2-float-shade';const tag=document.createElement('span');tag.className='t2-float-tag';tag.textContent='PATROCINADO';const copy=document.createElement('span');copy.className='t2-float-copy';const title=document.createElement('strong');title.textContent=clean(b.title)||'Publicidade';const sub=document.createElement('small');sub.textContent=clean(b.subtitle)||'';copy.append(title,sub);link.append(shade,tag,copy);const close=document.createElement('button');close.type='button';close.className='t2-float-close';close.setAttribute('aria-label','Fechar anúncio temporariamente');close.textContent='×';close.onclick=e=>{e.preventDefault();e.stopPropagation();closedUntil=Date.now()+60000;h.classList.remove('is-visible')};h.append(link,close);h.classList.add('is-visible')}
function tick(){hideInlineSponsored();const list=eligibleSponsored(),t=Date.now(),h=host();if(!list.length||t<closedUntil){h.classList.remove('is-visible');return}if(currentId&&t<shownUntil)return;if(t<nextDue){h.classList.remove('is-visible');return}const b=list[idx%list.length];idx=(idx+1)%Math.max(1,list.length);currentId=String(b.id||'');const duration=Math.max(3,Number(b.durationSeconds)||5)*1000,interval=Math.max(5,Number(b.intervalSeconds)||10)*1000;shownUntil=t+duration;nextDue=t+interval;render(b);setTimeout(()=>{if(Date.now()>=shownUntil)h.classList.remove('is-visible')},duration+30)}
function boot(){ensureCss();host();setInterval(tick,1000);tick();window.addEventListener('t2-banners-updated',()=>{currentId='';shownUntil=0;nextDue=0;tick()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();