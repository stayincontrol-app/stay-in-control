(()=>{'use strict';
const TIMEOUT_MS=15000;
function install(){
  const client=window.AP207Supabase;
  const functions=client?.functions;
  if(!functions?.invoke||functions.invoke.__t2TimeoutGuard)return false;
  const original=functions.invoke.bind(functions);
  const guarded=async(name,options)=>{
    if(!['user-access-control','list-users'].includes(String(name||'')))return original(name,options);
    let timer;
    try{
      return await Promise.race([
        original(name,options),
        new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('REQUEST_TIMEOUT')),TIMEOUT_MS)})
      ]);
    }finally{clearTimeout(timer)}
  };
  guarded.__t2TimeoutGuard=true;
  functions.invoke=guarded;
  return true;
}
let attempts=0;
const timer=setInterval(()=>{attempts++;if(install()||attempts>80)clearInterval(timer)},250);
})();
