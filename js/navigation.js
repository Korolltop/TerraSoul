(function () {
    const app = document.getElementById('app');
    const navLinks = document.querySelectorAll('[data-nav]');
    const STORAGE_KEY = 'terrasoul-page';
    const pages = ['home', 'gallery', 'shop', 'about', 'contact'];
    let current = null;
    let busy = false;

    if (!app) {
        console.error('TerraSoul: не найден #app');
        return;
    }

    const loadPage = async (name) => {
        const res = await fetch(`pages/${name}.html`, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`Не найдена страница: ${name}`);
        return res.text();
    };

    const setActive = (name) => {
        navLinks.forEach((el) => {
            el.classList.toggle('is-active', el.dataset.nav === name);
        });
    };

    const renderPhotos = (root) => {
        if (window.TerraPhotos) window.TerraPhotos.renderInRoot(root);
    };

    const navigate = async (name, { push = true, animate = true } = {}) => {
        if (busy || name === current) return;
        if (!pages.includes(name)) name = 'home';

        busy = true;

        try {
            const html = await loadPage(name);

	const swap = () => {
  	  app.innerHTML = html;
  	  app.firstElementChild?.classList.add('page');
 	   renderPhotos(app);                       // уже есть
 	   window.dispatchEvent(new CustomEvent('terrasoul:page-swapped', { detail: { page: name } }));
 	   current = name;
 	   setActive(name);
 	   localStorage.setItem(STORAGE_KEY, name);
 	   window.scrollTo({ top: 0, behavior: 'smooth' });
	};

            if (animate && app.firstElementChild) {
                app.firstElementChild.classList.add('page--leaving');
                await new Promise((r) => setTimeout(r, 280));
                swap();
            } else {
                swap();
            }

            if (push) {
                history.pushState({ page: name }, '', `#${name}`);
            }
        } catch (err) {
            app.innerHTML = `<div class="page"><p style="color:var(--text-muted)">Не удалось загрузить раздел. Запустите сайт через локальный сервер (например, <code>python -m http.server</code>).</p></div>`;
            console.error(err);
        } finally {
            busy = false;
        }
    };

    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigate(link.dataset.nav);
        });
    });

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-goto]');
        if (trigger) {
            e.preventDefault();
            navigate(trigger.dataset.goto);
        }
    });

    window.addEventListener('popstate', (e) => {
        const name = e.state?.page || location.hash.replace('#', '') || 'home';
        navigate(name, { push: false });
    });

    const start = location.hash.replace('#', '') || localStorage.getItem(STORAGE_KEY) || 'home';
    navigate(pages.includes(start) ? start : 'home', { push: false, animate: false });
})();

// Умное отслеживание: меняем цвет линии только когда под шапкой БАННЕР
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    const banner = document.querySelector('.home-banner'); // Ищем наш баннер
    
    if (!header) return;

    // Если баннера на странице нет (например, мы в галерее) — просто делаем линию черной/стандартной
    if (!banner) {
        header.classList.remove('is-scrolled');
        return;
    }

    // Получаем координаты баннера и высоту шапки
    const bannerRect = banner.getBoundingClientRect();
    const headerHeight = header.offsetHeight;

    // Если верх баннера находится выше низа шапки, 
    // И низ баннера находится ниже низа шапки — значит шапка "наезжает" на баннер
    if (bannerRect.top < headerHeight && bannerRect.bottom > 0) {
        header.classList.add('is-scrolled'); // Включаем белую линию
    } else {
        header.classList.remove('is-scrolled'); // Возвращаем черную
    }
});

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
            // Принудительно вызываем перерисовку, чтобы transition применился к следующему изменению
            void indicator.offsetWidth; 
            indicator.style.transition = '';
        } else {
            // Меняем ширину моментально (без transition), а двигаем плавно
            indicator.style.width = `${width}px`;
            indicator.style.transform = `translateX(${left}px)`;
        }
    };

    const update = () => {
        links = document.querySelectorAll('.nav__link');
        activeLink = document.querySelector('.nav__link.is-active');
        
        if (activeLink) {
            moveIndicator(activeLink, true); // Мгновенно при загрузке/ресайзе
        }
    };

    nav.addEventListener('click', (e) => {
        const link = e.target.closest('.nav__link');
        if (!link) return;
        
        document.querySelectorAll('.nav__link').forEach(l => l.classList.remove('is-active'));
        link.classList.add('is-active');
        
        activeLink = link;
        // При клике двигаем плавно, но ширину меняем моментально
        indicator.style.transition = 'none';
        indicator.style.width = `${link.offsetWidth}px`;
        
        requestAnimationFrame(() => {
            indicator.style.transition = ''; // Возвращаем плавность
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