Voglio creare un SISTEMA GRAFICO UNICO E RIUTILIZZABILE per i titoli delle sezioni della homepage del mio magazine cinematografico.

Ti fornisco come riferimento visivo l'immagine allegata: DEVI ANALIZZARLA ATTENTAMENTE E REPLICARNE IL LINGUAGGIO GRAFICO, NON SEMPLICEMENTE FARNE UNA COPIA APPROSSIMATIVA.

L'obiettivo è creare un componente frontend chiamato:

SectionHeading

che verrà utilizzato per tutte le principali sezioni della homepage.

==================================================
CONCEPT VISIVO
==================================================

Il design deve avere un'estetica:

- editoriale
- cinematografica
- elegante
- sofisticata
- riconoscibile
- premium
- moderna
- leggermente artistica

NON deve sembrare un normale heading HTML.

NON utilizzare il classico:

<h2>Ultimi articoli</h2>

Voglio che ogni titolo di sezione sembri quasi il titolo di un capitolo di una rivista cinematografica.

Il riferimento visivo mostra una struttura composta da DUE LIVELLI TIPOGRAFICI:

1. una piccola label superiore
2. un grande titolo editoriale sottostante

Questa struttura deve diventare parte integrante dell'identità del magazine.

==================================================
STRUTTURA
==================================================

Ogni SectionHeading deve avere questa struttura:

[accent grafico] LABEL

GRANDE TITOLO EDITORIALE

Esempio:

●  LATEST RELEASES & STORIES

Ultimi Articoli

La label deve essere piccola, elegante e con forte letter-spacing.

Il titolo principale deve essere molto più grande e avere una tipografia completamente diversa dalla label.

==================================================
LABEL SUPERIORE
==================================================

La label deve essere in MAIUSCOLO.

Utilizzare un font sans-serif moderno e pulito.

Caratteristiche:

- font-size circa 11–14px desktop
- font-weight 600 / 700
- letter-spacing molto elevato
- uppercase
- colore viola del brand
- line-height compatto

Esempio:

LATEST RELEASES & STORIES

NON utilizzare font troppo pesanti.

Deve sembrare una piccola categoria editoriale.

==================================================
ACCENT DOT
==================================================

Prima della label deve esserci un piccolo punto circolare.

Il punto deve essere:

- colore giallo/oro del brand
- perfettamente circolare
- piccolo
- leggermente luminoso
- allineato verticalmente con il testo

Colore:

#EBBD22

Il punto deve avere eventualmente un leggerissimo glow:

box-shadow: 0 0 8px rgba(...)

MA molto discreto.

Non trasformarlo in un elemento enorme.

==================================================
TITOLO PRINCIPALE
==================================================

Il titolo principale deve essere la parte più caratteristica.

Utilizzare un FONT SCRIPT / CALLIGRAFICO / EDITORIALE elegante, simile al riferimento.

Deve avere:

- lettere fluide
- grandi swash
- contrasto tra tratti sottili e spessi
- carattere elegante
- forte personalità

Il titolo deve sembrare quasi scritto a mano da un art director di una rivista.

Esempio:

Ultimi Articoli

Altri esempi:

Cinema

Serie TV

Streaming

Recensioni

News

Approfondimenti

I più letti

Prossime uscite

Trailer

Il font deve essere coerente in tutte le sezioni.

==================================================
IMPORTANTE: TYPOGRAPHY
==================================================

NON usare un normale serif.

NON usare Inter.

NON usare Roboto.

NON usare Arial.

NON usare un font generico.

Il titolo deve avere una vera PERSONALITÀ CALLIGRAFICA.

Se possibile utilizzare un font web appropriato con licenza compatibile.

Valutare font come:

Brittany Signature
Brittany
Allura
Great Vibes
Cormorant Garamond Italic
Bodoni Moda Italic
Playfair Display Italic

ma scegliere quello che più si avvicina al riferimento visivo e che mantenga una buona leggibilità.

La scelta finale deve essere coerente con il design generale del magazine.

==================================================
COLORE DEL TITOLO
==================================================

Il titolo principale deve utilizzare il viola del brand:

#7F0271

Non utilizzare un viola troppo acceso.

Deve essere elegante e leggermente profondo.

È possibile utilizzare una variazione molto sottile del viola per creare profondità, ma evitare gradienti vistosi.

==================================================
COMPOSIZIONE
==================================================

Il titolo deve avere una posizione leggermente libera rispetto alla label.

NON creare un blocco rigido.

La label deve essere allineata a sinistra.

Il titolo può avere una leggera traslazione orizzontale o una composizione che ricordi una firma editoriale.

Deve esserci spazio tra:

LABEL

e

TITLE

ma non troppo.

Il risultato deve sembrare intenzionale e raffinato.

==================================================
DECORAZIONE
==================================================

Aggiungere eventualmente piccoli elementi grafici estremamente sottili.

Possibili:

- linea orizzontale
- piccolo frame
- micro-line
- numero della scena
- piccolo indicatore

MA NON riempire il componente di elementi.

Il protagonista deve rimanere il titolo.

==================================================
CINEMATIC IDENTITY
==================================================

Il componente deve avere una leggera connessione con il linguaggio cinematografico.

Per esempio, sotto o vicino al titolo può essere presente un piccolo metadata opzionale:

SCENE 01

oppure:

01 / 06

oppure:

LATEST STORIES

Questi elementi devono essere molto discreti.

Non devono competere con il titolo.

==================================================
ANIMAZIONE
==================================================

Il componente DEVE avere un'animazione di ingresso.

