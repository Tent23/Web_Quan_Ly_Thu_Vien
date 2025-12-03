(function(){
'use strict';

function qs(s, ctx){ return (ctx||document).querySelector(s); }
function qsa(s, ctx){ return Array.from((ctx||document).querySelectorAll(s)); }

function initResources(){
    const search = qs('#resource-search');
    const category = qs('#resource-category');
    const grid = qs('#resource-grid');
    const items = qsa('.resource', grid);

    function normalize(v){ return (v||'').toString().toLowerCase(); }

    function applyFilter(){
        const q = normalize(search.value);
        const cat = category ? category.value : 'all';
        items.forEach(it => {
            const title = normalize(it.dataset.title);
            const author = normalize(it.dataset.author);
            const desc = normalize(it.dataset.desc);
            const c = (it.dataset.category || 'all').toString().toLowerCase();
            const matchQuery = !q || title.includes(q) || author.includes(q) || desc.includes(q);
            const matchCat = cat === 'all' || c === cat;
            it.style.display = (matchQuery && matchCat) ? '' : 'none';
        });
    }

    search.addEventListener('input', applyFilter);
    if (category) category.addEventListener('change', applyFilter);

    // modal
    const modal = qs('#resource-modal');
    const modalBody = qs('.resource-modal-body', modal);
    const modalBackdrop = qs('.resource-modal-backdrop', modal);
    const modalClose = qs('.resource-modal-close', modal);

    function openModalFrom(el){
        const title = el.dataset.title || '';
        const author = el.dataset.author || '';
        const desc = el.dataset.desc || '';
        const img = el.querySelector('img');
        const imgHtml = img ? `<img src="${img.src}" alt="${img.alt||''}">` : '';
        modalBody.innerHTML = `<div class="resource-modal-grid"><div class="resource-modal-media">${imgHtml}</div><div class="resource-modal-info"><h3>${title}</h3><p class="meta">${author}</p><p class="desc">${desc}</p></div></div>`;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden','false');
    }

    function closeModal(){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }
    modalBackdrop.addEventListener('click', closeModal);
    modalClose.addEventListener('click', closeModal);

    items.forEach(it => {
        it.addEventListener('click', () => openModalFrom(it));
    });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initResources);
else initResources();

})();
