(function () {
    const KEY = 'terrasoul-order';

    const defaults = {
        photoId: null,
        sizeId: 'm',
        paperId: 'matte',
        frameId: 'none'
    };

    const read = () => {
        try {
            const raw = localStorage.getItem(KEY);
            if (!raw) return { ...defaults };
            const parsed = JSON.parse(raw);
            return { ...defaults, ...parsed };
        } catch {
            return { ...defaults };
        }
    };

    const write = (order) => {
        localStorage.setItem(KEY, JSON.stringify(order));
        window.dispatchEvent(new CustomEvent('terrasoul:order-changed', { detail: order }));
    };

    window.TerraCart = {
        get() {
            return read();
        },
        setPhoto(photoId) {
            const order = read();
            order.photoId = photoId;
            write(order);
        },
        update(patch) {
            const order = { ...read(), ...patch };
            write(order);
        },
        clear() {
            localStorage.removeItem(KEY);
            window.dispatchEvent(new CustomEvent('terrasoul:order-changed', { detail: { ...defaults } }));
        },
        hasOrder() {
            const o = read();
            return !!(o.photoId && window.TerraPricing.getPhoto(o.photoId));
        }
    };
})();