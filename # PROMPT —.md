# PROMPT — 

Voglio che tu progetti e sviluppi un **pannello amministrativo professionale, completo e moderno** per un sito editoriale dedicato a **cinema, serie TV, streaming, film, recensioni, news, approfondimenti e intrattenimento**.

Non voglio un semplice pannello CRUD con una sidebar e qualche tabella.

Voglio un vero **CMS editoriale professionale**, intuitivo e piacevole da utilizzare, pensato per amministratori, editor e redattori che devono pubblicare e gestire quotidianamente molti articoli.

L'obiettivo è creare un pannello che dia la sensazione di utilizzare un prodotto SaaS moderno e professionale.

---

# 1. OBIETTIVO GENERALE

Il pannello deve permettere di gestire completamente il magazine senza dover modificare manualmente il codice.

Deve consentire di:

* creare articoli
* modificare articoli
* salvare bozze
* programmare pubblicazioni
* pubblicare immediatamente
* mettere articoli in revisione
* archiviare articoli
* eliminare articoli
* recuperare articoli dal cestino
* gestire categorie
* gestire tag
* gestire immagini
* gestire video
* gestire gli autori
* gestire i commenti
* moderare i commenti
* gestire i messaggi del form contatti
* gestire utenti e ruoli
* gestire SEO
* visualizzare statistiche
* gestire impostazioni del magazine
* effettuare ricerche globali
* ricevere notifiche
* monitorare le attività degli amministratori

Il sistema deve essere progettato pensando alla crescita futura del magazine.

---

# 2. DESIGN / UI / UX

Il design deve essere estremamente moderno, elegante e professionale.

Ispirazione generale:

* dashboard SaaS moderne
* CMS professionali
* piattaforme editoriali
* software utilizzati da redazioni giornalistiche
* interfacce come Linear, Notion, Vercel, Stripe e moderni strumenti di content management

NON creare un'interfaccia piena di elementi inutili.

Deve essere:

* pulita
* elegante
* minimal
* moderna
* responsive
* veloce
* intuitiva
* facilmente navigabile

## Layout

Utilizza una struttura composta da:

### Sidebar sinistra

Con:

* logo del magazine
* Dashboard
* Articoli
* Categorie
* Tag
* Media
* Commenti
* Messaggi
* Autori
* Utenti
* Statistiche
* SEO
* Impostazioni

In fondo alla sidebar:

* profilo amministratore
* ruolo
* impostazioni account
* logout

La sidebar deve poter essere:

* espansa
* minimizzata

Su mobile deve trasformarsi in una navigation drawer.

---

# 3. DASHBOARD

La dashboard deve essere il centro di controllo del magazine.

Non deve mostrare semplicemente quattro numeri.

Deve fornire una vera panoramica dell'attività editoriale.

## KPI principali

Mostrare card per:

* Articoli pubblicati
* Articoli in bozza
* Articoli programmati
* Articoli in revisione
* Commenti da moderare
* Messaggi non letti
* Visualizzazioni totali
* Visualizzazioni degli ultimi 7/30 giorni

Ogni KPI deve avere:

* valore
* variazione rispetto al periodo precedente
* piccolo grafico
* indicatore positivo/negativo

---

## Dashboard editoriale

Aggiungere sezioni come:

### Ultimi articoli

Mostrare:

* immagine
* titolo
* autore
* categoria
* stato
* data
* visualizzazioni
* commenti

### Attività recenti

Esempio:

"Marco ha pubblicato 'I migliori film Netflix del mese'"

"Antonio ha modificato un articolo"

"Nuovo commento ricevuto"

"Nuovo messaggio dal form contatti"

### Articoli più letti

Classifica degli articoli più visualizzati.

### Commenti recenti

Mostrare gli ultimi commenti ricevuti.

### Messaggi recenti

Mostrare gli ultimi messaggi del form contatti.

### Calendario editoriale

Visualizzare gli articoli programmati nei prossimi giorni.

---

# 4. GESTIONE ARTICOLI

