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
            // Заказа нет
            shop.hidden = true;
            empty.hidden = false;
            
            if (animateEmpty) {
                empty.classList.remove('is-appearing');
                void empty.offsetWidth; // сброс анимации
                empty.classList.add('is-appearing');
            }
            return;
        }

        // Заказ есть
        empty.hidden = true;
        shop.hidden = false;
        shop.classList.remove('is-leaving'); // на всякий случай

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
                alert(`Заказ оформлен!\n\n«${photo.title}»\n${window.TerraPricing.getSize(order.sizeId).label}, ${window.TerraPricing.getPaper(order.paperId).label}, ${window.TerraPricing.getFrame(order.frameId).label}\nИтого: ${window.TerraPricing.format(calc.total)}`);
            });
        }

        const clearBtn = root.querySelector('[data-shop-clear]');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                const shop = root.querySelector('[data-shop]');
                if (!shop || shop.hidden) return;

                // 1. Сбрасываем возможные старые классы
                shop.classList.remove('is-leaving');
                
                // 2. Трюк для принудительной перерисовки (reflow)
                // Это заставит браузер "заметить" начальное состояние перед анимацией
                void shop.offsetWidth; 
                
                // 3. Запускаем анимацию
                shop.classList.add('is-leaving');

                // 4. Ждем окончания анимации (500мс)
                setTimeout(() => {
                    // Очищаем корзину (это вызовет событие order-changed и refresh())
                    window.TerraCart.clear();
                    
                    // Принудительно обновляем DOM с анимацией пустоты
                    refresh(true);
                    
                    // Убираем класс с магазина (он уже скрыт)
                    shop.classList.remove('is-leaving');
                }, 500); // 500мс = 0.5s в CSS
            });
        }

        // Первичная отрисовка
        refresh();
    };

    window.addEventListener('terrasoul:order-changed', () => refresh());

    document.addEventListener('DOMContentLoaded', () => {
        const app = document.getElementById('app');
        if (!app) return;
        
        // Следим за переключением страниц
        new MutationObserver(() => {
            const root = app.querySelector('[data-shop], [data-shop-empty]');
            if (root && root !== currentRoot) {
                // Перепривязываемся к новому DOM
                bind(app.querySelector('.page'));
            }
        }).observe(app, { childList: true, subtree: false });
    });
})();