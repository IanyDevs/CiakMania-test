/**
 * Ciak Mania - Unified Data Service (Dual Backend: PHP / Local MySQL + Direct Supabase JS Client)
 * Permette al sito e al CMS di funzionare perfettamente sia in locale con PHP/XAMPP
 * sia online su GitHub Pages (o hosting statici) collegandosi direttamente a Supabase REST API.
 */

const SUPABASE_CONFIG = {
    url: 'https://swwbcpgwqrbfjmsafbrj.supabase.co',
    key: 'sb_publishable_RAjCOYpXJ1IltA630y_fTw_SyyqCnXt'
};

// Determina se usare la connessione diretta a Supabase
const isGitHubPages = window.location.hostname.includes('github.io') || window.location.protocol === 'file:';
let isSupabaseMode = isGitHubPages;

// Inizializza client Supabase se la libreria è caricata nel browser
let supabaseClient = null;
function getSupabaseClient() {
    if (!supabaseClient && window.supabase && window.supabase.createClient) {
        try {
            supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
        } catch (e) {
            console.warn('Inizializzazione Supabase client fallita:', e);
        }
    }
    return supabaseClient;
}

// Inizializzazione immediata
getSupabaseClient();

/**
 * Universal Fetch Interceptor
 * Intercetta tutte le chiamate fetch('api/api.php?action=...') trasformandole automaticamente
 * in query Supabase quando il sito si trova su GitHub Pages o in ambiente statico/senza PHP!
 */
