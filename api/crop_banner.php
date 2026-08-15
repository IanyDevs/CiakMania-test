<?php
$source = __DIR__ . '/../ASSETS/banner2.png';
$destination = __DIR__ . '/../ASSETS/banner_clean.png';

list($w, $h) = getimagesize($source);
$im = imagecreatefrompng($source);

// Trova i veri confini del colore viola scuro (#601f5e) per eliminare ogni bordo bianco esterno
$top = 0;
$bottom = $h - 1;
$left = 0;
$right = $w - 1;

// Scansione bordi
for ($y = 0; $y < $h; $y++) {
    $rgb = imagecolorat($im, round($w / 2), $y);
    $r = ($rgb >> 16) & 0xFF;
    $g = ($rgb >> 8) & 0xFF;
    $b = $rgb & 0xFF;
    if ($r < 200 && $b > 40) { // colore porpora trovato
        $top = $y;
        break;
    }
}

for ($y = $h - 1; $y >= 0; $y--) {
    $rgb = imagecolorat($im, round($w / 2), $y);
    $r = ($rgb >> 16) & 0xFF;
    $g = ($rgb >> 8) & 0xFF;
    $b = $rgb & 0xFF;
    if ($r < 200 && $b > 40) {
        $bottom = $y;
        break;
    }
}

for ($x = 0; $x < $w; $x++) {
    $rgb = imagecolorat($im, $x, round($h / 2));
    $r = ($rgb >> 16) & 0xFF;
    $g = ($rgb >> 8) & 0xFF;
    $b = $rgb & 0xFF;
    if ($r < 200 && $b > 40) {
        $left = $x;
        break;
    }
}

for ($x = $w - 1; $x >= 0; $x--) {
    $rgb = imagecolorat($im, $x, round($h / 2));
    $r = ($rgb >> 16) & 0xFF;
    $g = ($rgb >> 8) & 0xFF;
    $b = $rgb & 0xFF;
    if ($r < 200 && $b > 40) {
        $right = $x;
        break;
    }
}

$crop_w = $right - $left + 1;
$crop_h = $bottom - $top + 1;

$cropped = imagecrop($im, ['x' => $left, 'y' => $top, 'width' => $crop_w, 'height' => $crop_h]);

if ($cropped !== false) {
    imagepng($cropped, $destination);
    imagepng($cropped, $source); // Sovrascrivi anche banner2.png per rimuovere completamente lo sfondo bianco
    imagedestroy($cropped);
    echo "RITAGLIO PERFETTO EFFETTUATO! Box viola esatto: {$crop_w}x{$crop_h} (Top: $top, Bottom: $bottom, Left: $left, Right: $right)\n";
}
imagedestroy($im);