Questa deve essere una delle sezioni più importanti dell'intero sistema.

La pagina Articoli deve avere:

* lista articoli
* ricerca
* filtri
* ordinamento
* azioni rapide
* bulk actions

## Tabella articoli

Colonne:

* checkbox
* immagine
* titolo
* categoria
* autore
* stato
* data pubblicazione
* visualizzazioni
* commenti
* ultima modifica
* azioni

Stati:

* Bozza
* In revisione
* Programmato
* Pubblicato
* Archiviato
* Cestino

---

# 5. RICERCA ARTICOLI

La ricerca deve essere potente.

Permettere di cercare per:

* titolo
* autore
* categoria
* tag
* contenuto
* ID articolo

Aggiungere filtri:

* stato
* categoria
* autore
* data
* intervallo di visualizzazioni
* presenza commenti

---

# 6. BULK ACTIONS

Permettere di selezionare più articoli e:

* pubblicarli
* spostarli in bozza
* archiviare
* eliminare
* cambiare categoria
* aggiungere tag
* rimuovere tag
* cambiare autore

Prima di azioni distruttive mostrare una conferma.

---

# 7. EDITOR ARTICOLO

Creare un editor estremamente professionale.

La pagina di creazione/modifica articolo deve essere divisa in:

## Area principale

### Titolo

Campo grande e moderno.

### Sottotitolo / excerpt

Breve descrizione dell'articolo.

### Editor contenuto

Utilizzare un editor rich text moderno.

Deve supportare:

* titoli H2/H3/H4
* paragrafi
* grassetto
* corsivo
* sottolineato
* link
* liste
* citazioni
* immagini
* video
* embed
* separatori
* tabelle
* codice
* gallery
* contenuti multimediali

Deve essere possibile trascinare e riordinare i blocchi.

---

# 8. BLOCCO IMMAGINE

Quando si inserisce un'immagine permettere di:

* selezionarla dalla Media Library
* caricarla
* inserire URL
* aggiungere alt text
* aggiungere caption
* modificare allineamento
* impostare dimensione
* impostare link

---

# 9. FEATURED IMAGE

Ogni articolo deve poter avere una:

**Immagine in evidenza**

Con:

* upload
* selezione dalla libreria
* preview
* crop
* alt text
* caption

Mostrare chiaramente l'immagine utilizzata come copertina.

---

# 10. SIDEBAR EDITORIALE

A destra dell'editor mostrare una sidebar con:

### Pubblicazione

* stato
* data
* ora
* autore
* pubblica ora
* programma pubblicazione
* salva bozza
* anteprima

### Categoria

Possibilità di selezionare una o più categorie secondo la struttura scelta.

### Tag

Sistema di tag con autocomplete.

### Immagine in evidenza

Gestione della cover.

### Opzioni

* articolo in evidenza
* abilita commenti
* contenuto sponsorizzato
* breaking news
* articolo premium

---

# 11. AUTOSAVE

L'editor deve salvare automaticamente il contenuto mentre l'utente scrive.

Mostrare:

"Salvato"

oppure:

"Salvataggio..."

oppure:

"Ultimo salvataggio: 19:42"

Non perdere mai il lavoro dell'editor in caso di refresh o chiusura accidentale.

---

# 12. VERSIONING

Implementare la cronologia delle modifiche.

Ogni articolo deve avere:

**Revisioni**

Permettere di:

* vedere versioni precedenti
* confrontare modifiche
* ripristinare una versione precedente

---

# 13. ANTEPRIMA

Aggiungere:

**Anteprima articolo**

L'admin deve poter vedere esattamente come apparirà l'articolo sul sito pubblico prima della pubblicazione.

Possibilmente:

* desktop preview
* tablet preview
* mobile preview

---

# 14. PROGRAMMAZIONE

Permettere di programmare la pubblicazione.

Esempio:

"Pubblica il 15 agosto 2026 alle 18:30"

L'articolo passa automaticamente da:

Programmato → Pubblicato

quando arriva la data stabilita.

---

# 15. SEO