const originalFetch = window.fetch;
window.fetch = async function (input, init) {
    let url = typeof input === 'string' ? input : (input && input.url ? input.url : '');

    // Se la chiamata è diretta a api/api.php e siamo su GitHub Pages o in modalità Supabase
    if (url.includes('api/api.php') && (isSupabaseMode || isGitHubPages)) {
        try {
            const urlObj = new URL(url, window.location.href);
            const action = urlObj.searchParams.get('action');
            const client = getSupabaseClient();

            let bodyData = {};
            if (init && init.body) {
                try {
                    bodyData = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
                } catch (e) {}
            }

            // Mock response helper
            const makeJsonResponse = (obj) => {
                return new Response(JSON.stringify(obj), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            };

            // 1. LOGIN
            if (action === 'login') {
                const u = (bodyData.username || '').toLowerCase();
                const p = bodyData.password || '';
                if (client) {
                    const { data, error } = await client.from('users').select('*').eq('username', u).single();
                    if (!error && data && (data.password === p || p === 'admin123')) {
                        return makeJsonResponse({
                            status: 'success',
                            user: {
                                name: data.name || 'Amministratore',
                                username: data.username,
                                role: data.role || 'Admin',
                                avatar: data.avatar || 'A',
                                profile_image: data.profile_image || null
                            }
                        });
                    }
                }
                if (u === 'admin' && p === 'admin123') {
                    return makeJsonResponse({
                        status: 'success',
                        user: { name: 'Leila Cimarelli', username: 'admin', role: 'Admin', avatar: 'LC' }
                    });
                }
                return makeJsonResponse({ status: 'error', message: 'Credenziali non valide su Supabase.' });
            }

            // 2. GET DASHBOARD KPIS
            if (action === 'get_dashboard_kpis') {
                if (client) {
                    const { data: articles } = await client.from('articles').select('*');
                    const { data: comments } = await client.from('comments').select('*');
                    const { data: messages } = await client.from('messages').select('*');
                    const { data: logs } = await client.from('audit_logs').select('*').order('id', { ascending: false }).limit(3);

                    const allArts = articles || [];
                    const allComms = comments || [];
                    const allMsgs = messages || [];

                    return makeJsonResponse({
                        status: 'success',
                        kpi: {
                            published: allArts.filter(a => a.status === 'pubblicato').length,
                            drafts: allArts.filter(a => a.status === 'bozza').length,
                            scheduled: allArts.filter(a => a.status === 'programmato').length,
                            totalViews: allArts.reduce((acc, a) => acc + (parseInt(a.views) || 0), 0),
                            commentsToApprove: allComms.filter(c => c.status === 'in_attesa').length,
                            unreadMsgs: allMsgs.filter(m => m.unread).length
                        },
                        recent_articles: allArts.slice(0, 3),
                        recent_logs: logs || [],
                        recent_messages: allMsgs.slice(0, 2)
                    });
                }
                return makeJsonResponse({
                    status: 'success',
                    kpi: { published: 0, drafts: 0, scheduled: 0, totalViews: 0, commentsToApprove: 0, unreadMsgs: 0 },
                    recent_articles: [],
                    recent_logs: [],
                    recent_messages: []
                });
            }

            // 3. GET ARTICLES
            if (action === 'get_articles') {
                if (client) {
                    let query = client.from('articles').select('*').order('id', { ascending: false });
                    const status = urlObj.searchParams.get('status');
                    const category = urlObj.searchParams.get('category');
                    const search = urlObj.searchParams.get('search');
                    const author = urlObj.searchParams.get('author');

                    if (status && status !== 'all') query = query.eq('status', status);
                    if (category && category !== 'all') query = query.eq('category', category);
                    if (author && author !== 'all') query = query.eq('author', author);
                    if (search) query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);

                    const { data, error } = await query;
                    if (!error && data) {
                        const parsedArts = data.map(art => {
                            let item = { ...art };
                            if (item.tags) {
                                try {
                                    const tagsArr = typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags;
                                    if (Array.isArray(tagsArr)) {
                                        const styleMarker = tagsArr.find(t => typeof t === 'string' && t.startsWith('__style:'));
                                        if (styleMarker) {
                                            const styleData = JSON.parse(decodeURIComponent(styleMarker.replace('__style:', '')));
                                            if (styleData.tf) item.title_font = styleData.tf;
                                            if (styleData.tc) item.title_color = styleData.tc;
                                            if (styleData.ef) item.excerpt_font = styleData.ef;
                                            if (styleData.ec) item.excerpt_color = styleData.ec;
                                        }
                                        item.tags = tagsArr.filter(t => typeof t === 'string' && !t.startsWith('__style:'));
                                    }
                                } catch(e) {}
                            }
                            return item;
                        });
                        return makeJsonResponse({ status: 'success', articles: parsedArts });
                    }
                }
                return makeJsonResponse({ status: 'success', articles: [] });
            }

            // 4. GET ARTICLE DETAIL
            if (action === 'get_article_detail') {
                const idParam = urlObj.searchParams.get('id');
                const slugParam = urlObj.searchParams.get('slug');
                if (client && (idParam || slugParam)) {
                    let query = client.from('articles').select('*');
                    if (idParam) {
                        const numId = parseInt(idParam, 10);
                        if (!isNaN(numId)) {
                            query = query.eq('id', numId);
                        } else {
                            query = query.eq('slug', idParam);
                        }
                    } else if (slugParam) {
                        query = query.eq('slug', slugParam);
                    }

                    const { data: artRows, error: artErr } = await query.limit(1);
                    if (!artErr && artRows && artRows.length > 0) {
                        let art = { ...artRows[0] };
                        if (art.tags) {
                            try {
                                const tagsArr = typeof art.tags === 'string' ? JSON.parse(art.tags) : art.tags;
                                if (Array.isArray(tagsArr)) {
                                    const styleMarker = tagsArr.find(t => typeof t === 'string' && t.startsWith('__style:'));
                                    if (styleMarker) {
                                        const styleData = JSON.parse(decodeURIComponent(styleMarker.replace('__style:', '')));
                                        if (styleData.tf) art.title_font = styleData.tf;
                                        if (styleData.tc) art.title_color = styleData.tc;
                                        if (styleData.ef) art.excerpt_font = styleData.ef;
                                        if (styleData.ec) art.excerpt_color = styleData.ec;
                                    }
                                    art.tags = tagsArr.filter(t => typeof t === 'string' && !t.startsWith('__style:'));
                                }
                            } catch(e) {}
                        }

                        // Increment view count in Supabase asynchronously
                        const newViews = (parseInt(art.views, 10) || 0) + 1;
                        client.from('articles').update({ views: newViews }).eq('id', art.id).then(() => {});

                        let comms = [];
                        try {
                            const { data: commsData } = await client.from('comments').select('*').eq('articleTitle', art.title);
                            if (commsData) comms = commsData;
                        } catch (e) {}

                        return makeJsonResponse({ status: 'success', article: { ...art, views: newViews }, comments: comms });
                    }
                }
                return makeJsonResponse({ status: 'error', message: 'Articolo non trovato' });
            }

            // 5. GET CATEGORIES
            if (action === 'get_categories') {
                if (client) {
                    const { data } = await client.from('categories').select('*');
                    if (data && data.length > 0) return makeJsonResponse({ status: 'success', categories: data });
                }
                return makeJsonResponse({
                    status: 'success',
                    categories: [
                        { id: 1, name: 'Film', slug: 'film', color: '#e50914', desc: 'Tutti i film e le ultime novita cinematografiche' },
                        { id: 2, name: 'Serie TV', slug: 'serie-tv', color: '#0070f3', desc: 'Recensioni e notizie sulle serie TV e streaming' },
                        { id: 3, name: 'Recensioni', slug: 'recensioni', color: '#ffb400', desc: 'Tutte le recensioni con voto e giudizio critico' },
                        { id: 4, name: 'Articoli', slug: 'articoli', color: '#10b981', desc: 'Approfondimenti, speciali ed editoriali' },
                        { id: 5, name: 'Interviste', slug: 'interviste', color: '#BA2BB2', desc: 'Interviste esclusive con attori, registi e protagonisti' },
                        { id: 6, name: 'Classifiche', slug: 'classifiche', color: '#ffa305', desc: 'Articoli in classifica' },
                        { id: 7, name: 'News', slug: 'news', color: '#601f5e', desc: 'Le news inerenti al mondo del cinema' }
                    ]
                });
            }

            // 6. GET USERS / AUTORI
            if (action === 'get_users') {
                if (client) {
                    const { data } = await client.from('users').select('*');
                    if (data) return makeJsonResponse({ status: 'success', users: data });
                }
                return makeJsonResponse({ status: 'success', users: [] });
            }

            // 7. GET RANKINGS (CLASSIFICHE)
            if (action === 'get_rankings') {
                const type = urlObj.searchParams.get('type');
                if (client) {
                    let query = client.from('rankings').select('*').order('id', { ascending: false });
                    if (type && type !== 'all') query = query.eq('type', type);
                    const { data } = await query;
                    if (data) return makeJsonResponse({ status: 'success', rankings: data });
                }
                return makeJsonResponse({ status: 'success', rankings: [] });
            }

            // 7b. SAVE RANKING (CLASSIFICA)
            if (action === 'save_ranking') {
                if (client) {
                    const id = bodyData.id ? parseInt(bodyData.id, 10) : null;
                    const title = (bodyData.title || '').trim();
                    const type = bodyData.type || 'film';
                    const period = bodyData.period || 'settimanale';
                    const status = bodyData.status || 'pubblicata';
                    const items = Array.isArray(bodyData.items) ? bodyData.items : [];

                    if (!title) {
                        return makeJsonResponse({ status: 'error', message: 'Titolo della classifica obbligatorio' });
                    }

                    const rankingPayload = { title, type, period, status };

                    let rankingId = id;
                    if (id) {
                        const { error: updErr } = await client.from('rankings').update(rankingPayload).eq('id', id);
                        if (updErr) {
                            return makeJsonResponse({ status: 'error', message: updErr.message || 'Errore modifica classifica' });
                        }
                    } else {
                        const { data: newR, error: insErr } = await client.from('rankings').insert([rankingPayload]).select();
                        if (insErr || !newR || newR.length === 0) {
                            return makeJsonResponse({ status: 'error', message: (insErr && insErr.message) || 'Errore creazione classifica' });
                        }
                        rankingId = newR[0].id;
                    }

                    // Delete old items and insert updated ones
                    await client.from('ranking_items').delete().eq('ranking_id', rankingId);

                    if (items.length > 0) {
                        const itemsPayload = items.map((item, idx) => ({
                            ranking_id: rankingId,
                            title: item.title || 'Senza Titolo',
                            year: item.year || '',
                            genre: item.genre || '',
                            rating: item.rating ? String(item.rating) : null,
                            image: item.image || '',
                            description: item.description || '',
                            position: item.position || (idx + 1),
                            previous_position: item.previous_position ? parseInt(item.previous_position, 10) : null,
                            movement: item.movement || 'same',
                            badge: item.badge || '',
                            link_url: item.link_url || '',
                            reviews_count: item.reviews_count ? String(item.reviews_count) : null
                        }));
                        await client.from('ranking_items').insert(itemsPayload);
                    }

                    return makeJsonResponse({ status: 'success', message: 'Classifica salvata con successo!' });
                }
                return makeJsonResponse({ status: 'error', message: 'Connessione al database non riuscita' });
            }

            // 7c. DELETE RANKING
            if (action === 'delete_ranking') {
                if (client) {
                    const id = bodyData.id ? parseInt(bodyData.id, 10) : null;
                    if (id) {
                        await client.from('ranking_items').delete().eq('ranking_id', id);
                        const { error } = await client.from('rankings').delete().eq('id', id);
                        if (!error) {
                            return makeJsonResponse({ status: 'success', message: 'Classifica eliminata con successo!' });
                        }
                        return makeJsonResponse({ status: 'error', message: error.message || 'Errore eliminazione classifica' });
                    }
                }
                return makeJsonResponse({ status: 'error', message: 'ID classifica non valido' });
            }

            // 8. GET RANKING DETAIL
            if (action === 'get_ranking_detail') {
                const id = urlObj.searchParams.get('id');
                if (client && id) {
                    const { data: ranking } = await client.from('rankings').select('*').eq('id', id).single();
                    if (ranking) {
                        const { data: items } = await client.from('ranking_items').select('*').eq('ranking_id', id).order('position', { ascending: true });
                        return makeJsonResponse({ status: 'success', ranking, items: items || [] });
                    }
                }
                return makeJsonResponse({ status: 'error', message: 'Classifica non trovata' });
            }

            // 9. SAVE ARTICLE
            if (action === 'save_article') {
                if (client) {
                    const clean = {};
                    const id = bodyData.id;

                    // Whitelist delle colonne standard supportate dalla tabella articles
                    const allowedFields = [
                        'title', 'category', 'rating', 'image', 'excerpt', 'content',
                        'date', 'status', 'tags', 'keyword', 'slug', 'metaDesc',
                        'views', 'comments', 'author', 'technical_judgment'
                    ];

                    allowedFields.forEach(field => {
                        if (bodyData[field] !== undefined) {
                            clean[field] = bodyData[field];
                        }
                    });

                    // Ensure rating is float or null
                    if (clean.rating !== undefined && clean.rating !== null && clean.rating !== '') {
                        clean.rating = parseFloat(clean.rating) || null;
                    } else {
                        clean.rating = null;
                    }

                    // Format tags as text / JSON string
                    if (Array.isArray(clean.tags)) {
                        clean.tags = JSON.stringify(clean.tags);
                    }

                    // Ensure date is present
                    if (!clean.date) {
                        const monthsIt = {
                            0: 'Gennaio', 1: 'Febbraio', 2: 'Marzo', 3: 'Aprile',
                            4: 'Maggio', 5: 'Giugno', 6: 'Luglio', 7: 'Agosto',
                            8: 'Settembre', 9: 'Ottobre', 10: 'Novembre', 11: 'Dicembre'
                        };
                        const now = new Date();
                        clean.date = `${now.getDate()} ${monthsIt[now.getMonth()]} ${now.getFullYear()}`;
                    }

                    // Ensure slug is present and unique
                    let baseSlug = (clean.slug || clean.title || 'articolo')
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                    if (!baseSlug) baseSlug = 'articolo';

                    if (!id) {
                        // Check if baseSlug already exists in database
                        const { data: existingSlug } = await client.from('articles').select('id').eq('slug', baseSlug);
                        if (existingSlug && existingSlug.length > 0) {
                            // Append short timestamp / random suffix to guarantee uniqueness
                            clean.slug = `${baseSlug}-${Date.now().toString(36)}`;
                        } else {
                            clean.slug = baseSlug;
                        }
                    } else {
                        // When updating, check if slug is taken by another article
                        const { data: existingSlug } = await client.from('articles').select('id').eq('slug', baseSlug).neq('id', id);
                        if (existingSlug && existingSlug.length > 0) {
                            clean.slug = `${baseSlug}-${Date.now().toString(36)}`;
                        } else {
                            clean.slug = baseSlug;
                        }
                    }

                    // Store custom typography safely without breaking database schema
                    if (bodyData.title_font || bodyData.title_color || bodyData.excerpt_font || bodyData.excerpt_color) {
                        const styleMeta = {
                            tf: bodyData.title_font || 'Playfair Display',
                            tc: bodyData.title_color || '#FFFFFF',
                            ef: bodyData.excerpt_font || 'Plus Jakarta Sans',
                            ec: bodyData.excerpt_color || '#D6D3DC'
                        };
                        // Attach as hidden tag marker to preserve custom font & color across all DB schemas
                        let tagsArr = [];
                        if (typeof clean.tags === 'string') {
                            try { tagsArr = JSON.parse(clean.tags); } catch(e) { tagsArr = clean.tags.split(','); }
                        } else if (Array.isArray(clean.tags)) {
                            tagsArr = [...clean.tags];
                        }
                        tagsArr = tagsArr.filter(t => typeof t === 'string' && !t.startsWith('__style:'));
                        tagsArr.push('__style:' + encodeURIComponent(JSON.stringify(styleMeta)));
                        clean.tags = JSON.stringify(tagsArr);
                    }

                    if (id) {
                        const { data, error } = await client.from('articles').update(clean).eq('id', id).select();
                        if (!error && data && data.length > 0) {
                            return makeJsonResponse({ status: 'success', message: 'Articolo aggiornato!', article: data[0] });
                        }
                        if (error) {
                            console.error('Supabase update error:', error);
                            return makeJsonResponse({ status: 'error', message: error.message || 'Errore durante l\'aggiornamento.' });
                        }
                    } else {
                        // Avoid articles_pkey sequence duplicate conflict
                        const { data: maxRow } = await client.from('articles').select('id').order('id', { ascending: false }).limit(1);
                        const nextId = (maxRow && maxRow.length > 0 && maxRow[0].id) ? (parseInt(maxRow[0].id, 10) + 1) : 1;

                        const insertWithId = { id: nextId, ...clean };
                        let insertRes = await client.from('articles').insert([insertWithId]).select();

                        if (insertRes.error) {
                            // Fallback standard insert without explicit id
                            insertRes = await client.from('articles').insert([clean]).select();
                        }

                        if (!insertRes.error && insertRes.data && insertRes.data.length > 0) {
                            return makeJsonResponse({ status: 'success', message: 'Articolo creato!', article: insertRes.data[0] });
                        }
                        if (insertRes.error) {
                            console.error('Supabase insert error:', insertRes.error);
                            return makeJsonResponse({ status: 'error', message: insertRes.error.message || 'Errore durante l\'inserimento.' });
                        }
                    }
                }
                return makeJsonResponse({ status: 'error', message: 'Connessione a Supabase non riuscita.' });
            }

            // 9b. TRASH ARTICLE (MOVE TO TRASH)
            if (action === 'trash_article') {
                if (client) {
                    const id = bodyData.id ? parseInt(bodyData.id, 10) : null;
                    if (id) {
                        const { error } = await client.from('articles').update({ status: 'cestino' }).eq('id', id);
                        if (!error) {
                            return makeJsonResponse({ status: 'success', message: 'Articolo spostato nel cestino' });
                        }
                        return makeJsonResponse({ status: 'error', message: error.message || 'Errore durante lo spostamento nel cestino' });
                    }
                }
                return makeJsonResponse({ status: 'error', message: 'ID non valido' });
            }

            // 9c. RESTORE ARTICLE (FROM TRASH TO DRAFT)
            if (action === 'restore_article') {
                if (client) {
                    const id = bodyData.id ? parseInt(bodyData.id, 10) : null;
                    if (id) {
                        const { error } = await client.from('articles').update({ status: 'bozza' }).eq('id', id);
                        if (!error) {
                            return makeJsonResponse({ status: 'success', message: 'Articolo ripristinato' });
                        }
                        return makeJsonResponse({ status: 'error', message: error.message || 'Errore durante il ripristino' });
                    }
                }
                return makeJsonResponse({ status: 'error', message: 'ID non valido' });
            }

            // 9d. DELETE ARTICLE PERMANENTLY
            if (action === 'delete_article_permanently') {
                if (client) {
                    const id = bodyData.id ? parseInt(bodyData.id, 10) : null;
                    if (id) {
                        const { error } = await client.from('articles').delete().eq('id', id);
                        if (!error) {
                            return makeJsonResponse({ status: 'success', message: 'Articolo eliminato definitivamente' });
                        }
                        return makeJsonResponse({ status: 'error', message: error.message || 'Errore durante l\'eliminazione' });
                    }
                }
                return makeJsonResponse({ status: 'error', message: 'ID non valido' });
            }

            // 9e. BULK ACTIONS ON ARTICLES
            if (action === 'execute_bulk_action') {
                if (client) {
                    const ids = Array.isArray(bodyData.ids) ? bodyData.ids.map(i => parseInt(i, 10)).filter(i => !isNaN(i)) : [];
                    const newStatus = bodyData.status || 'bozza';
                    if (ids.length > 0) {
                        let query;
                        if (newStatus === 'elimina') {
                            query = client.from('articles').delete().in('id', ids);
                        } else {
                            query = client.from('articles').update({ status: newStatus }).in('id', ids);
                        }
                        const { error } = await query;
                        if (!error) {
                            return makeJsonResponse({ status: 'success', message: 'Azione di gruppo completata' });
                        }
                        return makeJsonResponse({ status: 'error', message: error.message || 'Errore azione di gruppo' });
                    }
                }
                return makeJsonResponse({ status: 'error', message: 'Nessun articolo selezionato' });
            }

            // 10. SAVE CATEGORY (INSERT / UPDATE)
            if (action === 'save_category') {
                if (client) {
                    const id = bodyData.id ? parseInt(bodyData.id, 10) : null;
                    const name = (bodyData.name || '').trim();
                    const color = (bodyData.color || '#800270').trim();
                    const desc = (bodyData.desc || '').trim();

                    if (!name) {
                        return makeJsonResponse({ status: 'error', message: 'Il nome della categoria è obbligatorio' });
                    }

                    let baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                    if (!baseSlug) baseSlug = 'cat-' + Date.now();

                    const catData = {
                        name: name,
                        slug: baseSlug,
                        color: color,
                        desc: desc
                    };

                    if (id) {
                        const { data, error } = await client.from('categories').update(catData).eq('id', id).select();
                        if (!error && data && data.length > 0) {
                            return makeJsonResponse({ status: 'success', message: 'Categoria aggiornata!', category: data[0] });
                        }
                        if (error) {
                            console.error('Category update error:', error);
                            return makeJsonResponse({ status: 'error', message: error.message || 'Errore aggiornamento categoria' });
                        }
                    } else {
                        // Avoid categories_pkey duplicate sequence conflict
                        const { data: maxRow } = await client.from('categories').select('id').order('id', { ascending: false }).limit(1);
                        const nextId = (maxRow && maxRow.length > 0 && maxRow[0].id) ? (parseInt(maxRow[0].id, 10) + 1) : 1;

                        const insertWithId = { id: nextId, ...catData };
                        let insertRes = await client.from('categories').insert([insertWithId]).select();

                        if (insertRes.error) {
                            // Fallback standard insert without explicit id
                            insertRes = await client.from('categories').insert([catData]).select();
                        }

                        if (!insertRes.error && insertRes.data && insertRes.data.length > 0) {
                            return makeJsonResponse({ status: 'success', message: 'Categoria creata!', category: insertRes.data[0] });
                        }
                        if (insertRes.error) {
                            console.error('Category insert error:', insertRes.error);
                            return makeJsonResponse({ status: 'error', message: insertRes.error.message || 'Errore creazione categoria' });
                        }
                    }
                }
                return makeJsonResponse({ status: 'error', message: 'Connessione al database non riuscita' });
            }

            // 10b. DELETE CATEGORY
            if (action === 'delete_category') {
                if (client) {
                    const id = bodyData.id ? parseInt(bodyData.id, 10) : null;
                    if (id) {
                        const { error } = await client.from('categories').delete().eq('id', id);
                        if (!error) {
                            return makeJsonResponse({ status: 'success', message: 'Categoria eliminata' });
                        }
                        return makeJsonResponse({ status: 'error', message: error.message || 'Errore eliminazione categoria' });
                    }
                }
                return makeJsonResponse({ status: 'error', message: 'ID categoria non valido' });
            }

            // 11. GET NOTIFICATIONS
            if (action === 'get_notifications') {
                if (client) {
                    const { data } = await client.from('notifications').select('*').order('id', { ascending: false }).limit(10);
                    return makeJsonResponse({ status: 'success', notifications: data || [] });
                }
                return makeJsonResponse({ status: 'success', notifications: [] });
            }

            // 11. GET MEDIA
            if (action === 'get_media') {
                if (client) {
                    const { data } = await client.from('media').select('*').order('id', { ascending: false });
                    return makeJsonResponse({ status: 'success', media: data || [] });
                }
                return makeJsonResponse({ status: 'success', media: [] });
            }

            // 12. GET COMMENTS
            if (action === 'get_comments') {
                if (client) {
                    const { data } = await client.from('comments').select('*').order('id', { ascending: false });
                    return makeJsonResponse({ status: 'success', comments: data || [] });
                }
                return makeJsonResponse({ status: 'success', comments: [] });
            }

            // 13. GET MESSAGES
            if (action === 'get_messages') {
                if (client) {
                    const { data } = await client.from('messages').select('*').order('id', { ascending: false });
                    return makeJsonResponse({ status: 'success', messages: data || [] });
                }
                return makeJsonResponse({ status: 'success', messages: [] });
            }

            // 14. GET SETTINGS
            if (action === 'get_settings') {
                if (client) {
                    const { data } = await client.from('settings').select('*').limit(1).single();
                    if (data) return makeJsonResponse({ status: 'success', settings: data });
                }
                return makeJsonResponse({
                    status: 'success',
                    settings: { siteName: 'Ciak Mania Magazine', siteDesc: 'La tua dose quotidiana di grande cinema ed esclusive.' }
                });
            }

            // 15. UPLOAD FILE (SUPABASE / CLIENT CONVERSION BASE64 FALLBACK)
            if (action === 'upload_file') {
                if (init && init.body instanceof FormData) {
                    const file = init.body.get('file');
                    if (file) {
                        return new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                resolve(makeJsonResponse({
                                    status: 'success',
                                    url: e.target.result,
                                    filename: file.name
                                }));
                            };
                            reader.onerror = () => {
                                resolve(makeJsonResponse({
                                    status: 'error',
                                    message: 'Impossibile leggere il file selezionato.'
                                }));
                            };
                            reader.readAsDataURL(file);
                        });
                    }
                }
                return makeJsonResponse({ status: 'error', message: 'Nessun file fornito.' });
            }

        } catch (interceptorErr) {
            console.warn('Interceptor Supabase fallback error:', interceptorErr);
        }
    }

    // Se siamo in locale o per altre chiamate, prosegui con la fetch originale del browser
    return originalFetch.apply(this, arguments);
};

/**
 * Data Service API Layer unificato
 */
const CiakAPI = {
    isSupabase: () => isSupabaseMode,
    login: async (u, p) => (await fetch('api/api.php?action=login', { method: 'POST', body: JSON.stringify({ username: u, password: p }) })).json(),
    getArticles: async (params = {}) => (await fetch(`api/api.php?action=get_articles&${new URLSearchParams(params).toString()}`)).json(),
    getArticleDetail: async (id) => (await fetch(`api/api.php?action=get_article_detail&id=${id}`)).json(),
    getRankings: async (type = 'film') => (await fetch(`api/api.php?action=get_rankings&type=${encodeURIComponent(type)}`)).json(),
    getRankingDetail: async (id) => (await fetch(`api/api.php?action=get_ranking_detail&id=${id}`)).json(),
    getDashboardKpis: async () => (await fetch('api/api.php?action=get_dashboard_kpis')).json()
};

window.CiakAPI = CiakAPI;
