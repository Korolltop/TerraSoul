(function () {
    const STORAGE_KEY = 'terrasoul-theme';
    const root = document.documentElement;
    const toggle = document.getElementById('themeToggle');

    const getPreferred = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const apply = (theme) => {
        root.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
    };

    apply(getPreferred());

    if (toggle) {
        toggle.addEventListener('click', () => {
            const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            apply(next);
        });
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(STORAGE_KEY)) {
            root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
})();