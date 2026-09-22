document.addEventListener('DOMContentLoaded', () => {
    if (!window.SERIES_DATA) return;
    const seriesData = window.SERIES_DATA;

    // Elements
    const splashScreen = document.getElementById('splash-screen');
    const btnEnter = document.getElementById('btn-enter');
    const browsePage = document.getElementById('browse-page');
    const navbar = document.getElementById('navbar');

    // Hero Elements
    const heroSection = document.getElementById('hero-section');
    const heroTitle = document.getElementById('hero-title');
    const heroDesc = document.getElementById('hero-desc');
    const heroMatch = document.getElementById('hero-match');
    const heroYear = document.getElementById('hero-year');
    const heroSeasons = document.getElementById('hero-seasons');
    const heroPlayBtn = document.getElementById('hero-play');
    const heroInfoBtn = document.getElementById('hero-info');

    // Rows
    const rowsContainer = document.getElementById('rows-container');

    // Modal
    const modalOverlay = document.getElementById('detail-modal');
    const modalCloseBtn = document.getElementById('modal-close');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalMatch = document.getElementById('modal-match');
    const modalYear = document.getElementById('modal-year');
    const modalEps = document.getElementById('modal-eps');
    const modalDesc = document.getElementById('modal-desc');
    const modalGenre = document.getElementById('modal-genre');
    const modalPlayBtn = document.getElementById('modal-play');
    const episodesList = document.getElementById('episodes-list');

    // Gallery
    const galleryOverlay = document.getElementById('gallery-overlay');
    const galleryCloseBtn = document.getElementById('gallery-close');
    const galleryImg = document.getElementById('gallery-img');
    const galleryVid = document.getElementById('gallery-vid');
    const galleryPrevBtn = document.getElementById('gallery-prev');
    const galleryNextBtn = document.getElementById('gallery-next');
    const galleryCounter = document.getElementById('gallery-counter');
    const galleryProgress = document.getElementById('gallery-progress');

    // State
    let activeSeries = null;
    let galleryIndex = 0;
    let autoPlayInterval = null;

    // Initialize
    function init() {
        setHeroSeries(seriesData[seriesData.length - 1]); // Default hero to latest
        renderRows();
        attachEvents();
    }

    // --- Splash ---
    btnEnter.addEventListener('click', () => {
        splashScreen.classList.add('hidden');
        setTimeout(() => {
            splashScreen.style.display = 'none';
            browsePage.style.display = 'block';
            document.body.classList.remove('no-scroll');
        }, 1000);
    });

    // --- Navbar ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });

    // --- Hero ---
    function setHeroSeries(series) {
        if (!series) return;
        heroSection.style.backgroundImage = `url('${series.coverSrc || series.media[0].src}')`;
        heroTitle.textContent = series.title;
        heroDesc.textContent = series.description;
        heroMatch.textContent = series.match;
        heroYear.textContent = series.year;
        heroSeasons.textContent = `${series.media.length} Episodes`;

        heroPlayBtn.onclick = () => openGallery(series, 0);
        heroInfoBtn.onclick = () => openModal(series);
    }

    // --- Rows ---
    function renderRows() {
        rowsContainer.innerHTML = '';
        seriesData.forEach(series => {
            const rowWrapper = document.createElement('div');
            rowWrapper.className = 'row-container';
            rowWrapper.innerHTML = `
                <h2 class="row-title">${series.title}</h2>
                <div class="row-slider-wrapper">
                    <div class="slider-arrow arrow-left"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg></div>
                    <div class="row-slider" id="slider-${series.id}">
                        ${series.media.map((m, i) => `
                            <div class="card" data-idx="${i}">
                                <img src="${m.src}" alt="Episode ${i+1}" loading="lazy">
                                <div class="card-info">
                                    <span class="card-title">Episode ${i+1}</span>
                                    <div class="play-circle"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="slider-arrow arrow-right"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
                </div>
            `;
            rowsContainer.appendChild(rowWrapper);

            // Slider Nav
            const slider = rowWrapper.querySelector('.row-slider');
            const leftBtn = rowWrapper.querySelector('.arrow-left');
            const rightBtn = rowWrapper.querySelector('.arrow-right');

            leftBtn.onclick = () => slider.scrollBy({ left: -slider.clientWidth * 0.8, behavior: 'smooth' });
            rightBtn.onclick = () => slider.scrollBy({ left: slider.clientWidth * 0.8, behavior: 'smooth' });

            // Card clicks
            const cards = rowWrapper.querySelectorAll('.card');
            cards.forEach(card => {
                card.onclick = () => {
                    openModal(series);
                };
            });
        });
    }

    // --- Modal ---
    function openModal(series) {
        activeSeries = series;
        modalImg.src = series.coverSrc || series.media[0].src;
        modalTitle.textContent = series.title;
        modalMatch.textContent = series.match;
        modalYear.textContent = series.year;
        modalEps.textContent = `${series.media.length} Episodes`;
        modalDesc.textContent = series.description;
        modalGenre.textContent = series.genre;
        
        modalPlayBtn.onclick = () => openGallery(series, 0);

        episodesList.innerHTML = '';
        series.media.forEach((m, i) => {
            const ep = document.createElement('div');
            ep.className = 'episode-item';
            ep.innerHTML = `
                <div class="episode-number">${i+1}</div>
                <div class="episode-thumb-container">
                    <img src="${m.src}" alt="Ep ${i+1}">
                    <div class="episode-play-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </div>
                </div>
                <div class="episode-details">
                    <div class="episode-title-row">
                        <span class="episode-title">Episode ${i+1}</span>
                    </div>
                    <p style="font-size: 0.85rem; color: #a3a3a3; margin-top: 5px;">A special moment.</p>
                </div>
            `;
            ep.onclick = () => openGallery(series, i);
            episodesList.appendChild(ep);
        });

        modalOverlay.classList.add('active');
        document.body.classList.add('no-scroll');
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        if (!galleryOverlay.classList.contains('active')) {
            document.body.classList.remove('no-scroll');
        }
    }

    // --- Gallery ---
    function openGallery(series, idx) {
        activeSeries = series;
        galleryIndex = idx;
        galleryOverlay.classList.add('active');
        document.body.classList.add('no-scroll');
        renderGalleryMedia();
        startAutoPlay();
    }

    function renderGalleryMedia() {
        const m = activeSeries.media[galleryIndex];
        galleryImg.classList.remove('active');
        galleryVid.classList.remove('active');

        if (m.type === 'video') {
            galleryImg.style.display = 'none';
            galleryVid.style.display = 'block';
            galleryVid.src = m.src;
            galleryVid.play().catch(e => console.warn(e));
            galleryVid.classList.add('active');
        } else {
            galleryVid.pause();
            galleryVid.style.display = 'none';
            galleryImg.style.display = 'block';
            galleryImg.src = m.src;
            galleryImg.classList.add('active');
        }

        galleryCounter.textContent = `${galleryIndex + 1} / ${activeSeries.media.length}`;
        galleryProgress.style.width = `${((galleryIndex + 1) / activeSeries.media.length) * 100}%`;
    }

    function nextMedia() {
        galleryIndex = (galleryIndex + 1) % activeSeries.media.length;
        renderGalleryMedia();
        startAutoPlay();
    }

    function prevMedia() {
        galleryIndex = (galleryIndex - 1 + activeSeries.media.length) % activeSeries.media.length;
        renderGalleryMedia();
        startAutoPlay();
    }

    function closeGallery() {
        galleryOverlay.classList.remove('active');
        galleryVid.pause();
        stopAutoPlay();
        if (!modalOverlay.classList.contains('active')) {
            document.body.classList.remove('no-scroll');
        }
    }

    // --- Autoplay ---
    function startAutoPlay() {
        stopAutoPlay();
        autoPlayInterval = setInterval(() => {
            const m = activeSeries.media[galleryIndex];
            if (m.type === 'video' && !galleryVid.paused) {
                // Wait for video to end via event
            } else {
                nextMedia();
            }
        }, 5000);
    }
    
    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    galleryVid.onended = () => { nextMedia(); };

    // --- Events ---
    function attachEvents() {
        modalCloseBtn.onclick = closeModal;
        modalOverlay.onclick = (e) => { if(e.target === modalOverlay) closeModal(); };

        galleryCloseBtn.onclick = closeGallery;
        galleryNextBtn.onclick = nextMedia;
        galleryPrevBtn.onclick = prevMedia;

        document.addEventListener('keydown', e => {
            if (galleryOverlay.classList.contains('active')) {
                if (e.key === 'Escape') closeGallery();
                if (e.key === 'ArrowRight') nextMedia();
                if (e.key === 'ArrowLeft') prevMedia();
            } else if (modalOverlay.classList.contains('active')) {
                if (e.key === 'Escape') closeModal();
            }
        });
    }

    document.body.classList.add('no-scroll'); // Initially no scroll for splash
    init();
});
