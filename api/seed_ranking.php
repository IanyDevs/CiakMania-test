<?php
require_once 'api/db_connect.php';

// Pulisci e reinizializza le classifiche
$pdo->exec("DELETE FROM ranking_items");
$pdo->exec("DELETE FROM rankings");

// 1. CLASSIFICA FILM
$stmtRank = $pdo->prepare("INSERT INTO rankings (title, type, period, status, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)");
$stmtRank->execute(["Top 10 Cinema & Film della Settimana", "film", "settimanale", "pubblicata", "2026-08-10", "2026-08-17"]);
$filmRankId = $pdo->lastInsertId();

$filmItems = [
    [
        'title' => 'Oppenheimer',
        'year' => '2024',
        'genre' => 'BIOGRAFICO · DRAMMA',
        'rating' => '9.4/10',
        'image' => 'https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
        'desc' => 'Analisi approfondita del capolavoro premiato con 7 Oscar diretto da Christopher Nolan.',
        'badge' => 'CAPOLAVORO ASSOLUTO',
        'link' => 'articolo.html?id=1',
        'reviews' => '2.450'
    ],
    [
        'title' => 'Dune Parte 2',
        'year' => '2024',
        'genre' => 'FANTASCIENZA · AVVENTURA',
        'rating' => '9.1/10',
        'image' => 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
        'desc' => 'Denis Villeneuve completa la visione su Arrakis con una scala visiva senza precedenti.',
        'badge' => 'MUST WATCH',
        'link' => 'articolo.html?id=1',
        'reviews' => '1.890'
    ],
    [
        'title' => 'Interstellar',
        'year' => '2024',
        'genre' => 'SCI-FI · CULT',
        'rating' => '9.3/10',
        'image' => 'https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        'desc' => 'Riscopriamo i segreti della colonna sonora di Hans Zimmer e la scienza del viaggio temporale.',
        'badge' => 'RETROSPETTIVA',
        'link' => 'articolo.html?id=1',
        'reviews' => '1.540'
    ]
];

$insertItem = $pdo->prepare("INSERT INTO ranking_items (ranking_id, movie_id, title, year, genre, rating, image, description, position, previous_position, movement, badge, link_url, reviews_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

$pos = 1;
foreach ($filmItems as $it) {
    $insertItem->execute([
        $filmRankId,
        $pos,
        $it['title'],
        $it['year'],
        $it['genre'],
        $it['rating'],
        $it['image'],
        $it['desc'],
        $pos,
        $pos > 1 ? $pos - 1 : $pos,
        $pos === 1 ? 'up' : 'same',
        $it['badge'],
        $it['link'],
        $it['reviews']
    ]);
    $pos++;
}

// 2. CLASSIFICA SERIE TV
$stmtRank->execute(["Top Serie TV Più Viste & Acclamate", "serie-tv", "mensile", "pubblicata", "2026-08-01", "2026-08-31"]);
$tvRankId = $pdo->lastInsertId();

$tvItems = [
    [
        'title' => 'Stranger Things 5',
        'year' => '2025',
        'genre' => 'SERIE TV · FANTASCIENZA',
        'rating' => '8.9/10',
        'image' => 'https://image.tmdb.org/t/p/w780/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
        'desc' => 'L\'ultima epica battaglia per salvare Hawkins dal Sottosopra.',
        'badge' => 'TRENDING NOW',
        'link' => 'articolo.html?id=1',
        'reviews' => '3.120'
    ],
    [
        'title' => 'House of the Dragon 2',
        'year' => '2024',
        'genre' => 'FANTASY · DRAMMA',
        'rating' => '8.8/10',
        'image' => 'https://image.tmdb.org/t/p/w780/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg',
        'desc' => 'La Danza dei Draghi entra nel vivo con battaglie aeree mozzafiato.',
        'badge' => 'MUST WATCH',
        'link' => 'articolo.html?id=1',
        'reviews' => '2.180'
    ]
];

$pos = 1;
foreach ($tvItems as $it) {
    $insertItem->execute([
        $tvRankId,
        $pos,
        $it['title'],
        $it['year'],
        $it['genre'],
        $it['rating'],
        $it['image'],
        $it['desc'],
        $pos,
        $pos,
        'same',
        $it['badge'],
        $it['link'],
        $it['reviews']
    ]);
    $pos++;
}

// 3. CLASSIFICA ARTICOLI
$stmtRank->execute(["Top Articoli & Approfondimenti", "articoli", "settimanale", "pubblicata", "2026-08-10", "2026-08-17"]);
$artRankId = $pdo->lastInsertId();

$artItems = [
    [
        'title' => 'Oppenheimer: Il Trionfo Storico di Nolan',
        'year' => '2024',
        'genre' => 'RECENSIONI',
        'rating' => 'TOP STORY',
        'image' => 'https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
        'desc' => 'Analisi approfondita del capolavoro premiato con 7 Oscar.',
        'badge' => 'HOT STORY',
        'link' => 'articolo.html?id=1',
        'reviews' => '1.200'
    ],
    [
        'title' => 'The Batman Parte II: Le Nuove Teorie sulla Trama',
        'year' => '2026',
        'genre' => 'NEWS CINEMA',
        'rating' => 'TOP STORY',
        'image' => 'https://image.tmdb.org/t/p/w780/74xTEgt7R36Fpooo50r9T25onhq.jpg',
        'desc' => 'Tutti i dettagli svelati da Matt Reeves sulla nuova minaccia che colpirà Gotham City.',
        'badge' => 'IN ARRIVO',
        'link' => 'articolo.html?id=1',
        'reviews' => '980'
    ]
];

$pos = 1;
foreach ($artItems as $it) {
    $insertItem->execute([
        $artRankId,
        $pos,
        $it['title'],
        $it['year'],
        $it['genre'],
        $it['rating'],
        $it['image'],
        $it['desc'],
        $pos,
        $pos,
        'same',
        $it['badge'],
        $it['link'],
        $it['reviews']
    ]);
    $pos++;
}

echo "Classifiche per Film, Serie TV e Articoli create con successo!\n";

