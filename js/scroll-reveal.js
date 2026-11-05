(function () {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px', // Срабатывает чуть раньше, чем элемент появится полностью
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Если нужно, чтобы анимация срабатывала только 1 раз — раскомментируйте:
                // obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Функция для инициализации (вызываем при загрузке и смене страниц)
    window.initScrollReveal = () => {
        const elements = document.querySelectorAll('.reveal, .reveal-stagger');
        elements.forEach((el) => {
            // Сбрасываем класс, если элемент только что отрисовался
            el.classList.remove('is-visible');
            observer.observe(el);
        });
    };

    // Запускаем при первой загрузке
    document.addEventListener('DOMContentLoaded', () => {
        window.initScrollReveal();
    });

    // Слушаем событие смены страницы из navigation.js
    window.addEventListener('terrasoul:page-swapped', () => {
        window.initScrollReveal();
    });
})();