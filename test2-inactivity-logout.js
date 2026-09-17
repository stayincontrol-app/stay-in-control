(()=>{'use strict';
const TIMEOUT=5*60*1000,ACTIVITY_KEY='system-control-test2-last-activity-v1',AUTH='ap207-auth-profile-v1',SB_PREFIX='sb-cwtpeabebkoveachrclo-';
if(/\/test2-login\.html$/.test(location.pathname))return;
let timer=null,loggingOut=false,lastWrite=0;
function clearLocalAuth(){try{localStorage.removeItem(AUTH);localStorage.removeItem(ACTIVITY_KEY);const keys=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(SB_PREFIX))keys.push(k)}keys.forEach(k=>localStorage.removeItem(k))}catch{}try{sessionStorage.removeItem(AUTH);sessionStorage.removeItem(ACTIVITY_KEY)}catch{}}
async function logout(){if(loggingOut)return;loggingOut=true;clearTimeout(timer);try{const c=window.AP207Supabase;if(c?.auth?.signOut)await Promise.race([c.auth.signOut(),new Promise(r=>setTimeout(r,900))])}catch{}clearLocalAuth();location.replace('./test2-login.html')}
function storedLast(){const n=Number(localStorage.getItem(ACTIVITY_KEY)||0);return Number.isFinite(n)?n:0}
function schedule(){clearTimeout(timer);const last=storedLast()||Date.now(),remaining=TIMEOUT-(Date.now()-last);if(remaining<=0){logout();return}timer=setTimeout(check,remaining+25)}
function check(){const last=storedLast();if(!last||Date.now()-last>=TIMEOUT){logout();return}schedule()}
function activity(){if(loggingOut)return;const now=Date.now();if(now-lastWrite>1000){lastWrite=now;try{localStorage.setItem(ACTIVITY_KEY,String(now))}catch{}}schedule()}
function boot(){const last=storedLast();if(last&&Date.now()-last>=TIMEOUT){logout();return}if(!last)try{localStorage.setItem(ACTIVITY_KEY,String(Date.now()))}catch{}['pointerdown','touchstart','keydown','scroll','click'].forEach(type=>window.addEventListener(type,activity,{passive:true,capture:true}));document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});window.addEventListener('pageshow',check);window.addEventListener('storage',e=>{if(e.key===ACTIVITY_KEY)check()});schedule()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();