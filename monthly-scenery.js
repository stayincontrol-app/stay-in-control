(()=>{'use strict';
// Arquivo 1: coleção principal do banner. Novos arquivos podem ser adicionados depois,
// inclusive campanhas patrocinadas, sem alterar o restante do aplicativo.
const archives={
  arquivo1:[
    {name:'Riviera Beach / Singer Island',url:'https://coastalmarinecharters.com/wp-content/uploads/2025/07/West-Palm-Beach.webp'},
    {name:'Algarve',url:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=84'},
    {name:'Curitiba',url:'https://images.unsplash.com/photo-1598970605070-a38a6ccd3a2d?auto=format&fit=crop&w=1800&q=84'},
    {name:'Rio de Janeiro',url:'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1800&q=84'},
    {name:'São Paulo',url:'https://images.unsplash.com/photo-1543059080-f9b1272213d5?auto=format&fit=crop&w=1800&q=84'},
    {name:'Brasília',url:'https://images.unsplash.com/photo-1602984562211-73e0cdecd789?auto=format&fit=crop&w=1800&q=84'},
    {name:'Florianópolis',url:'https://images.unsplash.com/photo-1598301257982-0cf014dabbcd?auto=format&fit=crop&w=1800&q=84'},
    {name:'Salvador',url:'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=1800&q=84'},
    {name:'Foz do Iguaçu',url:'https://images.unsplash.com/photo-1565708097881-bbf4ecf47cc1?auto=format&fit=crop&w=1800&q=84'},
    {name:'Istambul',url:'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1800&q=84'},
    {name:'Paris',url:'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1800&q=84'},
    {name:'Nova York',url:'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1800&q=84'}
  ]
};
const ACTIVE_ARCHIVE='arquivo1';
const ROTATE_MS=10000;
let current=0,timer=null;
function sceneList(){return archives[ACTIVE_ARCHIVE]||[]}
function setBanner(scene){
  if(!scene)return;
  const banner=document.querySelector('.scenic-banner');
  if(!banner)return;
  banner.style.backgroundImage=`url("${scene.url}")`;
  banner.style.display='block';
  banner.style.height=window.innerWidth<=480?'120px':'150px';
  banner.style.marginBottom='20px';
  banner.style.borderRadius='18px';
  banner.style.backgroundPosition='center';
  banner.style.backgroundSize='cover';
  banner.style.backgroundRepeat='no-repeat';
  banner.style.transition='background-image .5s ease-in-out,opacity .35s ease';
  banner.setAttribute('aria-label',`Paisagem do banner: ${scene.name}`);
  banner.dataset.archive=ACTIVE_ARCHIVE;
  banner.dataset.scene=scene.name;
  banner.innerHTML='';
}
function rotate(){const list=sceneList();if(!list.length)return;current=(current+1)%list.length;setBanner(list[current]);}
function apply(){
  const list=sceneList();if(!list.length)return;
  current=0;setBanner(list[current]);
  // O fundo permanece na primeira imagem do Arquivo 1; somente o banner gira.
  const bg=list[0].url;
  document.body.style.backgroundImage=`linear-gradient(rgba(244,247,251,.72),rgba(244,247,251,.72)),url("${bg}")`;
  document.body.style.backgroundPosition='center top';
  document.body.style.backgroundSize='cover';
  document.body.style.backgroundRepeat='no-repeat';
  document.body.style.backgroundAttachment='fixed';
  if(timer)clearInterval(timer);
  timer=setInterval(rotate,ROTATE_MS);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();