<?php
require_once __DIR__ . '/db_connect.php';

try {
    $sql = "INSERT INTO `categories` (`id`, `name`, `slug`, `color`, `desc`) VALUES
    (1, 'Film', 'film', '#e50914', 'Tutti i film e le ultime novita cinematografiche'),
    (2, 'Serie TV', 'serie-tv', '#0070f3', 'Recensioni e notizie sulle serie TV e streaming'),
    (3, 'Recensioni', 'recensioni', '#ffb400', 'Tutte le recensioni con voto e giudizio critico'),
    (4, 'Articoli', 'articoli', '#10b981', 'Approfondimenti, speciali ed interviste'),
    (5, 'Classifiche', 'classifiche', '#ffa305', 'Articoli in classifica'),
    (6, 'News', 'news', '#601f5e', 'Le news inerenti al mondo del cinema')
    ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `slug`=VALUES(`slug`), `color`=VALUES(`color`), `desc`=VALUES(`desc`);";

    $pdo->exec($sql);
    echo "CATEGORIE LOCALI INSERITE E AGGIORNATE CON SUCCESSO!\n";
} catch (Exception $e) {
    echo "ERRORE: " . $e->getMessage() . "\n";
}
