(function () {
    let overlay = null;
    let imgEl = null;
    let loaderEl = null;
    let panelEl = null;
    let currentPhoto = null;

    const build = () => {
        overlay = document.createElement('div');
        overlay.className = 'lightbox';
overlay.innerHTML = `
    <div class="lightbox__stage">
        <div class="lightbox__loader" aria-hidden="true">Загрузка оригинала…</div>
        <img class="lightbox__img" alt="">
    </div>
    <aside class="lightbox__panel">
        <button class="lightbox__close" aria-label="Закрыть">✕</button>
        <div class="lightbox__panel-inner">
            <div class="lightbox__eyebrow">TerraSoul · Оригинал</div>
            <h2 class="lightbox__title"></h2>
            <div class="lightbox__meta"></div>

            <div class="lightbox__price-row">
                <span class="lightbox__price-label">Базовая цена</span>
                <span class="lightbox__price"></span>
            </div>

            <div class="lightbox__actions">
                <button class="btn btn--primary lightbox__order-btn" type="button">
                    Заказать
                </button>
                <a class="btn btn--ghost lightbox__download-btn" download>
                    Скачать оригинал
                </a>
            </div>

            <p class="lightbox__hint">
                Печать на архивной бумаге, рама из массива дуба, ограниченный тираж.
            </p>
        </div>
    </aside>
`;
        document.body.appendChild(overlay);

        imgEl = overlay.querySelector('.lightbox__img');
        loaderEl = overlay.querySelector('.lightbox__loader');
        panelEl = overlay.querySelector('.lightbox__panel');

        imgEl.addEventListener('load', () => overlay.classList.add('is-loaded'));
        imgEl.addEventListener('error', () => {
            loaderEl.textContent = 'Не удалось загрузить оригинал';
        });

        overlay.querySelector('.lightbox__close').addEventListener('click', close);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });

        overlay.querySelector('.lightbox__order-btn').addEventListener('click', () => {
            if (!currentPhoto) return;
            window.TerraCart.setPhoto(currentPhoto.id);
            close();
            // Переходим в магазин
            const shopBtn = document.querySelector('[data-nav="shop"]');
            if (shopBtn) shopBtn.click();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
        });
    };

    const fillPanel = (photo) => {
        const price = window.TerraPricing.format(photo.price);
        overlay.querySelector('.lightbox__title').textContent = photo.title;
        overlay.querySelector('.lightbox__meta').textContent = `${photo.size} · ограниченный тираж · 25 экз.`;
        overlay.querySelector('.lightbox__price').textContent = price;

        const download = overlay.querySelector('.lightbox__download-btn');
        download.href = `images/originals/${photo.original || photo.file}`;
        download.setAttribute('download', photo.original || photo.file);
    };

    const open = (photo) => {
        if (!overlay) build();
        currentPhoto = photo;

        overlay.classList.remove('is-loaded');
        overlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        loaderEl.textContent = 'Загрузка оригинала…';

        fillPanel(photo);
        imgEl.src = `images/originals/${photo.original || photo.file}`;
        imgEl.alt = photo.title;
    };

    const close = () => {
        if (!overlay) return;
        overlay.classList.remove('is-open', 'is-loaded');
        document.body.style.overflow = '';
        setTimeout(() => { imgEl.src = ''; }, 300);
    };

    // Клик по карточке → открыть лайтбокс с оригиналом
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.card[data-photo]');
        if (!card) return;
        const id = card.dataset.photo;
        const photo = window.TerraPricing.getPhoto(id);
        if (photo) open(photo);
    });
})();