Quando la sezione entra nella viewport:

1. la label compare leggermente dal basso
2. il punto giallo compare con un piccolo scale-in
3. il titolo script viene rivelato progressivamente
4. eventualmente una piccola linea viene disegnata

L'animazione deve essere elegante.

Durata indicativa:

600–900ms.

Utilizzare easing morbido.

NON usare bounce.

NON usare animazioni aggressive.

==================================================
TITLE REVEAL
==================================================

Per il titolo principale voglio un reveal sofisticato.

Possibile tecnica:

overflow: hidden

↓

il testo parte leggermente sotto

↓

sale nella posizione finale

↓

opacity 0 → 1

Eventualmente utilizzare una clip-path mask per rendere il reveal più editoriale.

Il risultato deve ricordare l'apertura di una rivista o di una sequenza cinematografica.

==================================================
HOVER
==================================================

Il titolo non deve necessariamente avere un hover aggressivo.

Se la sezione heading è interattiva, utilizzare una micro-interazione molto discreta:

- leggerissimo shift
- underline
- variazione minima del viola
- piccola animazione del punto

Niente effetti esagerati.

==================================================
RIUTILIZZABILITÀ
==================================================

Il componente deve essere completamente riutilizzabile.

Esempio:

<SectionHeading
  eyebrow="LATEST RELEASES & STORIES"
  title="Ultimi Articoli"
/>

<SectionHeading
  eyebrow="FROM THE BIG SCREEN"
  title="Cinema"
/>

<SectionHeading
  eyebrow="WHAT TO WATCH NEXT"
  title="Serie TV"
/>

<SectionHeading
  eyebrow="OUR VERDICT"
  title="Recensioni"
/>

<SectionHeading
  eyebrow="COMING SOON"
  title="Prossime Uscite"
/>

Il componente deve quindi accettare almeno:

- eyebrow
- title
- optional sceneNumber
- optional accent
- optional alignment
- optional animation

==================================================
VARIANTI
==================================================

Prevedere almeno 3 varianti grafiche:

VARIANT 1 — STANDARD

Dot + eyebrow + script title

VARIANT 2 — CINEMATIC

Dot + eyebrow + scene number + script title + thin line

VARIANT 3 — MINIMAL

Solo eyebrow + grande script title

Tutte devono appartenere allo stesso design system.

==================================================
ALIGNMENT
==================================================

Prevedere:

left
center
right

La variante principale deve essere LEFT.

Il centro deve essere utilizzato solamente per sezioni particolari.

==================================================
RESPONSIVE
==================================================

Desktop:

Titolo grande e scenografico.

Tablet:

Ridurre leggermente dimensione e spaziature.

Mobile:

Mantenere la personalità del font script ma evitare che il titolo occupi troppe righe.

Indicativamente:

Desktop:
title 64–82px

Tablet:
title 52–64px

Mobile:
title 42–52px

Questi valori NON sono rigidi: adattali al font effettivamente scelto.

La label deve rimanere leggibile anche su schermi piccoli.

==================================================
SPACING
==================================================

Il componente deve avere un'ampia quantità di whitespace.

NON schiacciare il titolo contro la sezione precedente.

Creare una sensazione di respiro editoriale.

Il margine inferiore deve essere sufficiente per separare chiaramente il titolo dal contenuto della sezione.

==================================================
INTEGRAZIONE CON IL DESIGN DEL MAGAZINE
==================================================

Il magazine utilizza:

Primary Purple:
#7F0271

Accent Gold:
#EBBD22

Il sistema di heading deve diventare uno degli elementi distintivi del sito.

Quando un utente vede:

● LATEST RELEASES & STORIES

Ultimi Articoli

deve riconoscere immediatamente il magazine.

Questo stile deve essere replicato in:

- homepage
- pagine categoria
- pagina recensioni
- pagina cinema
- pagina serie TV
- pagina streaming
- eventuali landing editoriali

==================================================
IMPORTANTE: NON SEMPLIFICARE
==================================================

NON trasformare il design in:

piccolo testo + titolo serif.

Questa è la cosa più importante.

Voglio mantenere:

- il contrasto tra label e script
- il punto giallo
- la forte personalità tipografica
- la composizione ariosa
- il carattere editoriale
- l'identità cinematografica

Deve sembrare un elemento DI DESIGN, non semplicemente un titolo.

==================================================
CODICE
==================================================

Implementare il componente in modo pulito e professionale.

Separare:

- struttura
- stile
- animazioni

Evitare codice duplicato.

Utilizzare CSS variables/design tokens per:

--brand-purple
--brand-gold
--heading-font
--eyebrow-font

L'animazione deve essere controllata da CSS/GSAP/Framer Motion in base allo stack già utilizzato dal progetto.

NON introdurre una nuova libreria se non necessaria.

==================================================
OBIETTIVO FINALE
==================================================

Il risultato deve essere MOLTO VICINO al linguaggio visivo dell'immagine di riferimento che ti ho fornito.

Deve sembrare:

EDITORIALE
CINEMATOGRAFICO
ELEGANTE
ARTISTICO
PREMIUM
RICONOSCIBILE

e soprattutto NON deve sembrare un normale heading da sito web.

Prima di implementarlo, analizza l'immagine di riferimento e ricrea fedelmente:

- proporzioni
- gerarchia
- rapporto tra eyebrow e titolo
- stile tipografico
- dimensioni relative
- spaziatura
- posizione del dot
- colori
- feeling generale

Poi migliora il sistema rendendolo responsive, animato e riutilizzabile nel resto del magazine.