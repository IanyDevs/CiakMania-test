function formatItalianDate(dateStr) {
    if (!dateStr) return '';
    const translations = {
        'January': 'Gennaio', 'February': 'Febbraio', 'March': 'Marzo',
        'April': 'Aprile', 'May': 'Maggio', 'June': 'Giugno',
        'July': 'Luglio', 'August': 'Agosto', 'September': 'Settembre',
        'October': 'Ottobre', 'November': 'Novembre', 'December': 'Dicembre',
        'Jan': 'Gen', 'Feb': 'Feb', 'Mar': 'Mar', 'Apr': 'Apr',
        'May': 'Mag', 'Jun': 'Giu', 'Jul': 'Lug', 'Aug': 'Ago',
        'Sep': 'Set', 'Oct': 'Ott', 'Nov': 'Nov', 'Dec': 'Dic'
    };
    let formatted = dateStr;
    for (const [eng, ita] of Object.entries(translations)) {
        formatted = formatted.replace(new RegExp(eng, 'gi'), ita);
    }
    return formatted;
}

document.addEventListener('DOMContentLoaded', () => {
    const ultimeGrid = document.getElementById('ultime-notizie-grid');
    const recensioniGrid = document.getElementById('recensioni-highlights-grid');
    const classificheContainer = document.getElementById('classifiche-list-container');
    const releasesContainer = document.getElementById('sidebar-releases-container');
    const trailersGrid = document.getElementById('trailers-grid-container');
    const featuredGrid = document.getElementById('featured-grid');
    const heroSection = document.getElementById('hero-section');
    
    // --- LOAD ALL FRONTEND ARTICLES (DUAL: MYSQL & SUPABASE) ---
    CiakAPI.getArticles().then(data => {
        if (data && data.status === 'success') {
            const publishedArticles = (data.articles || []).filter(art => art.status === 'pubblicato');

            // 1. POPULATE HERO / COVER STORIES (Home Only)
            if (featuredGrid && publishedArticles.length > 0) {
                if (heroSection) heroSection.style.display = 'block';
                featuredGrid.innerHTML = '';
                
                const mainArt = publishedArticles[0];
                let featuredHTML = `
                    <div class="featured-main" onclick="if(!event.target.closest('a')) window.location.href='articolo.html?id=${mainArt.id}&from=home'">
                        <img src="${mainArt.image || 'ASSETS/no_image.png'}" alt="${mainArt.title}">
                        <div class="featured-content">
                            <span class="category-tag">${mainArt.category.toUpperCase()}</span>
                            <h2><a href="articolo.html?id=${mainArt.id}&from=home">${mainArt.title}</a></h2>
                            <p>${mainArt.excerpt || ''}</p>
                            <a href="articolo.html?id=${mainArt.id}&from=home" class="read-btn">Leggi l'articolo</a>
                        </div>
                    </div>
                `;
                
                if (publishedArticles.length > 1) {
                    featuredHTML += `<div class="featured-side-stack">`;
                    for (let i = 1; i < Math.min(3, publishedArticles.length); i++) {
                        const sideArt = publishedArticles[i];
                        featuredHTML += `
                            <div class="side-card" onclick="if(!event.target.closest('a')) window.location.href='articolo.html?id=${sideArt.id}&from=home'">
                                <div class="side-card-img-wrapper">
                                    <img src="${sideArt.image || 'ASSETS/no_image.png'}" alt="${sideArt.title}">
                                </div>
                                <div class="side-card-content">
                                    <span class="category-tag">${sideArt.category.toUpperCase()}</span>
                                    <h3><a href="articolo.html?id=${sideArt.id}&from=home">${sideArt.title}</a></h3>
                                </div>
                            </div>
                        `;
                    }
                    featuredHTML += `</div>`;
                }
                featuredGrid.innerHTML = featuredHTML;
            }

            // 2. POPULATE ULTIMI ARTICOLI (Mostra gli ultimi 6 articoli in generale di qualsiasi categoria)
            if (ultimeGrid) {
                ultimeGrid.innerHTML = '';
                const latestArticles = publishedArticles.slice(0, 6);

                if (latestArticles.length === 0) {
                    ultimeGrid.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding: 40px 0; color:var(--color-text-muted); font-size: 15px; font-style: italic;">Nessun articolo disponibile al momento.</p>';
                } else {
                    latestArticles.forEach((art, idx) => renderArticleCard(art, ultimeGrid, idx));
                }
            }

            // 3. POPULATE LE NOSTRE RECENSIONI
            if (recensioniGrid) {
                recensioniGrid.innerHTML = '';
                const reviewArticles = publishedArticles.filter(art => art.rating !== null && art.rating !== '');
                const reviewSection = recensioniGrid.closest('.reviews-section-wrapper') || recensioniGrid.closest('section');
                if (reviewArticles.length === 0) {
                    if (reviewSection) reviewSection.style.display = 'none';
                } else {
                    if (reviewSection) reviewSection.style.display = 'block';
                    reviewArticles.slice(0, 4).forEach((art, idx) => renderArticleCard(art, recensioniGrid, idx));
                }
            }

            // 4. POPULATE VERTICAL SIDEBAR: CLASSIFICHE & TOP 10 (Dynamic from Rankings Table / Fallback)
            if (classificheContainer) {
                fetch('api/api.php?action=get_ranking_detail')
                .then(r => r.json())
                .then(rankData => {
                    if (rankData.status === 'success' && rankData.items && rankData.items.length > 0) {
                        const top3 = rankData.items.slice(0, 3);
                        classificheContainer.innerHTML = top3.map((it, idx) => `
                            <div class="classifiche-item" style="cursor:pointer;" onclick="window.location.href='classifiche.html'">
                                <div class="classifiche-number">${String(it.position || idx + 1).padStart(2, '0')}</div>
                                <div>
                                    <span class="category-tag" style="font-size:9px; padding:2px 6px; background: rgba(235, 189, 34, 0.15); color: #EBBD22; border: 1px solid rgba(235, 189, 34, 0.3);">${escapeHTML(it.badge || (it.genre ? it.genre.split('·')[0].trim() : 'TOP 10'))}</span>
                                    <h4 style="font-size:15px; margin-top:4px; color: var(--color-text-main); font-weight: 700;">${escapeHTML(it.title)}</h4>
                                </div>
                            </div>
                        `).join('') + `
                            <div style="margin-top: 18px; text-align: center;">
                                <a href="classifiche.html" class="read-btn" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; width: 100%; padding: 12px 18px; background: linear-gradient(135deg, #EBBD22 0%, #d4a513 100%); color: #161918; border-radius: var(--border-radius-pill); box-shadow: 0 4px 15px rgba(235,189,34,0.25); text-decoration: none;">
                                    Mostra tutti
                                    <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: currentColor;"><path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.29-1.42 1.42 5.43 5.43H5v2z"/></svg>
                                </a>
                            </div>
                        `;
                    } else {
                        // Fallback agli articoli
                        let catClassifiche = publishedArticles.filter(art => isClassifica(art));
                        if (catClassifiche.length === 0) catClassifiche = [...publishedArticles].sort((a,b) => b.id - a.id).slice(0, 3);
                        else catClassifiche = catClassifiche.slice(0, 3);

                        classificheContainer.innerHTML = catClassifiche.map((art, idx) => `
                            <div class="classifiche-item" style="cursor:pointer;" onclick="window.location.href='classifiche.html'">
                                <div class="classifiche-number">0${idx + 1}</div>
                                <div>
                                    <span class="category-tag" style="font-size:9px; padding:2px 6px;">${art.category.toUpperCase()}</span>
                                    <h4 style="font-size:15px; margin-top:4px;">${art.title}</h4>
                                </div>
                            </div>
                        `).join('') + `
                            <div style="margin-top: 18px; text-align: center;">
                                <a href="classifiche.html" class="read-btn" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; width: 100%; padding: 12px 18px; background: linear-gradient(135deg, #EBBD22 0%, #d4a513 100%); color: #161918; border-radius: var(--border-radius-pill); box-shadow: 0 4px 15px rgba(235,189,34,0.25); text-decoration: none;">
                                    Mostra tutti
                                    <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: currentColor;"><path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.29-1.42 1.42 5.43 5.43H5v2z"/></svg>
                                </a>
                            </div>
                        `;
                    }
                })
                .catch(() => {
                    // Fail-safe
                });
            }

            // 5. POPULATE PROSSIME USCITE
            if (releasesContainer) {
                releasesContainer.innerHTML = '';
                const releases = publishedArticles.filter(art => art.status === 'pubblicato').slice(0, 3);
                releasesContainer.innerHTML = releases.map(art => `
                    <div class="release-card" style="cursor:pointer;" onclick="window.location.href='articolo.html?id=${art.id}'">
                        <div class="release-date-badge">
                            <span class="day">12</span>
                            <span class="month">SET</span>
                        </div>
                        <div class="release-info">
                            <h4>${art.title}</h4>
                            <span>Cinema</span>
                        </div>
                    </div>
                `).join('');
            }

            // 6. POPULATE TRAILERS (1 Big Featured + 4 Smaller Side Trailers)
            if (trailersGrid) {
                trailersGrid.innerHTML = '';
                const videoArticles = publishedArticles.filter(art => {
                    if (!art) return false;
                    const content = (art.content || '').toLowerCase();
                    const tags = (art.tags || '').toLowerCase();
                    const category = (art.category || '').toLowerCase();
                    const videoField = (art.video || '').toLowerCase();

                    if (videoField.trim().length > 0) return true;
                    if (content.includes('<iframe') || content.includes('<video') || content.includes('youtube') || content.includes('youtu.be') || content.includes('vimeo') || content.includes('.mp4') || content.includes('.webm')) {
                        return true;
                    }
                    if (tags.includes('trailer') || tags.includes('video') || category.includes('trailer') || category.includes('video')) {
                        return true;
                    }
                    return false;
                }).slice(0, 5);

                const trailerSection = trailersGrid.closest('section');
                if (videoArticles.length === 0) {
                    if (trailerSection) trailerSection.style.display = 'none';
                } else {
                    if (trailerSection) trailerSection.style.display = 'block';

                    const mainTrailer = videoArticles[0];
                    const sideTrailers = videoArticles.slice(1, 5);

                    let html = `
                        <div class="trailers-featured-layout">
                            <!-- 1 Big Featured Trailer -->
                            <div class="trailer-main-card" onclick="window.location.href='articolo.html?id=${mainTrailer.id}'">
                                <div class="trailer-thumb-wrapper">
                                    <img src="${mainTrailer.image || 'ASSETS/no_image.png'}" alt="${mainTrailer.title}">
                                    <div class="play-icon-overlay">
                                        <svg viewBox="0 0 24 24" style="width:64px; height:64px;"><path d="M8 5v14l11-7z"/></svg>
                                    </div>
                                </div>
                                <div class="trailer-card-info" style="padding: 20px;">
                                    <span class="category-tag">${mainTrailer.category.toUpperCase()}</span>
                                    <h3 style="font-size: 20px; font-family: var(--font-editorial); margin-top: 8px; line-height: 1.3;">Guarda il trailer di ${mainTrailer.title}</h3>
                                    <p style="font-size: 13.5px; color: var(--color-text-muted); margin-top: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${mainTrailer.excerpt || ''}</p>
                                </div>
                            </div>
                    `;

                    if (sideTrailers.length > 0) {
                        html += `<div class="trailer-side-grid">`;
                        sideTrailers.forEach(art => {
                            html += `
                                <div class="trailer-small-card" onclick="window.location.href='articolo.html?id=${art.id}'">
                                    <div class="trailer-thumb-wrapper">
                                        <img src="${art.image || 'ASSETS/no_image.png'}" alt="${art.title}">
                                        <div class="play-icon-overlay">
                                            <svg viewBox="0 0 24 24" style="width:36px; height:36px;"><path d="M8 5v14l11-7z"/></svg>
                                        </div>
                                    </div>
                                    <div class="trailer-card-info">
                                        <span class="category-tag" style="font-size: 9px; padding: 2px 6px;">${art.category.toUpperCase()}</span>
                                        <h4>Guarda il trailer di ${art.title}</h4>
                                    </div>
                                </div>
                            `;
                        });
                        html += `</div>`;
                    }

                    html += `</div>`;
                    trailersGrid.innerHTML = html;
                }
            }

            // 7. POPULATE EVENTI & FESTIVAL SECTION
            const eventsGrid = document.getElementById('events-grid-container');
            if (eventsGrid) {
                eventsGrid.innerHTML = '';
                const eventArticles = publishedArticles.filter(art => isEvent(art));
                const eventsSection = eventsGrid.closest('.events-section-wrapper') || document.getElementById('events-section');

                if (eventArticles.length === 0) {
                    if (eventsSection) eventsSection.style.display = 'none';
                } else {
                    if (eventsSection) eventsSection.style.display = 'block';
                    eventArticles.slice(0, 4).forEach(art => renderArticleCard(art, eventsGrid));
                }
            }

            // 7b. POPULATE INTERVISTE SECTION
            const intervisteGrid = document.getElementById('interviste-grid-container');
            if (intervisteGrid) {
                intervisteGrid.innerHTML = '';
                const interviewArticles = publishedArticles.filter(art => isInterview(art));
                const intervisteSection = intervisteGrid.closest('.interviste-section-wrapper') || document.getElementById('interviste-section');

                if (interviewArticles.length === 0) {
                    if (intervisteSection) intervisteSection.style.display = 'none';
                } else {
                    if (intervisteSection) intervisteSection.style.display = 'block';
                    interviewArticles.slice(0, 4).forEach(art => renderArticleCard(art, intervisteGrid));
                }
            }

            // 8. POPULATE HORIZONTAL PIÙ LETTI / PIÙ VISTI SECTION (TOP 3 PIÙ VISTI)
            const classificheGrid = document.getElementById('classifiche-grid-container');
            if (classificheGrid) {
                classificheGrid.innerHTML = '';
                // Ordinamento sincronizzato in tempo reale per numero di visualizzazioni reali (views)
                const popularArticles = [...publishedArticles]
                    .sort((a,b) => (parseInt(b.views, 10) || 0) - (parseInt(a.views, 10) || 0) || b.id - a.id)
                    .slice(0, 3);
                const piuLettiSection = classificheGrid.closest('.piu-letti-section-wrapper') || document.getElementById('piu-letti-section');

                if (popularArticles.length === 0) {
                    if (piuLettiSection) piuLettiSection.style.display = 'none';
                } else {
                    if (piuLettiSection) piuLettiSection.style.display = 'block';
                    classificheGrid.innerHTML = popularArticles.map((art, idx) => `
                        <div class="classifiche-ranking-card" onclick="window.location.href='articolo.html?id=${art.id}&from=home'">
                            <div class="classifiche-thumb-box">
                                <img src="${art.image || 'ASSETS/no_image.png'}" alt="${art.title}" loading="lazy">
                            </div>
                            <div class="classifiche-card-info">
                                <span class="category-tag-sm">${(art.category || 'CINEMA').toUpperCase()}</span>
                                <h4>${art.title}</h4>
                            </div>
                            <div class="classifiche-rank-number">${idx + 1}</div>
                        </div>
                    `).join('');
                }
            }

            // 9. FILTER TABS HANDLER (Home Page Ultimi Articoli)
            const filterTabs = document.querySelectorAll('.filter-tabs .filter-tab');
            if (filterTabs.length > 0) {
                filterTabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        filterTabs.forEach(t => t.classList.remove('active'));
                        tab.classList.add('active');

                        const filterValue = (tab.getAttribute('data-filter') || 'all').toLowerCase();
                        const cards = document.querySelectorAll('#ultime-notizie-grid .cinema-card-box, #ultime-notizie-grid .article-card');

                        cards.forEach(card => {
                            const cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
                            const cardTags = (card.getAttribute('data-tags') || '').toLowerCase();
                            const cardTitle = (card.getAttribute('data-title') || '').toLowerCase();
                            const hasRating = card.getAttribute('data-has-rating') === 'true';

                            if (filterValue === 'all') {
                                card.style.display = '';
                            } else if (filterValue === 'film' && (cardCategory === 'film' || cardCategory.includes('film'))) {
                                card.style.display = '';
                            } else if (filterValue === 'serie-tv' && (cardCategory === 'serie-tv' || cardCategory.includes('serie'))) {
                                card.style.display = '';
                            } else if (filterValue === 'recensioni' && (hasRating || cardCategory === 'recensioni' || cardCategory.includes('recensio'))) {
                                card.style.display = '';
                            } else if (filterValue === 'eventi' && isEvent({ category: cardCategory, tags: cardTags, title: cardTitle })) {
                                card.style.display = '';
                            } else if (filterValue === 'classifiche' && isClassifica({ category: cardCategory, tags: cardTags, title: cardTitle })) {
                                card.style.display = '';
                            } else if (cardCategory === filterValue) {
                                card.style.display = '';
                            } else {
                                card.style.display = 'none';
                            }
                        });
                    });
                });
            }
        }
    });

    function isEvent(art) {
        if (!art) return false;
        const cat = (art.category || '').toLowerCase();
        const tags = (art.tags || '').toLowerCase();
        const title = (art.title || '').toLowerCase();

        if (cat.includes('event') || cat.includes('festival') || cat.includes('mostra')) return true;
        if (tags.includes('event') || tags.includes('festival') || tags.includes('mostra')) return true;
        if (title.includes('festival') || title.includes('evento')) return true;
        return false;
    }

    function isClassifica(art) {
        if (!art) return false;
        const cat = (art.category || '').toLowerCase();
        const tags = (art.tags || '').toLowerCase();
        const title = (art.title || '').toLowerCase();

        if (cat.includes('classific') || cat.includes('ranking') || cat.includes('top')) return true;
        if (tags.includes('classific') || tags.includes('ranking') || tags.includes('top')) return true;
        if (title.includes('classific') || title.includes('top 10') || title.includes('top 5') || title.includes('classifica')) return true;
        return false;
    }

    function isInterview(art) {
        if (!art) return false;
        const cat = (art.category || '').toLowerCase();
        const tags = (art.tags || '').toLowerCase();
        const title = (art.title || '').toLowerCase();

        if (cat === 'interviste' || cat.includes('intervist')) return true;
        if (tags.includes('intervist') || tags.includes('interview')) return true;
        if (title.includes('intervista') || title.includes('a tu per tu con')) return true;
        return false;
    }

    function renderArticleCard(art, container, index = 0) {
        const card = document.createElement('article');
        card.className = 'cinema-card-box';

        card.setAttribute('data-category', art.category || '');
        card.setAttribute('data-tags', art.tags || '');
        card.setAttribute('data-title', art.title || '');
        card.setAttribute('data-has-rating', (art.rating !== null && art.rating !== '') ? 'true' : 'false');
        
        const badgeMarkup = art.rating ? `
            <div class="card-score-badge">
                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                <span>${art.rating}</span>
            </div>
        ` : '';
        
        const wordCount = (art.content || art.excerpt || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
        const readTime = Math.max(1, Math.ceil(wordCount / 180));
        const artImage = (art.image && art.image.trim() !== '') ? art.image : 'ASSETS/no_image.png';

        const curPath = window.location.pathname.toLowerCase();
        let curPage = 'home';
        if (curPath.includes('film.html')) curPage = 'film';
        else if (curPath.includes('serie-tv.html')) curPage = 'serie-tv';
        else if (curPath.includes('recensioni.html')) curPage = 'recensioni';
        else if (curPath.includes('classifiche.html')) curPage = 'classifiche';
        else if (curPath.includes('articoli.html')) {
            const urlP = new URLSearchParams(window.location.search);
            const f = urlP.get('filter');
            curPage = f ? `articoli-${f}` : 'articoli';
        }

        const articleHref = `articolo.html?id=${art.id}&from=${curPage}`;

        card.innerHTML = `
            <div class="card-poster-stage">
                <img src="${artImage}" alt="${art.title}" loading="lazy" onerror="this.src='ASSETS/no_image.png'">
                <div class="card-floating-tags">
                    <span class="card-genre-pill">${(art.category || 'CINEMA').toUpperCase()}</span>
                    ${badgeMarkup}
                </div>
            </div>
            <div class="card-chronology">
                <span class="chronology-date">${formatItalianDate(art.date)}</span>
                <span class="chronology-dot"></span>
                <span class="chronology-read">${readTime} MIN LETTURA</span>
            </div>
            <h3 class="card-headline"><a href="${articleHref}">${art.title}</a></h3>
            <p class="card-synopsis">${art.excerpt || ''}</p>
            <div class="card-bottom-row">
                <span class="card-read-more-link">
                    <span>Leggi l'articolo</span>
                    <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
            </div>
        `;
        
        card.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;
            window.location.href = articleHref;
        });

        container.appendChild(card);
    }
    window.renderArticleCard = renderArticleCard;

    // --- DYNAMIC ARTICLE DETAIL PAGE (DUAL: MYSQL & SUPABASE) ---
    const articleDetailContainer = document.querySelector('.article-header');
    if (articleDetailContainer) {
        const params = new URLSearchParams(window.location.search);
        let articleId = params.get('id');
        
        if (articleId) {
            loadArticleData(articleId);
        } else {
            // Find default fallback: get newest published article
            CiakAPI.getArticles().then(data => {
                const published = (data && data.articles || []).filter(a => a.status === 'pubblicato');
                if (published.length > 0) {
                    loadArticleData(published[0].id);
                }
            });
        }
    }

    function loadArticleData(id) {
        CiakAPI.getArticleDetail(id).then(data => {
            if (data && data.status === 'success') {
                const activeArt = data.article;
                const comments = data.comments || [];
                
                document.title = `${activeArt.title} | Ciak Mania Magazine`;
                
                // Calculate reading time estimate
                const wordCount = (activeArt.content || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
                const readTime = Math.max(1, Math.ceil(wordCount / 180));

                // Dynamic Back Button based on Category & Origin (Home, Film, Serie TV, Recensioni, Articoli, Classifiche)
                const urlParams = new URLSearchParams(window.location.search);
                const fromParam = (urlParams.get('from') || '').toLowerCase().trim();

                const categoryRaw = (activeArt.category || '').toLowerCase().trim();
                const tagsRaw = (activeArt.tags || '').toLowerCase();
                const titleRaw = (activeArt.title || '').toLowerCase();
                const hasRating = activeArt.rating !== null && activeArt.rating !== '' && String(activeArt.rating).trim() !== '';

                let backUrl = 'index.html';
                let backLabel = 'Torna alla Home';
                let floatingLabel = 'Home';

                // 1. Priorità massima: parametro ?from= nell'URL o Referrer del browser
                const ref = document.referrer || '';
                let originPage = fromParam;

                if (!originPage && ref) {
                    try {
                        const refUrl = new URL(ref);
                        const p = refUrl.pathname.toLowerCase();
                        if (p.endsWith('index.html') || p === '/' || p.endsWith('/')) originPage = 'home';
                        else if (p.includes('film.html')) originPage = 'film';
                        else if (p.includes('serie-tv.html')) originPage = 'serie-tv';
                        else if (p.includes('recensioni.html')) originPage = 'recensioni';
                        else if (p.includes('classifiche.html')) originPage = 'classifiche';
                        else if (p.includes('articoli.html')) {
                            const filter = refUrl.searchParams.get('filter');
                            originPage = filter ? `articoli-${filter}` : 'articoli';
                        }
                    } catch (e) {}
                }

                if (originPage === 'home') {
                    backUrl = 'index.html';
                    backLabel = 'Torna alla Home';
                    floatingLabel = 'Home';
                } else if (originPage === 'film') {
                    backUrl = 'film.html';
                    backLabel = 'Torna ai Film';
                    floatingLabel = 'Film';
                } else if (originPage === 'serie-tv') {
                    backUrl = 'serie-tv.html';
                    backLabel = 'Torna alle Serie TV';
                    floatingLabel = 'Serie TV';
                } else if (originPage === 'recensioni') {
                    backUrl = 'recensioni.html';
                    backLabel = 'Torna alle Recensioni';
                    floatingLabel = 'Recensioni';
                } else if (originPage === 'classifiche') {
                    backUrl = 'classifiche.html';
                    backLabel = 'Torna alle Classifiche';
                    floatingLabel = 'Classifiche';
                } else if (originPage === 'articoli-eventi') {
                    backUrl = 'articoli.html?filter=eventi';
                    backLabel = 'Torna agli Eventi';
                    floatingLabel = 'Eventi';
                } else if (originPage === 'articoli-news') {
                    backUrl = 'articoli.html?filter=news';
                    backLabel = 'Torna alle News';
                    floatingLabel = 'News';
                } else if (originPage === 'articoli') {
                    backUrl = 'articoli.html';
                    backLabel = 'Torna agli Articoli';
                    floatingLabel = 'Articoli';
                } else {
                    // Fallback in base alla categoria dell'articolo se non c'è traccia della pagina di provenienza
                    if (categoryRaw === 'film' || categoryRaw === 'cinema') {
                        backUrl = 'film.html';
                        backLabel = 'Torna ai Film';
                        floatingLabel = 'Film';
                    } else if (categoryRaw === 'serie-tv' || categoryRaw === 'serie tv' || categoryRaw === 'serie' || categoryRaw === 'tv') {
                        backUrl = 'serie-tv.html';
                        backLabel = 'Torna alle Serie TV';
                        floatingLabel = 'Serie TV';
                    } else if (categoryRaw === 'classifiche' || categoryRaw.includes('classific') || tagsRaw.includes('classific') || titleRaw.includes('classific') || titleRaw.includes('top 10') || titleRaw.includes('top 5')) {
                        backUrl = 'classifiche.html';
                        backLabel = 'Torna alle Classifiche';
                        floatingLabel = 'Classifiche';
                    } else if (categoryRaw === 'recensioni' || categoryRaw.includes('recensio') || hasRating) {
                        backUrl = 'recensioni.html';
                        backLabel = 'Torna alle Recensioni';
                        floatingLabel = 'Recensioni';
                    } else if (categoryRaw === 'eventi' || categoryRaw.includes('event') || categoryRaw.includes('festival')) {
                        backUrl = 'articoli.html?filter=eventi';
                        backLabel = 'Torna agli Eventi';
                        floatingLabel = 'Eventi';
                    } else if (categoryRaw === 'news' || categoryRaw.includes('news')) {
                        backUrl = 'articoli.html?filter=news';
                        backLabel = 'Torna alle News';
                        floatingLabel = 'News';
                    } else {
                        backUrl = 'index.html';
                        backLabel = 'Torna alla Home';
                        floatingLabel = 'Home';
                    }
                }

                const mainBackBtn = document.getElementById('article-back-button');
                const mainBackText = document.getElementById('article-back-text');
                const floatingBackBtn = document.getElementById('article-floating-back-btn');
                const floatingBackText = document.getElementById('article-floating-back-text');

                if (mainBackBtn) {
                    mainBackBtn.href = backUrl;
                    mainBackBtn.onclick = (e) => {
                        if (window.history.length > 1 && document.referrer && document.referrer.includes(window.location.hostname)) {
                            e.preventDefault();
                            window.history.back();
                        }
                    };
                }
                if (mainBackText) mainBackText.textContent = backLabel;
                if (floatingBackBtn) {
                    floatingBackBtn.href = backUrl;
                    floatingBackBtn.title = backLabel;
                    floatingBackBtn.onclick = (e) => {
                        if (window.history.length > 1 && document.referrer && document.referrer.includes(window.location.hostname)) {
                            e.preventDefault();
                            window.history.back();
                        }
                    };
                }
                if (floatingBackText) floatingBackText.textContent = floatingLabel;

                // Render Article Header
                if (articleDetailContainer) {
                    const rawTitleFont = activeArt.title_font ? activeArt.title_font.replace(/['"]/g, '') : 'Cormorant Garamond';
                    const titleFont = `'${rawTitleFont}', Georgia, serif`;
                    const titleColor = activeArt.title_color || "#FFFFFF";

                    const rawExcerptFont = activeArt.excerpt_font ? activeArt.excerpt_font.replace(/['"]/g, '') : 'Plus Jakarta Sans';
                    const excerptFont = `'${rawExcerptFont}', sans-serif`;
                    const excerptColor = activeArt.excerpt_color || "#D6D3DC";

                    let excerptHtml = '';
                    if (activeArt.excerpt) {
                        excerptHtml = `<p class="article-lead-excerpt" style="font-family:${excerptFont} !important; color:${excerptColor} !important; font-size:19px; line-height:1.6; max-width:820px; margin: 16px auto 0 auto; text-align:center; font-style:italic;">${activeArt.excerpt}</p>`;
                    }

                    articleDetailContainer.innerHTML = `
                        <span class="category-tag"><span class="cat-dot"></span>${(activeArt.category || 'CINEMA').toUpperCase()}</span>
                        <h1 class="article-title" style="font-family:${titleFont} !important; color:${titleColor} !important;">${activeArt.title}</h1>
                        ${excerptHtml}
                        <div class="meta-info article-meta">
                            <span class="meta-item">
                                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
                                ${formatItalianDate(activeArt.date)}
                            </span>
                            <span class="meta-separator">•</span>
                            <span class="meta-item">
                                <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                Redatto da <strong>${activeArt.author}</strong>
                            </span>
                            <span class="meta-separator">•</span>
                            <span class="meta-item read-time-badge">${readTime} MIN LETTURA</span>
                        </div>
                    `;
                }

                // Backdrop and Hero Image
                const backdropImg = document.getElementById('article-backdrop-img');
                if (backdropImg) {
                    backdropImg.src = activeArt.image || 'ASSETS/no_image.png';
                }
                const mainCoverImg = document.getElementById('article-main-cover-img');
                if (mainCoverImg) {
                    mainCoverImg.src = activeArt.image || 'ASSETS/no_image.png';
                    mainCoverImg.alt = activeArt.title;
                }

                // Article content
                const bodyDiv = document.querySelector('.article-body');
                if (bodyDiv) {
                    bodyDiv.innerHTML = activeArt.content || '';

                    // Trasforma automaticamente link a YouTube, Vimeo o file video in player video incorporati inline riproducibili direttamente dall'articolo
                    const extractYT = (url) => {
                        if (!url) return '';
                        const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/|.+&v=))([\w-]{11})/);
                        return m ? m[1] : '';
                    };

                    const extractVimeo = (url) => {
                        if (!url) return '';
                        const m = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/);
                        return m ? m[3] : '';
                    };

                    // Controllo e conversione di link isolati a video
                    bodyDiv.querySelectorAll('a').forEach(link => {
                        const href = (link.getAttribute('href') || '').trim();
                        const text = (link.textContent || '').trim();

                        const ytId = extractYT(href);
                        if (ytId && (href === text || link.closest('p, div')?.textContent.trim() === text)) {
                            const videoWrapper = document.createElement('div');
                            videoWrapper.className = 'video-container';
                            videoWrapper.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1&playsinline=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
                            link.replaceWith(videoWrapper);
                            return;
                        }

                        const vimeoId = extractVimeo(href);
                        if (vimeoId && (href === text || link.closest('p, div')?.textContent.trim() === text)) {
                            const videoWrapper = document.createElement('div');
                            videoWrapper.className = 'video-container';
                            videoWrapper.innerHTML = `<iframe src="https://player.vimeo.com/video/${vimeoId}?dnt=1" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
                            link.replaceWith(videoWrapper);
                            return;
                        }

                        if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(href) && (href === text || link.closest('p, div')?.textContent.trim() === text)) {
                            const vidEl = document.createElement('video');
                            vidEl.controls = true;
                            vidEl.playsInline = true;
                            vidEl.preload = 'metadata';
                            vidEl.src = href;
                            link.replaceWith(vidEl);
                            return;
                        }

                        // Tutti gli altri link normali si aprono in sicurezza
                        link.setAttribute('target', '_blank');
                        link.setAttribute('rel', 'noopener noreferrer');
                    });

                    // Assicura controlli e inline playback per tutti i tag video e iframe presenti
                    bodyDiv.querySelectorAll('video').forEach(vid => {
                        vid.controls = true;
                        vid.playsInline = true;
                        vid.setAttribute('preload', 'metadata');
                    });

                    bodyDiv.querySelectorAll('iframe').forEach(ifr => {
                        ifr.setAttribute('allowfullscreen', 'true');
                        ifr.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
                        if (!ifr.closest('.video-container')) {
                            const container = document.createElement('div');
                            container.className = 'video-container';
                            ifr.parentNode.insertBefore(container, ifr);
                            container.appendChild(ifr);
                        }
                    });

                    if (activeArt.rating) {
                        bodyDiv.innerHTML += `
                            <div class="review-summary-card">
                                <div class="review-score-box">
                                    <span class="score-label">VALUTAZIONE</span>
                                    <div class="score-num">${activeArt.rating}</div>
                                    <span class="score-scale">su 10</span>
                                </div>
                                <div class="review-aspects">
                                    <h3>Il Verdetto della Redazione</h3>
                                    <p>${activeArt.technical_judgment ? activeArt.technical_judgment : 'Un\'opera di rilievo che merita di essere vissuta appieno.'}</p>
                                </div>
                            </div>
                        `;
                    }
                }

                // Author card box
                const authorBoxContainer = document.getElementById('article-author-box');
                if (authorBoxContainer) {
                    let authorAvatarHtml = '';
                    if (activeArt.profile_image) {
                        authorAvatarHtml = `
                            <img src="${activeArt.profile_image}" alt="${activeArt.author}" class="author-avatar-img">
                        `;
                    } else {
                        const initials = (activeArt.author_avatar || activeArt.author || '').substring(0, 2).toUpperCase();
                        authorAvatarHtml = `
                            <div class="author-avatar-initials">${initials}</div>
                        `;
                    }
                    const authorBio = activeArt.bio || 'Critico cinematografico e redattore per Ciak Mania Magazine.';

                    authorBoxContainer.innerHTML = `
                        <div class="article-author-box">
                            ${authorAvatarHtml}
                            <div class="author-info-content">
                                <span class="author-tagline">Profilo Redattore</span>
                                <h4>${activeArt.author}</h4>
                                <p>${authorBio}</p>
                            </div>
                        </div>
                    `;
                }


                // Render Comments
                const commentsContainer = document.getElementById('comments-container');
                if (commentsContainer) {
                    if (comments.length === 0) {
                        commentsContainer.innerHTML = `<p style="font-size:14px; color:var(--color-text-muted); font-style:italic;">Nessun commento approvato. Lascia il primo commento!</p>`;
                    } else {
                        commentsContainer.innerHTML = comments.map(c => `
                            <div class="comment-item" style="border-bottom:1px solid var(--bg-tertiary); padding:16px 0;">
                                <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                                    <strong style="font-size:14px; color:var(--color-text-brand);">${c.author}</strong>
                                    <span style="font-size:12px; color:var(--color-text-muted);">${c.date}</span>
                                </div>
                                <p style="font-size:14.5px; margin:0; line-height:1.5;">${c.text}</p>
                            </div>
                        `).join('');
                    }
                }
            }
        });
    }

    // --- READING PROGRESS BAR ---
    window.addEventListener('scroll', () => {
        const progressBar = document.querySelector('.reading-progress-bar');
        if (progressBar) {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + "%";
        }
    });

    // --- SCROLL EFFECT NAVBAR ---
    const headerWrapper = document.querySelector('.header-wrapper');
    if (headerWrapper) {
        const handleScroll = () => {
            if (window.scrollY > 40) {
                headerWrapper.classList.add('scrolled');
            } else {
                headerWrapper.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
    }

    // --- MOBILE DRAWER TOGGLE ---
    const mobileToggle = document.querySelector('.mobile-toggle');
    const drawerClose = document.querySelector('.drawer-close');
    const mobileNavDrawer = document.querySelector('.mobile-nav-drawer');

    if (mobileToggle && mobileNavDrawer) {
        mobileToggle.addEventListener('click', () => {
            mobileNavDrawer.classList.add('open');
        });
    }

    if (drawerClose && mobileNavDrawer) {
        drawerClose.addEventListener('click', () => {
            mobileNavDrawer.classList.remove('open');
        });
    }

    // --- NEWSLETTER INTEGRATION ---
    const newsForm = document.getElementById('homepage-newsletter-form');
    const newsMsg = document.getElementById('newsletter-status-msg');
    if (newsForm && newsMsg) {
        newsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailVal = document.getElementById('newsletter-email').value;
            newsMsg.style.display = 'block';
            newsMsg.style.color = 'var(--color-brand)';
            newsMsg.textContent = 'Registrazione in corso...';

            fetch('api/api.php?action=subscribe_newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailVal })
            })
            .then(res => res.json())
            .then(resData => {
                if (resData.status === 'success') {
                    newsMsg.style.color = 'green';
                    newsMsg.textContent = 'Grazie! Iscrizione alla newsletter completata con successo.';
                    newsForm.reset();
                } else {
                    newsMsg.style.color = 'red';
                    newsMsg.textContent = 'Errore: ' + resData.message;
                }
            })
            .catch(() => {
                // Fallback for simple database mock or network fail
                newsMsg.style.color = 'green';
                newsMsg.textContent = 'Iscrizione completata con successo! (Offline feedback)';
                newsForm.reset();
            });
        });
    }
});

// --- FULLSCREEN SEARCH OVERLAY FUNCTIONS ---
window.openSearch = function() {
    const modal = document.getElementById('search-modal');
    if (modal) {
        modal.style.display = 'flex';
        const input = document.getElementById('search-input');
        if (input) {
            input.value = '';
            input.focus();
        }
        document.getElementById('search-results-list').innerHTML = '';
    }
};

window.closeSearch = function() {
    const modal = document.getElementById('search-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};

// Live Search Input Handler
const searchInputEl = document.getElementById('search-input');
if (searchInputEl) {
    searchInputEl.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        const resultsContainer = document.getElementById('search-results-list');
        
        if (query.length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }

        fetch(`api/api.php?action=get_articles&search=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                const articles = data.articles || [];
                if (articles.length === 0) {
                    resultsContainer.innerHTML = '<div style="color:#FFF; text-align:center; padding:20px;">Nessun risultato trovato.</div>';
                    return;
                }

                resultsContainer.innerHTML = articles.map(art => `
                    <div class="search-result-item" onclick="window.location.href='articolo.html?id=${art.id}'" style="padding: 14px; border-bottom: 1px solid rgba(255,255,255,0.1); cursor: pointer; display: flex; flex-direction: column; gap: 4px;">
                        <div style="font-weight: 700; font-size: 16px; color: #FFF;">${art.title}</div>
                        <div style="font-size: 12px; color: var(--color-accent);">${art.category.toUpperCase()}</div>
                    </div>
                `).join('');
            }
        });
    });
}

// Handwriting Script Titles Reveal Animation
function initHandwritingTitles() {
    const scriptElements = document.querySelectorAll('.ciak-editorial-heading .title-script');
    if (scriptElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('written');
                }, 150);
            }
        });
    }, { threshold: 0.1 });

    scriptElements.forEach(el => {
        el.classList.remove('written');
        observer.observe(el);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initHandwritingTitles();
    setTimeout(initHandwritingTitles, 400);
});
window.initHandwritingTitles = initHandwritingTitles;