Ogni articolo deve avere una sezione SEO professionale.

Campi:

* SEO title
* meta description
* slug
* canonical URL
* focus keyword
* Open Graph title
* Open Graph description
* Open Graph image

Mostrare un'anteprima di come potrebbe apparire il risultato su Google.

Creare anche un indicatore SEO con suggerimenti.

Esempio:

🟢 SEO ottimizzato

oppure

🟡 SEO migliorabile

oppure

🔴 SEO insufficiente

---

# 16. SLUG

Lo slug deve essere generato automaticamente dal titolo.

Esempio:

Titolo:

"I migliori film Netflix da vedere ad agosto"

Slug:

`i-migliori-film-netflix-da-vedere-ad-agosto`

Ma deve essere possibile modificarlo manualmente.

Se lo slug cambia dopo la pubblicazione, gestire correttamente eventuali redirect per evitare link rotti.

---

# 17. CATEGORIE

Creare una sezione completa per le categorie.

Esempi:

* Cinema
* Serie TV
* Netflix
* Disney+
* Prime Video
* Recensioni
* News
* Trailer
* Streaming
* Approfondimenti

Per ogni categoria:

* nome
* slug
* descrizione
* immagine
* colore
* SEO title
* meta description

Permettere:

* creazione
* modifica
* eliminazione
* ricerca

---

# 18. TAG

Sistema di gestione tag.

Funzioni:

* creazione
* modifica
* eliminazione
* ricerca
* numero articoli associati

Mostrare i tag più utilizzati.

---

# 19. MEDIA LIBRARY

Creare una vera Media Library.

Non un semplice input file.

Deve permettere di gestire:

* immagini
* video
* GIF
* file

Visualizzazione:

* griglia
* lista

Per ogni file:

* preview
* nome
* dimensione
* formato
* data caricamento
* autore
* URL
* alt text
* caption

Funzioni:

* upload multiplo
* drag & drop
* ricerca
* filtri
* eliminazione
* modifica metadata

---

# 20. COMMENTI

Creare una sezione dedicata alla moderazione dei commenti.

Mostrare:

* autore
* email
* articolo
* commento
* data
* stato

Stati:

* Approvato
* In attesa
* Spam
* Rifiutato

Azioni:

* approva
* rifiuta
* spam
* elimina
* rispondi

Aggiungere anche:

**Azioni multiple**

per moderare velocemente molti commenti.

---

# 21. COMMENTI NELL'ARTICOLO

Nella pagina dell'articolo mostrare:

**Commenti**

con:

* numero commenti
* commenti approvati
* commenti in attesa
* commenti spam

Permettere di moderare direttamente da lì.

---

# 22. MESSAGGI CONTATTI

Creare una vera inbox per i messaggi ricevuti tramite il form Contatti.

Layout simile a Gmail.

Colonna sinistra:

* Tutti
* Non letti
* Letti
* Importanti
* Archiviati
* Cestino

Lista centrale:

* nome
* email
* oggetto
* anteprima messaggio
* data
* stato

Pannello destro:

contenuto completo del messaggio.

Azioni:

* segna come letto
* segna come non letto
* importante
* archivia
* elimina
* rispondi

---

# 23. RISPOSTA AI MESSAGGI

Prevedere la possibilità di rispondere direttamente al mittente.

Il sistema deve preparare una risposta email mantenendo il contesto del messaggio originale.

---

# 24. NOTIFICHE

Creare un sistema di notifiche interno.

Esempi:

🔔 Nuovo commento da moderare

🔔 Nuovo messaggio ricevuto

🔔 Articolo programmato in pubblicazione

🔔 Articolo pubblicato

🔔 Errore durante la pubblicazione

Le notifiche devono essere visibili nella navbar.

---

# 25. AUTORI

Creare gestione degli autori.

Per ogni autore:

* nome
* cognome
* username
* foto
* biografia
* email
* ruolo
* social
* articoli pubblicati

Pagina autore pubblica collegabile al magazine.

Mostrare anche statistiche:

* articoli pubblicati
* visualizzazioni generate
* commenti ricevuti

#

---

# 28. STATISTICHE

Creare una sezione Analytics.

Mostrare:

* visualizzazioni totali
* visitatori
* articoli più letti
* categorie più visitate
* autori più performanti
* commenti
* andamento giornaliero
* andamento settimanale
* andamento mensile

Filtri:

* oggi
* 7 giorni
* 30 giorni
* 3 mesi
* 12 mesi
* personalizzato

Utilizzare grafici moderni e leggibili.

---

# 29. ARTICOLI PIÙ PERFORMANTI

Creare una classifica con:

1. articolo
2. visualizzazioni
3. commenti
4. engagement

Permettere di cambiare periodo.

---

# 30. CALENDARIO EDITORIALE

Creare un calendario con:

* articoli pubblicati
* bozze
* articoli programmati

Visualizzazione:

* mese
* settimana
* giorno

Gli articoli programmati devono essere trascinabili per modificare la data di pubblicazione.

---

# 31. RICERCA GLOBALE

Aggiungere una ricerca globale accessibile dalla navbar.

Con una scorciatoia:

`CTRL + K`

La ricerca deve trovare:

* articoli
* utenti
* commenti
* messaggi
* media
* categorie
* tag

Mostrare risultati raggruppati per tipologia.

#

---

# 33. AUDIT LOG

Creare una sezione:

**Registro attività**

Registrare:

* chi ha fatto l'azione
* cosa ha fatto
* su quale elemento
* data
* ora
* eventuale IP/sessione se appropriato e conforme alla privacy

Esempi:

"Marco ha pubblicato un articolo"

"Antonio ha modificato la categoria Cinema"

"Admin ha eliminato un commento"

"Editor ha programmato un articolo"

---

# 34. CESTINO

Implementare un vero sistema di trash.

Quando un articolo viene eliminato:

non eliminarlo immediatamente dal database.

Spostarlo nel cestino.

Permettere:

* ripristina
* eliminazione definitiva

Stesso sistema per:

* articoli
* commenti
* media
* messaggi

---

# 35. SICUREZZA

Il pannello deve essere progettato con sicurezza reale.

Implementare:

* autenticazione sicura
* session management
* password hashing
* autorizzazione lato server
* protezione CSRF
* validazione input
* sanitizzazione HTML
* protezione XSS
* rate limiting
* controllo upload
* controllo MIME type
* dimensione massima file
* protezione API
* gestione sicura dei token
* logout sicuro

Non affidarsi solamente ai controlli frontend.

Ogni operazione sensibile deve essere verificata anche lato backend.

---

# 36. BACKUP / RIPRISTINO

Prevedere una sezione backup.

Permettere almeno di visualizzare:

* ultimo backup
* stato backup
* data
* dimensione

Se l'architettura lo permette:

* backup database
* backup media
* ripristino

---

# 37. IMPOSTAZIONI

Creare una sezione Settings organizzata in categorie.

### Generali

* nome sito
* logo
* favicon
* descrizione
* email
* timezone

### Editoriali

* numero articoli per pagina
* commenti
* autori
* workflow editoriale

### SEO

* titolo sito
* descrizione
* sitemap
* robots
* social sharing

### Email

* SMTP
* email mittente
* notifiche

### Sicurezza

* sessioni
* password
* 2FA
* login attempts

### Social

* Instagram
* Facebook
* X
* YouTube
* TikTok

---

# 38. DARK MODE

Il pannello deve avere:

* Dark mode
* Light mode

La modalità predefinita dovrebbe essere dark se coerente con il design del magazine.

Il cambio tema deve essere fluido e mantenere ottima leggibilità.

---

# 39. RESPONSIVE

Il pannello deve funzionare perfettamente su:

* desktop
* laptop
* tablet
* smartphone

Non limitarsi a "far stare tutto nello schermo".

Su mobile ridisegnare intelligentemente le interfacce.

---

# 40. ACCESSIBILITÀ

Implementare:

* navigazione da tastiera
* focus states
* aria labels
* contrasto adeguato
* testi leggibili
* tooltip
* messaggi di errore chiari

---

# 41. UX

Ogni azione deve dare feedback.

Esempi:

Dopo aver pubblicato:

"✓ Articolo pubblicato correttamente"

Dopo aver salvato:

"✓ Modifiche salvate"

Dopo aver eliminato:

"Articolo spostato nel cestino"

In caso di errore:

"Impossibile pubblicare l'articolo. Riprova."

Non utilizzare alert browser primitivi.

Utilizzare toast, modali e feedback visivi moderni.

---

# 42. EMPTY STATES

Ogni sezione deve avere empty state professionali.

Esempio:

"Non hai ancora pubblicato articoli."

Con CTA:

"+ Crea il primo articolo"

Non lasciare tabelle vuote senza spiegazione.

---

# 43. LOADING STATES

Utilizzare:

* skeleton loading
* spinner quando appropriato
* optimistic UI dove sicuro

Evitare schermate completamente bianche durante il caricamento.

---

# 44. ERROR HANDLING

Gestire elegantemente:

* errori API
* problemi database
* upload falliti
* perdita connessione
* sessione scaduta
* permessi insufficienti

Mostrare messaggi comprensibili all'utente.

---

# 45. DATABASE

Progettare un database strutturato e scalabile.

Le entità principali dovrebbero includere almeno:

* users
* roles
* permissions
* articles
* categories
* tags
* article_tags
* authors
* media
* comments
* contact_messages
* notifications
* revisions
* scheduled_posts
* analytics
* audit_logs
* settings

Creare relazioni corrette e utilizzare foreign key, index e constraint appropriati.

---

# 46. API

Creare API ben strutturate.

Separare chiaramente:

* autenticazione
* articoli
* categorie
* tag
* media
* commenti
* messaggi
* utenti
* analytics
* impostazioni

Le API devono avere:

* validazione
* autenticazione
* autorizzazione
* gestione errori
* paginazione
* filtri
* sorting

---

# 47. PERFORMANCE

Il pannello deve essere veloce anche con:

* migliaia di articoli
* migliaia di commenti
* migliaia di media
* molti utenti

Implementare:

* pagination
* lazy loading
* caching dove utile
* query ottimizzate
* indexing database
* debounce della ricerca

Non caricare migliaia di record contemporaneamente.

---

# 48. PAGINAZIONE

Tutte le liste grandi devono utilizzare paginazione.

Esempio:

20 / 50 / 100 risultati per pagina.

Mostrare:

"1–20 di 1.284 articoli"

---

# 49. FILTRI SALVABILI

Permettere agli admin di salvare filtri frequenti.

Esempio:

"Articoli Netflix da revisionare"

"Commenti in attesa"

"Articoli programmati questa settimana"

---

# 50. QUICK ACTIONS

Nella dashboard aggiungere pulsanti rapidi:

* Nuovo articolo

* Nuova categoria

* Carica media

💬 Modera commenti

✉ Messaggi

📅 Calendario editoriale

---

# 51. DESIGN SYSTEM

Creare un design system coerente.

Definire:

* typography
* spacing
* border radius
* buttons
* inputs
* cards
* tables
* dropdown
* modal
* tooltip
* badges
* toast
* tabs
* pagination

Non creare componenti graficamente differenti tra una pagina e l'altra.

---

# 52. MICRO-INTERAZIONI

Aggiungere micro-interazioni moderne ma non invasive:

* hover
* transitions
* dropdown animations
* modal animations
* sidebar animation
* toast animation
* skeleton
* drag & drop feedback

Le animazioni devono essere veloci e professionali.

---

# 53. EDITORIALE — WORKFLOW

Implementare un workflow professionale:

**Bozza → Revisione → Approvazione → Programmato → Pubblicato**

Un Author non deve poter pubblicare direttamente se non possiede il relativo permesso.

Un Editor può approvare.

Un Admin può pubblicare.

---

