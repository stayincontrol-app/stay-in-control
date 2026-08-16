(()=>{'use strict';const scenes=[
'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1800&q=82',
'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1800&q=82',
'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1800&q=82',
'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1800&q=82',
'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1800&q=82',
'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1800&q=82',
'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=82',
'https://coastalmarinecharters.com/wp-content/uploads/2025/07/West-Palm-Beach.webp',
'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1800&q=82',
'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1800&q=82',
'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1800&q=82',
'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=82'];
function apply(){const d=new Date(),idx=(d.getFullYear()*12+d.getMonth())%scenes.length,url=scenes[idx];document.documentElement.style.setProperty('--stay-monthly-scene',`url("${url}")`);const banner=document.querySelector('.scenic-banner');if(banner){banner.style.backgroundImage=`url("${url}")`;banner.style.display='block';banner.style.height=window.innerWidth<=480?'120px':'150px';banner.style.marginBottom='20px';banner.style.borderRadius='18px';banner.style.backgroundPosition='center';banner.style.backgroundSize='cover';banner.style.backgroundRepeat='no-repeat';banner.innerHTML=''}document.body.style.backgroundImage=`linear-gradient(rgba(244,247,251,.72),rgba(244,247,251,.72)),url("${url}")`;document.body.style.backgroundPosition='center top';document.body.style.backgroundSize='cover';document.body.style.backgroundRepeat='no-repeat';document.body.style.backgroundAttachment='fixed'}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply()})();