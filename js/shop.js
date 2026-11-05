(function () {
    let currentRoot = null;

    const renderOptions = (container, items, currentId, type) => {
        if (!container) return;
        container.innerHTML = items.map((item) => {
            const active = item.id === currentId ? ' is-selected' : '';
            const swatch = item.color
                ? `<span class="swatch" style="background:${item.color}"></span>`
                : '';
            const extra = item.surcharge ? `+${window.TerraPricing.format(item.surcharge)}` : 'бесплатно';
            const note = item.note ? `<span class="opt__note">${item.note}</span>` : '';
            return `
                <label class="opt${active}" data-type="${type}" data-id="${item.id}">
                    <input type="radio" name="${type}" value="${item.id}" ${item.id === currentId ? 'checked' : ''}>
                    <span class="opt__body">
                        <span class="opt__head">
                            ${swatch}
                            <span class="opt__label">${item.label}</span>
                        </span>
                        ${note}
                        <span class="opt__price">${extra}</span>
                    </span>
                </label>
            `;
        }).join('');
    };

    const updateSummary = (photo, order) => {
        const shop = currentRoot.querySelector('[data-shop]');
        if (!shop) return;
        
        const size = window.TerraPricing.getSize(order.sizeId);
        const paper = window.TerraPricing.getPaper(order.paperId);
        const frame = window.TerraPricing.getFrame(order.frameId);
        const calc = window.TerraPricing.calc(photo, order.sizeId, order.paperId, order.frameId);

        shop.querySelector('[data-summary-size]').textContent = size.label;
        shop.querySelector('[data-summary-paper]').textContent = paper.label;
        shop.querySelector('[data-summary-frame]').textContent = frame.label;

        shop.querySelector('[data-summary-size-price]').textContent  = window.TerraPricing.format(calc.size);
        shop.querySelector('[data-summary-paper-price]').textContent = paper.surcharge ? `+${window.TerraPricing.format(paper.surcharge)}` : '—';
        shop.querySelector('[data-summary-frame-price]').textContent = frame.surcharge ? `+${window.TerraPricing.format(frame.surcharge)}` : '—';

        const deliveryEl = shop.querySelector('[data-summary-delivery]');
        deliveryEl.textContent = calc.delivery === 0
            ? 'Бесплатно'
            : window.TerraPricing.format(calc.delivery);
        deliveryEl.classList.toggle('is-free', calc.delivery === 0);

        shop.querySelector('[data-summary-total]').textContent = window.TerraPricing.format(calc.total);
    };

    const refresh = (animateEmpty = false) => {
        if (!currentRoot) return;
        const order = window.TerraCart.get();
        const photo = window.TerraPricing.getPhoto(order.photoId);
        const empty = currentRoot.querySelector('[data-shop-empty]');
        const shop = currentRoot.querySelector('[data-shop]');

        if (!empty || !shop) return;

        if (!photo) {
            shop.hidden = true;
            empty.hidden = false;
            
            if (animateEmpty) {
                empty.classList.remove('is-appearing');
                void empty.offsetWidth; 
                empty.classList.add('is-appearing');
            }
            return;
        }

        empty.hidden = true;
        shop.hidden = false;
        shop.classList.remove('is-leaving'); 

        const img = shop.querySelector('.shop__photo');
        img.src = `images/thumbs/${photo.file}`;
        img.alt = photo.title;
        shop.querySelector('.shop__photo-title').textContent = photo.title;
        shop.querySelector('.shop__photo-meta').textContent =
            `${photo.width}×${photo.height} px · ${photo.size}`;

        renderOptions(shop.querySelector('[data-options="size"]'),  window.TERRA_SIZES,  order.sizeId,  'size');
        renderOptions(shop.querySelector('[data-options="paper"]'), window.TERRA_PAPERS, order.paperId, 'paper');
        renderOptions(shop.querySelector('[data-options="frame"]'), window.TERRA_FRAMES, order.frameId, 'frame');

        updateSummary(photo, order);
    };

    const bind = (root) => {
        currentRoot = root;
        if (!root) return;

        root.addEventListener('change', (e) => {
            const input = e.target.closest('input[type="radio"]');
            if (!input) return;
            const type = input.name;
            const value = input.value;
            const patch = {};
            if (type === 'size')  patch.sizeId  = value;
            if (type === 'paper') patch.paperId = value;
            if (type === 'frame') patch.frameId = value;
            window.TerraCart.update(patch);
            refresh();
        });

        const checkoutBtn = root.querySelector('[data-shop-checkout]');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                const order = window.TerraCart.get();
                const photo = window.TerraPricing.getPhoto(order.photoId);
                if (!photo) return;
                const calc = window.TerraPricing.calc(photo, order.sizeId, order.paperId, order.frameId);

                const orderData = {
                    title: photo.title,
                    size: window.TerraPricing.getSize(order.sizeId).label,
                    paper: window.TerraPricing.getPaper(order.paperId).label,
                    frame: window.TerraPricing.getFrame(order.frameId).label,
                    total: calc.total,
                    name: "Покупатель с сайта", 
                    phone: "+7 (999) 000-00-00" 
                };

                const originalText = checkoutBtn.textContent;
                checkoutBtn.textContent = 'Отправка...';
                checkoutBtn.disabled = true;

                const vercelUrl = 'https://vercel.app'; 

                fetch(vercelUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        alert(`Заказ успешно оформлен!\n\nИтого: ${window.TerraPricing.format(calc.total)}`);
                        window.TerraCart.clear(); 
                    } else {
                        alert(`Ошибка сервера Vercel: ${data.error}`);
                    }
                })
                .catch(err => {
                    console.error('Ошибка:', err);
                    alert('Ошибка соединения: не удалось достучаться до сервера Vercel.');
                })
                .finally(() => {
                    checkoutBtn.textContent = originalText;
                    checkoutBtn.disabled = false;
                });
            });
        }

        const clearBtn = root.querySelector('[data-shop-clear]');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                const shop = root.querySelector('[data-shop]');
                if (!shop || shop.hidden) return;

                shop.classList.remove('is-leaving');
                void shop.offsetWidth; 
                shop.classList.add('is-leaving');

                setTimeout(() => {
                    window.TerraCart.clear();
                    refresh(true);
                    shop.classList.remove('is-leaving');
                }, 500); 
            });
        }

        refresh();
    };

    window.addEventListener('terrasoul:order-changed', () => refresh());

    document.addEventListener('DOMContentLoaded', () => {
        const app = document.getElementById('app');
        if (!app) return;
        
        new MutationObserver(() => {
            const root = app.querySelector('[data-shop], [data-shop-empty]');
            if (root && root !== currentRoot) {
                bind(app.querySelector('.page'));
            }
        }).observe(app, { childList: true, subtree: true });
    });
})();
