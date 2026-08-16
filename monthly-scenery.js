(()=>{'use strict';
const scenes=[
// Prioridade: praias dos Estados Unidos, Brasil e destinos internacionais.
'https://coastalmarinecharters.com/wp-content/uploads/2025/07/West-Palm-Beach.webp',
'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=84',
'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1800&q=84',
'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1800&q=84',
'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?auto=format&fit=crop&w=1800&q=84',
'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1800&q=84',
'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1800&q=84',
'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1800&q=84',
'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=84',
'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1800&q=84',
'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1800&q=84',
'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1800&q=84'
];
function rotationIndex(date){
  // A nova paisagem entra somente no dia 5 de cada mês.
  // Do dia 1 ao 4, mantém a paisagem do mês anterior.
  let year=date.getFullYear(),month=date.getMonth();
  if(date.getDate()<5){month-=1;if(month<0){month=11;year-=1;}}
  return Math.abs(year*12+month)%scenes.length;
}
function apply(){
  const d=new Date(),url=scenes[rotationIndex(d)];
  document.documentElement.style.setProperty('--stay-monthly-scene',`url("${url}")`);
  const banner=document.querySelector('.scenic-banner');
  if(banner){
    banner.style.backgroundImage=`url("${url}")`;
    banner.style.display='block';
    banner.style.height=window.innerWidth<=480?'120px':'150px';
    banner.style.marginBottom='20px';
    banner.style.borderRadius='18px';
    banner.style.backgroundPosition='center';
    banner.style.backgroundSize='cover';
    banner.style.backgroundRepeat='no-repeat';
    banner.innerHTML='';
  }
  document.body.style.backgroundImage=`linear-gradient(rgba(244,247,251,.72),rgba(244,247,251,.72)),url("${url}")`;
  document.body.style.backgroundPosition='center top';
  document.body.style.backgroundSize='cover';
  document.body.style.backgroundRepeat='no-repeat';
  document.body.style.backgroundAttachment='fixed';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();