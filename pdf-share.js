(()=>{'use strict';
function cleanName(v){return String(v||'Stay-in-Control').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'').slice(0,70)||'Stay-in-Control'}
function stripControls(root){root.querySelectorAll('button,select,input,form,.page-share-panel,.report-share-panel,.home-share-wrap,.calendar-share-wrap,.reservation-page-toolbar,.expense-page-toolbar,.report-page-toolbar,.no-print').forEach(x=>x.remove());root.querySelectorAll('.reservation-page-hidden,.expense-page-hidden,.report-page-hidden').forEach(x=>{x.classList.remove('reservation-page-hidden','expense-page-hidden','report-page-hidden');x.hidden=false});return root}
function absoluteHref(href){try{return new URL(href,location.href).href}catch{return href}}
function headMarkup(){let out='<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">';document.querySelectorAll('link[rel="stylesheet"]').forEach(l=>{if(l.href)out+=`<link rel="stylesheet" href="${absoluteHref(l.getAttribute('href')||l.href)}">`});document.querySelectorAll('style').forEach(s=>{out+=`<style>${s.textContent||''}</style>`});out+=`<style>
@page{size:auto;margin:12mm}
html,body{background:#fff!important;color:#172033!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
body{margin:0!important;padding:0!important;overflow:visible!important}
.stay-print-document{max-width:980px;margin:0 auto}
.stay-print-page{break-after:page;page-break-after:always;position:relative!important;display:block!important;width:100%!important;max-width:none!important;overflow:visible!important;background:#fff!important}
.stay-print-page:last-child{break-after:auto;page-break-after:auto}
.stay-print-head{margin:0 0 16px;padding:0 0 10px;border-bottom:1px solid #dbe3ee}
.stay-print-brand{font-size:12px;font-weight:800;color:#175cd3;letter-spacing:.04em}
.stay-print-title{font-size:22px;font-weight:900;margin-top:4px}
.stay-print-subtitle{font-size:12px;color:#667085;margin-top:3px}
button,select,input,form,.bottom-nav,.page-share-panel,.report-share-panel,.home-share-wrap,.calendar-share-wrap,.reservation-page-toolbar,.expense-page-toolbar,.report-page-toolbar,.no-print{display:none!important}
[hidden]{display:block!important}
.reservation-page-hidden,.expense-page-hidden,.report-page-hidden{display:block!important}
*{box-sizing:border-box}
</style>`;return out}
function pageMarkup(page){const wrapper=document.createElement('section');wrapper.className='stay-print-page';const head=document.createElement('div');head.className='stay-print-head';head.innerHTML=`<div class="stay-print-brand">STAY IN CONTROL 1.0</div><div class="stay-print-title">${page.title||'Documento'}</div>${page.subtitle?`<div class="stay-print-subtitle">${page.subtitle}</div>`:''}`;wrapper.append(head);const els=page.elements?.length?page.elements:(page.element?[page.element]:[]);if(els.length){els.forEach(el=>{if(!el)return;const clone=stripControls(el.cloneNode(true));clone.removeAttribute('hidden');clone.style.display='block';clone.style.position='relative';clone.style.left='auto';clone.style.top='auto';clone.style.transform='none';clone.style.width='100%';clone.style.maxWidth='100%';wrapper.append(clone)})}else if(page.text){const pre=document.createElement('div');pre.style.whiteSpace='pre-wrap';pre.textContent=page.text;wrapper.append(pre)}return wrapper.outerHTML}
function openPrintDocument({title='Stay in Control 1.0',pages=[],filename='Stay-in-Control'}){if(!pages?.length)throw new Error('Nenhuma página para gerar');const win=window.open('','_blank');if(!win)throw new Error('O navegador bloqueou a janela de impressão. Permita pop-ups e tente novamente.');const safeTitle=String(title).replace(/[<>]/g,'');const body=pages.filter(Boolean).map(pageMarkup).join('');win.document.open();win.document.write(`<!doctype html><html lang="pt-BR"><head><title>${safeTitle}</title>${headMarkup()}</head><body><main class="stay-print-document">${body}</main><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),450));<\/script></body></html>`);win.document.close();return true}
async function sharePdf(options){return openPrintDocument(options)}
async function buildPdf(options){return openPrintDocument(options)}
window.StayPdf={buildPdf,sharePdf,openPrintDocument};
})();