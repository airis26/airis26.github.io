(() => {
    const get = id => document.getElementById(id);
    const album = get('moments-album');
    const photo = get('moments-photo');
    const dialog = get('moments-dialog');
    const strip = get('moments-thumbnails');
    let current = 0;
    let timer = null;
    const thumbs = momentPhotos.map((src, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'moments-thumbnail';
        button.setAttribute('aria-label', `Show photo ${index + 1}`);
        const img = document.createElement('img');
        img.src = src;
        img.alt = '';
        img.loading = 'lazy';
        button.append(img);
        button.addEventListener('click', () => { stop(); show(index); });
        strip.append(button);
        return button;
    });
    function show(index) {
        current = (index + momentPhotos.length) % momentPhotos.length;
        const label = `NC-AIRIS'26 conference, photo ${current + 1} of ${momentPhotos.length}`;
        photo.src = momentPhotos[current];
        photo.alt = label;
        get('moments-count').textContent = `${current + 1} / ${momentPhotos.length}`;
        thumbs.forEach((button, i) => button.setAttribute('aria-current', String(i === current)));
        const thumb = thumbs[current];
        strip.scrollLeft = thumb.offsetLeft - strip.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2;
        if (dialog.open) {
            get('moments-large').src = momentPhotos[current];
            get('moments-large').alt = label;
            get('moments-large-count').textContent = `${current + 1} / ${momentPhotos.length}`;
        }
    }
    function stop() {
        clearInterval(timer); timer = null;
        get('moments-play').textContent = 'Play slideshow';
        get('moments-play').setAttribute('aria-pressed', 'false');
    }
    function move(delta) { stop(); show(current + delta); }
    get('moments-prev').addEventListener('click', () => move(-1));
    get('moments-next').addEventListener('click', () => move(1));
    get('moments-large-prev').addEventListener('click', () => move(-1));
    get('moments-large-next').addEventListener('click', () => move(1));
    get('moments-expand').addEventListener('click', () => { stop(); dialog.showModal(); show(current); });
    get('moments-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    get('moments-play').addEventListener('click', () => {
        if (timer) return stop();
        timer = setInterval(() => show(current + 1), 4500);
        get('moments-play').textContent = 'Pause slideshow';
        get('moments-play').setAttribute('aria-pressed', 'true');
    });
    [album, dialog].forEach(surface => {
        surface.addEventListener('keydown', event => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);
            }
        });
    });
    [get('moments-stage'), get('moments-large')].forEach(surface => {
        let start = null;
        surface.addEventListener('touchstart', event => { start = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null; }, { passive: true });
        surface.addEventListener('touchend', event => {
            if (!start) return;
            const dx = event.changedTouches[0].clientX - start.x;
            const dy = event.changedTouches[0].clientY - start.y;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
            start = null;
        }, { passive: true });
        surface.addEventListener('touchcancel', () => { start = null; });
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
    new IntersectionObserver(entries => { if (!entries[0].isIntersecting) stop(); }).observe(album);
    show(0);
})();
