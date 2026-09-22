document.addEventListener('DOMContentLoaded', () => {
    // Check if SERIES_DATA is available
    if (!window.SERIES_DATA) {
        console.error('SERIES_DATA is not loaded. Ensure data.js is included before app.js.');
        return;
    }

    const seriesData = window.SERIES_DATA;
    let currentGallerySeries = null;
    let currentGalleryIndex = 0;
    let autoPlayInterval = null;
    let touchStartX = 0;
    let touchEndX = 0;

    // --- DOM Elements ---
    // Screens
    const splashScreen = document.getElementById('splash-screen');
    const browsePage = document.getElementById('browse-page');
    const detailModal = document.getElementById('detail-modal');
    const galleryOverlay = document.getElementById('gallery-overlay');

    // Splash
    const enterBtn = document.getElementById('enter-btn');

    // Navbar
    const navbar = document.getElementById('navbar');

    // Hero
    const heroBg = document.getElementById('hero-bg');
    const heroTitle = document.getElementById('hero-title');
    const heroDescription = document.getElementById('hero-description');
    const heroPlayBtn = document.getElementById('hero-play-btn');
    const heroInfoBtn = document.getElementById('hero-info-btn');

    // Content
    const rowsContainer = document.getElementById('rows-container');

    // Modal
    const modalClose = document.getElementById('modal-close');
    const modalHeroImg = document.getElementById('modal-hero-img');
    const modalTitle = document.getElementById('modal-title');
    const modalMatch = document.getElementById('modal-match');
    const modalYear = document.getElementById('modal-year');
    const modalEpisodeCount = document.getElementById('modal-episode-count');
    const modalGenre = document.getElementById('modal-genre');
    const modalDescription = document.getElementById('modal-description');
    const modalPlayAll = document.getElementById('modal-play-all');
    const modalEpisodesGrid = document.getElementById('modal-episodes-grid');

    // Gallery
    const galleryClose = document.getElementById('gallery-close');
    const galleryImage = document.getElementById('gallery-image');
    const galleryVideo = document.getElementById('gallery-video');
    const galleryPrev = document.getElementById('gallery-prev');
    const galleryNext = document.getElementById('gallery-next');
    const galleryCounter = document.getElementById('gallery-counter');
    const galleryProgressBar = document.getElementById('gallery-progress-bar');

    // --- 1. App Initialization ---
    function init() {
        initHero();
        generateContentRows();
        attachEventListeners();
    }

    function getSeriesById(id) {
        return seriesData.find(s => s.id === id);
    }

    function initHero() {
        // Set hero to 'european-dream' or fallback to the first available
        const heroSeries = getSeriesById('european-dream') || seriesData[0];
        if (!heroSeries) return;

        const firstMedia = heroSeries.media && heroSeries.media[0];
        if (firstMedia && heroBg) {
            heroBg.style.backgroundImage = `url('${firstMedia.src}')`;
        }
        
        if (heroTitle) heroTitle.textContent = heroSeries.title;
        if (heroDescription) heroDescription.textContent = heroSeries.description;

        if (heroPlayBtn) {
            heroPlayBtn.addEventListener('click', () => {
                openGallery(heroSeries.id, 0);
            });
        }
        
        if (heroInfoBtn) {
            heroInfoBtn.addEventListener('click', () => {
                openModal(heroSeries.id);
            });
        }
    }

    // --- 2. Splash Screen Transition ---
    if (enterBtn && splashScreen && browsePage) {
        enterBtn.addEventListener('click', () => {
            // Prevent scrolling during transition
            document.body.classList.add('no-scroll');
            
            // Fade out splash
            splashScreen.classList.remove('active');
            
            // Wait for CSS transition (assumed 800ms) before swapping display states
            setTimeout(() => {
                splashScreen.style.display = 'none';
                browsePage.style.display = 'block';
                document.body.classList.remove('no-scroll');
            }, 800);
        });
    } else {
        // Fallback if splash screen elements are missing
        if (splashScreen) splashScreen.style.display = 'none';
        if (browsePage) browsePage.style.display = 'block';
    }

    // --- 3. Navbar Scroll Effect ---
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // --- 4. Content Row Generation ---
    function generateContentRows() {
        if (!rowsContainer) return;
        
        seriesData.forEach(series => {
            if (!series.media || series.media.length === 0) return;

            // Create row container
            const rowDiv = document.createElement('div');
            rowDiv.className = 'content-row';
            rowDiv.dataset.seriesId = series.id;

            // Create header
            const rowHeader = document.createElement('div');
            rowHeader.className = 'row-header';
            rowHeader.innerHTML = `<h2 class="row-title">${series.title}</h2>`;

            // Create slider wrapper
            const sliderWrapper = document.createElement('div');
            sliderWrapper.className = 'row-slider-wrapper';

            // Left arrow
            const leftArrow = document.createElement('button');
            leftArrow.className = 'row-arrow arrow-left';
            leftArrow.innerHTML = `<svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;

            // Slider container
            const slider = document.createElement('div');
            slider.className = 'row-slider';

            // Right arrow
            const rightArrow = document.createElement('button');
            rightArrow.className = 'row-arrow arrow-right';
            rightArrow.innerHTML = `<svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

            // Generate cards
            series.media.forEach((mediaItem, index) => {
                const card = document.createElement('div');
                card.className = 'card';
                card.dataset.seriesId = series.id;
                card.dataset.index = index;

                let mediaIconOverlay = '';
                if (mediaItem.type === 'video') {
                    mediaIconOverlay = `
                        <div style="position:absolute; top:5px; right:5px; background:rgba(0,0,0,0.6); border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; pointer-events:none; z-index:2;">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="white" style="margin-left: 2px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        </div>
                    `;
                }

                card.innerHTML = `
                    <img class="card-img" src="${mediaItem.src}" alt="Episode ${index + 1}" loading="lazy">
                    ${mediaIconOverlay}
                    <div class="card-hover-content">
                        <span class="card-hover-title">Episode ${index + 1}</span>
                    </div>
                `;

                // Card click -> open detail modal
                card.addEventListener('click', () => {
                    openModal(series.id);
                });

                slider.appendChild(card);
            });

            // --- 5. Row Arrow Navigation ---
            leftArrow.addEventListener('click', () => {
                slider.scrollBy({ left: -(slider.clientWidth * 0.75), behavior: 'smooth' });
            });
            
            rightArrow.addEventListener('click', () => {
                slider.scrollBy({ left: slider.clientWidth * 0.75, behavior: 'smooth' });
            });

            // Assemble row
            sliderWrapper.appendChild(leftArrow);
            sliderWrapper.appendChild(slider);
            sliderWrapper.appendChild(rightArrow);

            rowDiv.appendChild(rowHeader);
            rowDiv.appendChild(sliderWrapper);
            rowsContainer.appendChild(rowDiv);
        });
    }

    // --- 6. Detail Modal ---
    function openModal(seriesId) {
        const series = getSeriesById(seriesId);
        if (!series || !detailModal) return;

        // Populate modal data
        if (modalHeroImg && series.media && series.media.length > 0) {
            modalHeroImg.src = series.media[0].src;
        }

        if (modalTitle) modalTitle.textContent = series.title;
        if (modalMatch) modalMatch.textContent = series.match || '98% Match';
        if (modalYear) modalYear.textContent = series.year || new Date().getFullYear();
        if (modalEpisodeCount) modalEpisodeCount.textContent = series.media ? `${series.media.length} Episodes` : '0 Episodes';
        if (modalGenre) modalGenre.textContent = series.genre || '';
        if (modalDescription) modalDescription.textContent = series.description || '';

        // Generate episode grid
        if (modalEpisodesGrid) {
            modalEpisodesGrid.innerHTML = '';
            if (series.media) {
                series.media.forEach((mediaItem, index) => {
                    const epCard = document.createElement('div');
                    epCard.className = 'episode-card';
                    epCard.dataset.index = index;

                    let playIcon = '';
                    if (mediaItem.type === 'video') {
                        playIcon = `
                            <div class="episode-play-icon" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.6); border-radius:50%; width:40px; height:40px; display:flex; align-items:center; justify-content:center; border: 2px solid white; z-index:2; pointer-events:none;">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="white" style="margin-left:4px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            </div>
                        `;
                    }

                    epCard.innerHTML = `
                        <div class="episode-thumb" style="position:relative; cursor:pointer;">
                            <img src="${mediaItem.src}" alt="Episode ${index + 1}" loading="lazy" style="width:100%; height:auto; display:block; border-radius:4px;">
                            <span class="episode-number" style="position:absolute; bottom:5px; left:5px; background:rgba(0,0,0,0.7); color:white; padding:2px 6px; border-radius:4px; font-size:12px; font-weight:bold; z-index:2;">${index + 1}</span>
                            ${playIcon}
                        </div>
                        <div class="episode-title" style="padding:10px 0; font-size:14px; font-weight:bold; color:#fff;">Episode ${index + 1}</div>
                    `;

                    epCard.addEventListener('click', () => {
                        openGallery(series.id, index);
                    });

                    modalEpisodesGrid.appendChild(epCard);
                });
            }
        }

        // Setup Play All button
        if (modalPlayAll) {
            // Clone and replace to remove old event listeners
            const newPlayAllBtn = modalPlayAll.cloneNode(true);
            modalPlayAll.parentNode.replaceChild(newPlayAllBtn, modalPlayAll);
            // Re-assign the reference in case it's used elsewhere, though we don't in this scope
            newPlayAllBtn.addEventListener('click', () => {
                openGallery(series.id, 0);
            });
        }

        detailModal.classList.add('active');
        document.body.classList.add('no-scroll');
    }

    function closeModal() {
        if (!detailModal) return;
        detailModal.classList.remove('active');
        
        // Only remove no-scroll if gallery isn't open
        if (!galleryOverlay || !galleryOverlay.classList.contains('active')) {
            document.body.classList.remove('no-scroll');
        }
    }

    // --- 7. Gallery / Player ---
    function openGallery(seriesId, startIndex) {
        const series = getSeriesById(seriesId);
        if (!series || !series.media || !galleryOverlay) return;

        currentGallerySeries = series;
        currentGalleryIndex = startIndex;

        galleryOverlay.classList.add('active');
        document.body.classList.add('no-scroll');
        
        displayMedia(currentGalleryIndex);
        startAutoPlay();
    }

    function displayMedia(index) {
        if (!currentGallerySeries || !currentGallerySeries.media) return;
        
        const media = currentGallerySeries.media[index];
        if (!media) return;

        const visualElement = media.type === 'video' ? galleryVideo : galleryImage;
        const otherElement = media.type === 'video' ? galleryImage : galleryVideo;

        // Prepare crossfade
        if (visualElement) visualElement.style.opacity = '0';
        if (otherElement) otherElement.style.display = 'none';
        if (visualElement) visualElement.style.display = 'block';

        if (media.type === 'video') {
            if (galleryVideo) {
                galleryVideo.src = media.src;
                // Auto-play the video
                galleryVideo.play().catch(e => console.warn('Video auto-play prevented:', e));
            }
        } else {
            if (galleryImage) galleryImage.src = media.src;
        }
        
        // Ensure other media type is stopped
        if (media.type === 'image' && galleryVideo) {
            galleryVideo.pause();
            galleryVideo.removeAttribute('src'); // Stop downloading
            galleryVideo.load();
        }

        // Execute fade in
        requestAnimationFrame(() => {
            setTimeout(() => {
                if (visualElement) {
                    visualElement.style.transition = 'opacity 0.3s ease-in-out';
                    visualElement.style.opacity = '1';
                }
            }, 50);
        });

        // Update progress UI
        if (galleryCounter) {
            galleryCounter.textContent = `${index + 1} / ${currentGallerySeries.media.length}`;
        }
        if (galleryProgressBar) {
            const percentage = ((index + 1) / currentGallerySeries.media.length) * 100;
            galleryProgressBar.style.width = `${percentage}%`;
        }
    }

    function nextMedia() {
        if (!currentGallerySeries) return;
        currentGalleryIndex++;
        if (currentGalleryIndex >= currentGallerySeries.media.length) {
            currentGalleryIndex = 0; // Loop to start
        }
        displayMedia(currentGalleryIndex);
        resetAutoPlay();
    }

    function prevMedia() {
        if (!currentGallerySeries) return;
        currentGalleryIndex--;
        if (currentGalleryIndex < 0) {
            currentGalleryIndex = currentGallerySeries.media.length - 1; // Loop to end
        }
        displayMedia(currentGalleryIndex);
        resetAutoPlay();
    }

    function closeGallery() {
        if (!galleryOverlay) return;
        galleryOverlay.classList.remove('active');
        
        if (galleryVideo) {
            galleryVideo.pause();
            galleryVideo.removeAttribute('src');
            galleryVideo.load();
        }
        if (galleryImage) {
            galleryImage.src = '';
        }
        
        currentGallerySeries = null;
        stopAutoPlay();

        // Only remove no-scroll if detail modal isn't open
        if (!detailModal || !detailModal.classList.contains('active')) {
            document.body.classList.remove('no-scroll');
        }
    }

    // --- 8. Touch/Swipe Support for Gallery ---
    function handleTouchStart(e) {
        if (e.changedTouches && e.changedTouches.length > 0) {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoPlay(); // Pause autoplay on interaction
        }
    }

    function handleTouchEnd(e) {
        if (e.changedTouches && e.changedTouches.length > 0) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            startAutoPlay(); // Resume autoplay after interaction
        }
    }

    function handleSwipe() {
        const threshold = 50;
        if (touchEndX < touchStartX - threshold) {
            // Swiped left -> next
            nextMedia();
        }
        if (touchEndX > touchStartX + threshold) {
            // Swiped right -> prev
            prevMedia();
        }
    }

    // --- 9. Auto-play (Optional but requested) ---
    function startAutoPlay() {
        stopAutoPlay();
        autoPlayInterval = setInterval(() => {
            if (currentGallerySeries) {
                const currentMedia = currentGallerySeries.media[currentGalleryIndex];
                if (currentMedia && currentMedia.type === 'video') {
                    // Let the video 'ended' event handle progression if it's currently playing
                    if (galleryVideo && galleryVideo.paused) {
                        nextMedia();
                    }
                } else {
                    nextMedia();
                }
            }
        }, 5000);
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    }

    function resetAutoPlay() {
        startAutoPlay();
    }

    // --- 10. Event Listeners Attachment ---
    function attachEventListeners() {
        // Modal Events
        if (modalClose) modalClose.addEventListener('click', closeModal);
        if (detailModal) {
            detailModal.addEventListener('click', (e) => {
                // Close if clicking the overlay background directly
                if (e.target === detailModal) closeModal();
            });
        }

        // Gallery Events
        if (galleryClose) galleryClose.addEventListener('click', closeGallery);
        if (galleryPrev) galleryPrev.addEventListener('click', prevMedia);
        if (galleryNext) galleryNext.addEventListener('click', nextMedia);

        if (galleryOverlay) {
            galleryOverlay.addEventListener('touchstart', handleTouchStart, { passive: true });
            galleryOverlay.addEventListener('touchend', handleTouchEnd, { passive: true });
            
            // Reset autoplay on mouse movement as a form of interaction
            galleryOverlay.addEventListener('mousemove', () => {
                if (autoPlayInterval) resetAutoPlay();
            });
            
            galleryOverlay.addEventListener('click', (e) => {
                // Click overlay background to close
                if (e.target === galleryOverlay) closeGallery();
            });
        }

        // Video Events
        if (galleryVideo) {
            // Auto advance when video naturally finishes
            galleryVideo.addEventListener('ended', nextMedia);
            galleryVideo.addEventListener('play', stopAutoPlay);
            galleryVideo.addEventListener('pause', startAutoPlay);
        }

        // Keyboard Navigation
        document.addEventListener('keydown', (e) => {
            if (galleryOverlay && galleryOverlay.classList.contains('active')) {
                if (e.key === 'Escape') closeGallery();
                if (e.key === 'ArrowRight') nextMedia();
                if (e.key === 'ArrowLeft') prevMedia();
            } else if (detailModal && detailModal.classList.contains('active')) {
                if (e.key === 'Escape') closeModal();
            }
        });
    }

    // Initialize the application
    init();
});