# 54. PREVIEW PRIVATA

Un articolo in bozza deve poter essere visualizzato tramite un link di preview privata.

Il link non deve essere indicizzato dai motori di ricerca.

---

# 55. SEO TECNICA

Prevedere gestione di:

* sitemap XML
* robots.txt
* canonical
* Open Graph
* Twitter/X Cards
* structured data
* breadcrumb
* article schema

L'admin deve poter controllare almeno i principali parametri SEO senza modificare il codice.

---

# 56. STATI E BADGE

Utilizzare badge visivi chiari:

🟢 Pubblicato

🟡 In revisione

🔵 Programmato

⚪ Bozza

🔴 Cestino

I colori devono essere coerenti con il design system.

---

# 57. CONFERME INTELLIGENTI

Per azioni importanti utilizzare modali di conferma.

Esempio:

"Stai per eliminare definitivamente questo articolo."

Bottoni:

"Annulla"

"Elimina definitivamente"

Per azioni normali non mostrare continuamente conferme inutili.

---

# 58. ARCHITETTURA

Mantieni una separazione chiara tra:

Frontend pubblico

Admin Panel

Backend/API

Database

Storage Media

Authentication

Questo permetterà al magazine di evolversi in futuro.

---

# 59. CODICE

Il codice deve essere:

* modulare
* leggibile
* mantenibile
* scalabile
* documentato dove necessario
* tipizzato se il linguaggio lo permette

Non creare un unico file gigantesco.

Organizzare il progetto in:

* components
* pages
* layouts
* services
* hooks
* utils
* types
* API
* authentication
* database

---

# 60. PRIORITÀ ASSOLUTA

Non sacrificare la qualità dell'esperienza utente per aggiungere funzioni.

Il pannello deve risultare:

**POTENTE + SEMPLICE + VELOCE + PROFESSIONALE**

Un nuovo redattore deve riuscire a capire come creare e pubblicare un articolo senza bisogno di una formazione complessa.

---

# 61. RISULTATO FINALE

Voglio che il risultato finale sembri un prodotto professionale pronto per essere utilizzato da una vera redazione editoriale.

NON voglio:

* dashboard generica
* template admin banale
* CRUD base
* interfaccia sovraccarica
* tabelle senza UX
* funzioni finte
* pulsanti che non fanno nulla
* dati hardcoded

Voglio funzionalità realmente collegate tra loro.

Esempio:

Se creo un articolo:

→ scelgo categoria

→ aggiungo tag

→ carico immagine

→ compilo SEO

→ salvo bozza

→ l'articolo appare nelle bozze

→ posso mandarlo in revisione

→ l'editor lo approva

→ posso programmarlo

→ viene pubblicato automaticamente

→ appare nelle statistiche

→ riceve commenti

→ i commenti appaiono nella moderazione

→ posso moderarli

→ tutte le azioni vengono registrate nell'audit log.

L'intero sistema deve quindi essere **coerente e realmente interconnesso**.

---

# 62. PRIMA DI SVILUPPARE

Prima di scrivere il codice:

1. Analizza tutti i requisiti.
2. Progetta l'architettura.
3. Progetta il database.
4. Definisci le relazioni.
5. Definisci API e autenticazione.
6. Definisci ruoli e permessi.
7. Definisci la struttura delle pagine.
8. Definisci il design system.
9. Definisci il workflow editoriale.
10. Individua eventuali problemi architetturali.

Poi mostra una breve panoramica dell'architettura proposta.

Dopo l'approvazione, procedi allo sviluppo.

---

# 63. REGOLA IMPORTANTE

Ogni funzionalità mostrata nell'interfaccia deve essere realmente implementata.

Non creare semplicemente:

"Statistiche"

"SEO"

"Backup"

"Analytics"

come schermate decorative.

Se una funzione non può essere implementata completamente con lo stack disponibile, dichiaralo chiaramente e proponi l'implementazione corretta.

Il risultato deve essere un **CMS editoriale reale e utilizzabile in produzione**, non una demo grafica.
