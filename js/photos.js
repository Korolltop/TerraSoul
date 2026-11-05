// ===== ДАННЫЕ О ФОТОГРАФИЯХ =====
// file     — превью для карточки (лёгкое, быстро грузится)
// original — оригинал в максимальном качестве (открывается при клике)
window.TERRA_PHOTOS = [
    {
        id: '9',
        file: 'IMG_9.jpg',         
        original: 'IMG_9.jpg',        
        title: 'Осенний берег',
        size: '60×90 см',
        price: 12900,
        width: 6000,
        height: 4000
    },
    {
        id: '8',
        file: 'IMG_8.jpg',
        original: 'IMG_8.jpg',
        title: 'Огненное солнце',
        size: '50×70 см',
        price: 9800,
        width: 6000,
        height: 4000
    },
    {
        id: '2',
        file: 'IMG_2.jpg',
        original: 'IMG_2.jpg',
        title: 'Лесные скалы',
        size: '40×60 см',
        price: 7500,
        width: 6000,
        height: 4000
    },
    {
        id: '4',
        file: 'IMG_4.jpg',
        original: 'IMG_4.jpg',
        title: 'Закат над Тургояком',
        size: '60×90 см',
        price: 14900,
        width: 6000,
        height: 4000
    },
    {
        id: '11',
        file: 'IMG_11.jpg',
        original: 'IMG_11.jpg',
        title: 'Краски осени',
        size: '50×70 см',
        price: 11500,
        width: 6000,
        height: 4000
    },
    {
        id: '1',
        file: 'IMG_1.jpg',
        original: 'IMG_1.jpg',
        title: 'Лунный месяц',
        size: '40×60 см',
        price: 8200,
        width: 6000,
        height: 4000
    },
    {
        id: '16',
        file: 'IMG_16.jpg',
        original: 'IMG_16.jpg',
        title: 'Композиция "Осенний Райдер"',
        size: '60×80 см',
        price: 10400,
        width: 6000,
        height: 4000
    },
    {
        id: '5',
        file: 'IMG_5.jpg',
        original: 'IMG_5.jpg',
        title: 'Огненный закат',
        size: '70×100 см',
        price: 16000,
        width: 6000,
        height: 4000
    },
    {
        id: '6',
        file: 'IMG_6.jpg',
        original: 'IMG_6.jpg',
        title: 'Яхтенный рай',
        size: '50×70 см',
        price: 12000,
        width: 6000,
        height: 4000
    }
];

// ===== РЕНДЕР КАРТОЧЕК =====
(function () {
    const THUMB_DIR = 'images/thumbs/';
    const ORIGINAL_DIR = 'images/originals/';
    const PLACEHOLDER = 'images/thumbs/placeholder.jpg';

    const formatPrice = (n) =>
        new Intl.NumberFormat('ru-RU').format(n) + ' ₽';

    const cardTemplate = (photo) => `
        <article class="card" data-photo="${photo.id}" data-original="${ORIGINAL_DIR}${photo.original}">
            <img class="card__img"
                 src="${THUMB_DIR}${photo.file}"
                 alt="${photo.title}"
                 loading="lazy"
                 decoding="async"
                 onerror="this.onerror=null; this.src='${PLACEHOLDER}';">
            <div class="card__body">
                <h3 class="card__title">${photo.title}</h3>
                <div class="card__meta">
                    <span>${photo.size}</span>
                    <span class="card__price">${formatPrice(photo.price)}</span>
                </div>
            </div>
        </article>
    `;

    window.TerraPhotos = {
        renderInto(container, ids) {
            if (!container) return;
            const list = ids && ids.length
                ? window.TERRA_PHOTOS.filter((p) => ids.includes(p.id))
                : window.TERRA_PHOTOS;
            container.innerHTML = list.map(cardTemplate).join('');
        },
        renderAll(container) {
            this.renderInto(container, null);
        },
        renderInRoot(root) {
            (root || document).querySelectorAll('[data-photos]').forEach((el) => {
                const raw = (el.dataset.photos || '').trim();
                const ids = raw ? raw.split(',').map((s) => s.trim()).filter(Boolean) : null;
                this.renderInto(el, ids);
            });
        }
    };
})();

// ===== ОПЦИИ ЗАКАЗА =====
// Размеры: базовая цена умножается на коэффициент
window.TERRA_SIZES = [
    { id: 's',  label: '30×40 см',  multiplier: 0.6,  note: 'Компактный' },
    { id: 'm',  label: '40×60 см',  multiplier: 1.0,  note: 'Стандарт' },
    { id: 'l',  label: '60×90 см',  multiplier: 1.7,  note: 'Большой' },
    { id: 'xl', label: '70×100 см', multiplier: 2.4,  note: 'Галерейный' }
];

window.TERRA_PAPERS = [
    { id: 'matte',    label: 'Матовая',        surcharge: 0,    note: 'Без бликов' },
    { id: 'satin',    label: 'Сатиновая',      surcharge: 800,  note: 'Мягкий блеск' },
    { id: 'fineart',  label: 'Fine Art',       surcharge: 2400, note: 'Музейное качество' },
    { id: 'canvas',   label: 'Холст',          surcharge: 3200, note: 'Фактурная' }
];

window.TERRA_FRAMES = [
    { id: 'none',  label: 'Без рамки',   surcharge: 0,    color: null },
    { id: 'white', label: 'Белая рамка', surcharge: 1500, color: '#f5f5f2' },
    { id: 'black', label: 'Чёрная рамка', surcharge: 1500, color: '#1a1a1a' }
];

// Стоимость доставки
window.TERRA_DELIVERY = 490;
window.TERRA_FREE_DELIVERY_FROM = 15000;

// Вспомогательные функции
window.TerraPricing = {
    getPhoto(id) {
        return (window.TERRA_PHOTOS || []).find((p) => p.id === id) || null;
    },
    getSize(id) {
        return window.TERRA_SIZES.find((s) => s.id === id) || window.TERRA_SIZES[1];
    },
    getPaper(id) {
        return window.TERRA_PAPERS.find((p) => p.id === id) || window.TERRA_PAPERS[0];
    },
    getFrame(id) {
        return window.TERRA_FRAMES.find((f) => f.id === id) || window.TERRA_FRAMES[0];
    },
    calc(photo, sizeId, paperId, frameId) {
        if (!photo) return { base: 0, size: 0, paper: 0, frame: 0, subtotal: 0, delivery: 0, total: 0 };
        const size = this.getSize(sizeId);
        const paper = this.getPaper(paperId);
        const frame = this.getFrame(frameId);
        const base = photo.price;
        const sizePrice = Math.round(base * size.multiplier);
        const subtotal = sizePrice + paper.surcharge + frame.surcharge;
        const delivery = subtotal >= window.TERRA_FREE_DELIVERY_FROM ? 0 : window.TERRA_DELIVERY;
        return {
            base,
            size: sizePrice,
            paper: paper.surcharge,
            frame: frame.surcharge,
            subtotal,
            delivery,
            total: subtotal + delivery
        };
    },
    format(n) {
        return new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
    }
};