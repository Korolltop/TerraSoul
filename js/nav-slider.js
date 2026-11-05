(function () {
    const nav = document.querySelector('.nav');
    const indicator = document.querySelector('.nav__indicator');
    let links = [];
    let activeLink = null;

    if (!nav || !indicator) return;

    const moveIndicator = (target, instant = false) => {
        if (!target) return;
        
        const left = target.offsetLeft;
        const width = target.offsetWidth;

        if (instant) {
            indicator.style.transition = 'none';
            indicator.style.width = `${width}px`;
            indicator.style.transform = `translateX(${left}px)`;
            void indicator.offsetWidth; 
            indicator.style.transition = '';
        } else {
            indicator.style.width = `${width}px`;
            indicator.style.transform = `translateX(${left}px)`;
        }
    };

    const update = () => {
        links = document.querySelectorAll('.nav__link');
        activeLink = document.querySelector('.nav__link.is-active');
        
        if (activeLink) {
            moveIndicator(activeLink, true); 
        }
    };

    nav.addEventListener('click', (e) => {
        const link = e.target.closest('.nav__link');
        if (!link) return;
        
        document.querySelectorAll('.nav__link').forEach(l => l.classList.remove('is-active'));
        link.classList.add('is-active');
        
        activeLink = link;
        indicator.style.transition = 'none';
        indicator.style.width = `${link.offsetWidth}px`;
        
        requestAnimationFrame(() => {
            indicator.style.transition = ''; 
            indicator.style.transform = `translateX(${link.offsetLeft}px)`;
        });
    });

    window.addEventListener('resize', update);
    document.addEventListener('DOMContentLoaded', update);
    window.addEventListener('terrasoul:page-swapped', update);

    if (document.fonts) {
        document.fonts.ready.then(update);
    }
})();