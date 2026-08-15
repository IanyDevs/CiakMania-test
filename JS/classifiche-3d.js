/**
 *CLASSIFICHE & TOP 10 INTERACTIVE ENGINE
 * - Curved cylinder spatial 3D navigation
 * - GSAP power3.inOut physics & inertia dragging
 * - Real-time synchronized HUD rank transitions & dynamic ambient glow
 * - Dynamic CMS Data Connection
 */

(function () {
    'use strict';

    // State
    let currentRankingData = null;
    let rankingItems = [];
    let activeIndex = 0;
    let isAnimating = false;
    let currentTypeFilter = 'all';

    // DOM Elements
    const stageTrack = document.getElementById('stage-3d-track');
    const stageScene = document.getElementById('stage-3d-scene');
    const stageContainer = document.getElementById('ranking-stage');
    const btnPrev = document.getElementById('btn-prev-rank');
    const btnNext = document.getElementById('btn-next-rank');
    const backdropGlow = document.getElementById('ambient-glow-backdrop');

    // HUD Elements
    const hudMasterTitle = document.getElementById('ranking-master-title');
    const hudPeriodLabel = document.getElementById('ranking-period-label');
    const hudTypeLabel = document.getElementById('ranking-type-label');
    const hudTotalCount = document.getElementById('hud-total-count');
    const hudRankNumber = document.getElementById('hud-rank-number');
    const hudMovementBadge = document.getElementById('hud-movement-badge');
    const hudSpecialBadge = document.getElementById('hud-special-badge');
    const hudRatingVal = document.getElementById('hud-rating-val');
    const hudReviewsCount = document.getElementById('hud-reviews-count');
    const hudFilmTitle = document.getElementById('hud-film-title');
    const hudFilmYear = document.getElementById('hud-film-year');
    const hudFilmGenre = document.getElementById('hud-film-genre');
    const hudFilmDesc = document.getElementById('hud-film-description');
    const hudCtaPrimary = document.getElementById('hud-cta-primary');
    const timelineBeam = document.getElementById('timeline-active-glow-beam');
    const timelineStepsContainer = document.getElementById('timeline-steps-container');
    const stateOverlay = document.getElementById('ranking-state-overlay');
    const filterTabs = document.querySelectorAll('#ranking-type-tabs .tab-btn');

    const rankingEditionSwitcher = document.getElementById('multiple-rankings-switcher');
    const dropdownTrigger = document.getElementById('custom-ranking-dropdown-trigger');
    const dropdownMenu = document.getElementById('custom-ranking-dropdown-menu');
    const selectedRankingTitleLabel = document.getElementById('selected-ranking-title-label');
    const btnPrevRankingEdition = document.getElementById('btn-prev-ranking-edition');
    const btnNextRankingEdition = document.getElementById('btn-next-ranking-edition');

    // 3D Geometry Constants
    const RADIUS_CYLINDER = 580; // Distance in Z space
    const ANGLE_STEP = 24;       // Degrees per card

    let categoryRankingsList = []; // List of all rankings for the current active type
    let currentCategoryRankIndex = 0;

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        setupEventListeners();
        loadRankingsForCategory('film', true);
    });

    /**
     * Fetch all rankings available for the selected category (film / serie-tv / articoli)
     */
    function loadRankingsForCategory(type = 'film', isInitialLoad = false) {
        currentTypeFilter = type;
        if (!isInitialLoad) {
            showLoadingState(true, 'Caricamento Classifiche...', 'Ricerca contenuti...');
        }

        CiakAPI.getRankings(type).then(data => {
            if (data && data.status === 'success' && data.rankings && data.rankings.length > 0) {
                categoryRankingsList = data.rankings;
                currentCategoryRankIndex = 0;
                setupRankingsEditionSwitcher();
                loadRankingDetailById(categoryRankingsList[0].id, isInitialLoad);
            } else {
                categoryRankingsList = [];
                if (rankingEditionSwitcher) rankingEditionSwitcher.style.display = 'none';
                renderEmptyState();
            }
        }).catch(err => {
            console.error('Errore nel caricamento delle classifiche:', err);
            renderEmptyState();
        });
    }

    /**
     * Setup the luxury custom dropdown UI when there are multiple rankings for a category
     */
    function setupRankingsEditionSwitcher() {
        if (!rankingEditionSwitcher || !dropdownMenu) return;

        if (categoryRankingsList.length > 1) {
            rankingEditionSwitcher.style.display = 'flex';
            
            const currentRank = categoryRankingsList[currentCategoryRankIndex] || categoryRankingsList[0];
            if (selectedRankingTitleLabel) {
                selectedRankingTitleLabel.textContent = currentRank.title;
            }

            dropdownMenu.innerHTML = categoryRankingsList.map((r, idx) => `
                <div class="custom-dropdown-item" onclick="selectRankingEditionByIndex(${idx})" style="
                    padding: 10px 14px;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: ${idx === currentCategoryRankIndex ? 'rgba(235, 189, 34, 0.12)' : 'transparent'};
                    border: 1px solid ${idx === currentCategoryRankIndex ? 'rgba(235, 189, 34, 0.4)' : 'transparent'};
                    transition: all 0.2s ease;
                    margin-bottom: 2px;
                "
                onmouseover="this.style.background='rgba(235, 189, 34, 0.15)'"
                onmouseout="this.style.background='${idx === currentCategoryRankIndex ? 'rgba(235, 189, 34, 0.12)' : 'transparent'}'"
                >
                    <div>
                        <div style="font-size: 12.5px; font-weight: 700; color: ${idx === currentCategoryRankIndex ? '#EBBD22' : '#FFFFFF'};">
                            ${escapeHTML(r.title)}
                        </div>
                        <div style="font-size: 10.5px; color: #8E8A95; text-transform: uppercase; margin-top: 2px;">
                            ${escapeHTML(r.period || 'Settimanale')} • ${r.items_count || 0} elementi
                        </div>
                    </div>
                    ${idx === currentCategoryRankIndex ? '<span style="color: #EBBD22; font-weight: 900; font-size: 13px;">✓</span>' : ''}
                </div>
            `).join('');
        } else {
            rankingEditionSwitcher.style.display = 'none';
        }
    }

    window.selectRankingEditionByIndex = function(idx) {
        if (idx < 0 || idx >= categoryRankingsList.length) return;
        currentCategoryRankIndex = idx;
        const targetRank = categoryRankingsList[idx];
        if (selectedRankingTitleLabel) selectedRankingTitleLabel.textContent = targetRank.title;
        setupRankingsEditionSwitcher();
        if (dropdownMenu) dropdownMenu.style.display = 'none';
        loadRankingDetailById(targetRank.id);
    };

    /**
     * Load full ranking detail and its items by Ranking ID
     */
    function loadRankingDetailById(rankingId, isInitialLoad = false) {
        if (!isInitialLoad) {
            showLoadingState(true, 'Caricamento Classifica 3D...', 'Elaborazione posizioni e contenuti visivi.');
        }

        CiakAPI.getRankingDetail(rankingId).then(data => {
            showLoadingState(false);
            if (data && data.status === 'success' && data.items && data.items.length > 0) {
                currentRankingData = data.ranking;
                rankingItems = data.items;
                activeIndex = 0;
                renderRankingStage();
            } else {
                renderEmptyState();
            }
        }).catch(err => {
            console.error('Errore nel caricamento del dettaglio classifica:', err);
            renderEmptyState();
        });
    }

    /**
     * Build 3D panels and timeline ribbon
     */
    function renderRankingStage() {
        if (!stageTrack || rankingItems.length === 0) return;

        // Update Top Hero Meta
        if (hudMasterTitle && currentRankingData) {
            hudMasterTitle.textContent = currentRankingData.title || 'Top 10 Ufficiale';
        }
        if (hudPeriodLabel && currentRankingData) {
            hudPeriodLabel.textContent = (currentRankingData.period || 'Settimanale').toUpperCase();
        }
        if (hudTypeLabel && currentRankingData) {
            hudTypeLabel.textContent = (currentRankingData.type === 'serie-tv' ? 'SERIE TV' : 'CINEMA & FILM').toUpperCase();
        }
        if (hudTotalCount) {
            hudTotalCount.textContent = `/ ${String(rankingItems.length).padStart(2, '0')}`;
        }

        // Build 3D Panels
        stageTrack.innerHTML = '';
        rankingItems.forEach((item, index) => {
            const panel = document.createElement('div');
            panel.className = 'stage-poster-panel';
            panel.dataset.index = index;

            const rankPadded = String(item.position || (index + 1)).padStart(2, '0');
            const posterImg = item.image && item.image.trim() !== '' ? item.image : 'ASSETS/Logo_no_bg.webp';
            const badgeHtml = item.badge ? `<div class="panel-badge-pill">${escapeHTML(item.badge)}</div>` : '';

            panel.innerHTML = `
                <div class="panel-inner-wrap">
                    <div class="panel-rank-tag">
                        <span class="tag-hash">#</span>${rankPadded}
                    </div>
                    <img src="${posterImg}" alt="${escapeHTML(item.title)}" class="panel-img" loading="lazy" onerror="this.src='ASSETS/Logo_no_bg.webp'">
                    <div class="panel-vignette"></div>
                    <div class="panel-glass-highlight"></div>
                    ${badgeHtml}
                </div>
            `;

            panel.addEventListener('click', () => {
                if (!isAnimating && activeIndex !== index) {
                    goToIndex(index);
                }
            });

            // 3D Parallax Tilt on Hover (Center active poster)
            panel.addEventListener('mousemove', (e) => {
                if (panel.classList.contains('active-center')) {
                    const rect = panel.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width - 0.5;
                    const y = (e.clientY - rect.top) / rect.height - 0.5;
                    gsap.to(panel, {
                        rotationY: x * 14,
                        rotationX: -y * 14,
                        duration: 0.3,
                        ease: 'power1.out',
                        transformPerspective: 800
                    });
                }
            });

            panel.addEventListener('mouseleave', () => {
                if (panel.classList.contains('active-center')) {
                    gsap.to(panel, {
                        rotationY: 0,
                        rotationX: 0,
                        duration: 0.6,
                        ease: 'power2.out'
                    });
                }
            });

            stageTrack.appendChild(panel);
        });

        // Build Timeline Ribbon
        buildTimelineRibbon();

        // Position all cards in 3D Space
        update3DPositions(0, true);
    }

    /**
     * Build Cinematic Timeline Step Nodes
     */
    function buildTimelineRibbon() {
        if (!timelineStepsContainer) return;
        timelineStepsContainer.innerHTML = '';

        rankingItems.forEach((item, idx) => {
            const btn = document.createElement('button');
            btn.className = `timeline-step-node ${idx === 0 ? 'active' : ''}`;
            btn.dataset.index = idx;
            btn.setAttribute('aria-label', `Vai alla posizione #${idx + 1}`);

            const numStr = String(item.position || (idx + 1)).padStart(2, '0');
            btn.innerHTML = `
                <span class="step-node-dot"></span>
                <span class="step-node-number">${numStr}</span>
            `;

            btn.addEventListener('click', () => {
                if (!isAnimating && activeIndex !== idx) {
                    goToIndex(idx);
                }
            });

            timelineStepsContainer.appendChild(btn);
        });
    }

    /**
     * Update 3D Transform, Depth, Blur, Scale of all elements
     */
    function update3DPositions(progressOffset = 0, instant = false) {
        const panels = stageTrack.querySelectorAll('.stage-poster-panel');
        const count = panels.length;
        if (count === 0) return;

        const currentFloatIndex = activeIndex + progressOffset;

        panels.forEach((panel, i) => {
            const diff = i - currentFloatIndex;
            const absDiff = Math.abs(diff);

            // Angle along curved cylinder
            const angleDeg = diff * ANGLE_STEP;
            const angleRad = (angleDeg * Math.PI) / 180;

            // Coordinate in 3D
            const x = Math.sin(angleRad) * RADIUS_CYLINDER;
            const z = (Math.cos(angleRad) - 1) * RADIUS_CYLINDER;

            // Visual hierarchy parameters
            let scale = Math.max(0.6, 1 - (absDiff * 0.16));
            let opacity = Math.max(0, 1 - (absDiff * 0.28));
            let blur = absDiff > 0.5 ? Math.min(6, (absDiff - 0.4) * 3.5) : 0;
            let brightness = Math.max(0.35, 1 - (absDiff * 0.22));

            if (absDiff > 3.5) {
                opacity = 0;
                panel.style.visibility = 'hidden';
            } else {
                panel.style.visibility = 'visible';
            }

            if (absDiff < 0.4) {
                panel.classList.add('active-center');
            } else {
                panel.classList.remove('active-center');
            }

            const targetProps = {
                x: x,
                y: 0,
                z: z,
                rotationY: angleDeg,
                scale: scale,
                opacity: opacity,
                filter: `blur(${blur}px) brightness(${brightness})`,
                zIndex: Math.round(100 - absDiff * 10),
                duration: instant ? 0 : 0.85,
                ease: 'power3.out'
            };

            if (instant) {
                gsap.set(panel, targetProps);
            } else {
                gsap.to(panel, targetProps);
            }
        });

        // Update Nav Arrows Disabled State (Ordered real list, no false loop)
        if (btnPrev) btnPrev.disabled = (activeIndex === 0);
        if (btnNext) btnNext.disabled = (activeIndex === count - 1);

        // Update Timeline Ribbon
        updateTimelineProgress();
        updateHUDContent(instant);
    }

    /**
     * Staggered HUD Details and Number Transition
     */
    function updateHUDContent(instant = false) {
        const item = rankingItems[activeIndex];
        if (!item) return;

        const rankPadded = String(item.position || (activeIndex + 1)).padStart(2, '0');

        // Animate Big Rank Digit
        if (hudRankNumber && hudRankNumber.textContent !== rankPadded) {
            if (!instant) {
                gsap.to(hudRankNumber, {
                    y: -25,
                    opacity: 0,
                    rotationX: 45,
                    duration: 0.25,
                    ease: 'power2.in',
                    onComplete: () => {
                        hudRankNumber.textContent = rankPadded;
                        gsap.fromTo(hudRankNumber, 
                            { y: 25, opacity: 0, rotationX: -45 }, 
                            { y: 0, opacity: 1, rotationX: 0, duration: 0.45, ease: 'power3.out' }
                        );
                    }
                });
            } else {
                hudRankNumber.textContent = rankPadded;
            }
        }

        // Movement Badge
        if (hudMovementBadge) {
            hudMovementBadge.className = 'hud-movement-badge';
            let icon = '—';
            let text = 'INVARIATA';
            const m = item.movement || 'same';

            if (m === 'up') {
                hudMovementBadge.classList.add('up');
                const diff = (item.previous_position && item.position) ? Math.abs(item.previous_position - item.position) : 1;
                icon = '↑';
                text = `${diff} ${diff === 1 ? 'POSIZIONE' : 'POSIZIONI'}`;
            } else if (m === 'down') {
                hudMovementBadge.classList.add('down');
                const diff = (item.previous_position && item.position) ? Math.abs(item.previous_position - item.position) : 1;
                icon = '↓';
                text = `${diff} ${diff === 1 ? 'POSIZIONE' : 'POSIZIONI'}`;
            } else if (m === 'new') {
                hudMovementBadge.classList.add('new');
                icon = '★';
                text = 'NEW ENTRY';
            } else {
                hudMovementBadge.classList.add('same');
            }

            hudMovementBadge.querySelector('.movement-icon').textContent = icon;
            hudMovementBadge.querySelector('.movement-text').textContent = text;
        }

        // Staggered Entrance of Metadata
        if (!instant) {
            gsap.fromTo([hudFilmTitle, hudFilmDesc, hudSpecialBadge, hudRatingVal, hudFilmGenre],
                { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
            );
        }

        if (hudSpecialBadge) {
            hudSpecialBadge.textContent = item.badge || 'SELEZIONE UFFICIALE';
        }
        if (hudRatingVal) {
            hudRatingVal.textContent = item.rating || '9.0/10';
        }
        if (hudReviewsCount) {
            hudReviewsCount.textContent = item.reviews_count ? `${item.reviews_count} recensioni` : 'Recensioni della Critica';
        }
        if (hudFilmTitle) {
            hudFilmTitle.textContent = item.title;
        }
        if (hudFilmYear) {
            hudFilmYear.textContent = item.year || '2026';
        }
        if (hudFilmGenre) {
            hudFilmGenre.textContent = item.genre || 'Cinema';
        }
        if (hudFilmDesc) {
            hudFilmDesc.textContent = item.description || 'Approfondimento e scheda tecnica del film.';
        }
        if (hudCtaPrimary) {
            hudCtaPrimary.href = item.link_url && item.link_url.trim() !== '' ? item.link_url : `articolo.html?id=${item.movie_id || item.id}`;
        }

        // Dynamic Ambient Glow Color Shift
        extractDominantColorAndSetGlow(item.image);
    }

    /**
     * Timeline beam and active dot sync
     */
    function updateTimelineProgress() {
        const nodes = document.querySelectorAll('.timeline-step-node');
        nodes.forEach((node, idx) => {
            if (idx === activeIndex) {
                node.classList.add('active');
            } else {
                node.classList.remove('active');
            }
        });

        if (timelineBeam && nodes.length > 1) {
            const pct = (activeIndex / (nodes.length - 1)) * 100;
            timelineBeam.style.width = `${pct}%`;
        }
    }

    /**
     * Dynamic Ambient Glow (Adapts hue based on active movie)
     */
    function extractDominantColorAndSetGlow(imgUrl) {
        if (!backdropGlow) return;
        
        // Curated cinematic palette mapping for sleek immersion
        const colorPalette = [
            'radial-gradient(circle at 50% 35%, rgba(235, 189, 34, 0.35) 0%, rgba(186, 43, 178, 0.2) 40%, rgba(8, 7, 10, 0.95) 75%, #08070A 100%)',
            'radial-gradient(circle at 50% 35%, rgba(127, 2, 113, 0.4) 0%, rgba(0, 180, 216, 0.18) 40%, rgba(8, 7, 10, 0.95) 75%, #08070A 100%)',
            'radial-gradient(circle at 50% 35%, rgba(220, 47, 2, 0.35) 0%, rgba(235, 189, 34, 0.18) 40%, rgba(8, 7, 10, 0.95) 75%, #08070A 100%)',
            'radial-gradient(circle at 50% 35%, rgba(0, 119, 182, 0.4) 0%, rgba(186, 43, 178, 0.2) 40%, rgba(8, 7, 10, 0.95) 75%, #08070A 100%)'
        ];

        const selectedGradient = colorPalette[activeIndex % colorPalette.length];
        backdropGlow.style.background = selectedGradient;
    }

    /**
     * Navigation to Index
     */
    function goToIndex(newIndex) {
        if (newIndex < 0 || newIndex >= rankingItems.length || newIndex === activeIndex) return;
        
        isAnimating = true;
        activeIndex = newIndex;
        update3DPositions(0, false);

        setTimeout(() => {
            isAnimating = false;
        }, 850);
    }

    function next() {
        if (activeIndex < rankingItems.length - 1) {
            goToIndex(activeIndex + 1);
        }
    }

    function prev() {
        if (activeIndex > 0) {
            goToIndex(activeIndex - 1);
        }
    }

    /**
     * Setup Controls, Keyboard, Drag & Touch Gestures
     */
    function setupEventListeners() {
        if (btnNext) btnNext.addEventListener('click', next);
        if (btnPrev) btnPrev.addEventListener('click', prev);

        // Keyboard Navigation ← →
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'Right') {
                next();
            } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
                prev();
            }
        });

        // Mouse Drag & Touch Swipe via GSAP Observer
        if (Observer && stageContainer) {
            Observer.create({
                target: stageContainer,
                type: 'pointer,touch',
                onDrag: (self) => {
                    if (Math.abs(self.deltaX) > 40 && !isAnimating) {
                        if (self.deltaX < 0) {
                            next();
                        } else {
                            prev();
                        }
                    }
                },
                tolerance: 20,
                preventDefault: false
            });
        }

        // Category Filter Switchers (Film / Serie TV / Articoli)
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const selectedType = tab.dataset.type || 'film';
                loadRankingsForCategory(selectedType);
            });
        });

        // Custom Luxury Dropdown Toggle & Click Outside Handler
        if (dropdownTrigger && dropdownMenu) {
            dropdownTrigger.addEventListener('click', (e) => {
                // Ignore if clicked on navigation arrows
                if (e.target.closest('#btn-prev-ranking-edition') || e.target.closest('#btn-next-ranking-edition')) {
                    return;
                }
                const isCurrentlyOpen = dropdownMenu.style.display === 'block';
                dropdownMenu.style.display = isCurrentlyOpen ? 'none' : 'block';
                const caret = dropdownTrigger.querySelector('.dropdown-caret-icon');
                if (caret) caret.style.transform = isCurrentlyOpen ? 'rotate(0deg)' : 'rotate(180deg)';
            });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('#custom-ranking-dropdown')) {
                    dropdownMenu.style.display = 'none';
                    const caret = dropdownTrigger.querySelector('.dropdown-caret-icon');
                    if (caret) caret.style.transform = 'rotate(0deg)';
                }
            });
        }

        if (btnPrevRankingEdition) {
            btnPrevRankingEdition.addEventListener('click', (e) => {
                e.stopPropagation();
                if (categoryRankingsList.length <= 1) return;
                currentCategoryRankIndex = (currentCategoryRankIndex - 1 + categoryRankingsList.length) % categoryRankingsList.length;
                window.selectRankingEditionByIndex(currentCategoryRankIndex);
            });
        }

        if (btnNextRankingEdition) {
            btnNextRankingEdition.addEventListener('click', (e) => {
                e.stopPropagation();
                if (categoryRankingsList.length <= 1) return;
                currentCategoryRankIndex = (currentCategoryRankIndex + 1) % categoryRankingsList.length;
                window.selectRankingEditionByIndex(currentCategoryRankIndex);
            });
        }
    }

    /**
     * State Helpers
     */
    function showLoadingState(show, title = '', desc = '') {
        if (!stateOverlay) return;
        if (show) {
            stateOverlay.style.display = 'flex';
            document.getElementById('state-title').textContent = title;
            document.getElementById('state-desc').textContent = desc;
        } else {
            stateOverlay.style.display = 'none';
        }
    }

    function renderEmptyState() {
        if (stageTrack) stageTrack.innerHTML = '';
        if (timelineStepsContainer) timelineStepsContainer.innerHTML = '';
        showLoadingState(true, 'NESSUNA CLASSIFICA DISPONIBILE', 'Nessuna classifica pubblicata per questa categoria al momento.');
        document.querySelector('.state-spinner').style.display = 'none';
    }

    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }

    // Window global share
    window.shareCurrentRank = function () {
        const item = rankingItems[activeIndex];
        if (navigator.share && item) {
            navigator.share({
                title: `${item.title} - #${item.position} in Classifica Ciak Mania`,
                url: window.location.href
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link della classifica copiato negli appunti!');
        }
    };

})();
