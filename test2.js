(()=>{'use strict';
const NAME='System Control Test 2.0',LANG_KEY='system-control-test2-suite-v1',SB_PREFIX='sb-cwtpeabebkoveachrclo-';
function hasSessionToken(){try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!k||!k.startsWith(SB_PREFIX))continue;const raw=localStorage.getItem(k);if(!raw)continue;try{const v=JSON.parse(raw);if(v?.access_token||v?.currentSession?.access_token)return true}catch{if(raw.includes('access_token'))return true}}}catch{}return false}
function specialAuthFlow(){try{const q=new URLSearchParams(location.search||''),h=new URLSearchParams((location.hash||'').replace(/^#/,'')),t=q.get('type')||h.get('type');return t==='invite'||t==='recovery'||q.get('invite')==='1'||h.get('invite')==='1'}catch{return false}}
if(!/\/test2-login\.html$/.test(location.pathname)&&!specialAuthFlow()&&!hasSessionToken()){location.replace('./test2-login.html');return}
document.documentElement.lang='pt-BR';document.title=NAME;
const supportLabels={'pt-BR':['Central de Atendimento','Central de Atendimento pelo WhatsApp'],en:['Support Center','Support Center on WhatsApp'],es:['Centro de Atención','Centro de Atención por WhatsApp'],fr:["Centre d’assistance","Centre d’assistance sur WhatsApp"],de:['Support-Center','Support-Center über WhatsApp'],it:['Centro Assistenza','Centro Assistenza su WhatsApp'],'pt-PT':['Centro de Atendimento','Centro de Atendimento pelo WhatsApp'],'zh-CN':['客服中心','WhatsApp 客服中心'],ja:['サポートセンター','WhatsApp サポートセンター'],ko:['고객 지원 센터','WhatsApp 고객 지원 센터']};
function currentLang(){try{return JSON.parse(localStorage.getItem(LANG_KEY)||'{}').language||'pt-BR'}catch{return'pt-BR'}}
function updateSupport(){const a=document.querySelector('.t2-support');if(!a)return;const pair=supportLabels[currentLang()]||supportLabels['pt-BR'];const b=a.querySelector('b');if(b)b.textContent=pair[0];a.setAttribute('aria-label',pair[1])}
function loadScript(src,key){if(document.querySelector('script[data-t2="'+key+'"]'))return;const s=document.createElement('script');s.src=src;s.defer=true;s.dataset.t2=key;document.body.append(s)}
function loadStableSuite(){
  if(!document.querySelector('link[data-t2-suite]')){const l=document.createElement('link');l.rel='stylesheet';l.href='./test2-suite.css';l.dataset.t2Suite='1';document.head.append(l)}
  loadScript('./test2-suite.js','suite-core');
  setTimeout(()=>{
    loadScript('./test2-i18n.js','i18n-core');
    loadScript('./test2-banner-manager.js','banner-manager');
    loadScript('./test2-sponsored-floating.js','sponsored-floating');
    loadScript('./test2-features.js','features');
    loadScript('./test2-access.js','access');
    loadScript('./test2-report.js','report');
    loadScript('./test2-user-controls.js','user-controls');
  },900);
}
document.addEventListener('DOMContentLoaded',()=>{
  document.body.classList.add('test2');
  if(!document.querySelector('.test2-badge')){const badge=document.createElement('div');badge.className='test2-badge';badge.textContent='TEST 2.0';document.body.append(badge)}
  document.querySelectorAll('.ap207-auth-card > p:first-child').forEach(el=>el.textContent=NAME);
  if(!document.querySelector('.t2-support')){const support=document.createElement('a');support.className='t2-support';support.href='https://wa.me/15612756810';support.target='_blank';support.rel='noopener noreferrer';support.innerHTML='<span>◉</span><b></b>';document.body.append(support)}
  updateSupport();
  document.addEventListener('change',e=>{if(e.target&&e.target.id==='t2AppLanguage')setTimeout(updateSupport,20)});
  const h=document.querySelector('.page-header h1');if(h)h.dataset.testEnvironment='true';
  loadStableSuite();
});
window.SystemControlTest2={name:NAME,supportPhone:'+1 (561) 275-6810',runtimeMode:'stable-core-with-visual-features-and-i18n'};
})();