<?php
// ==============================================================================
// CONFIGURAZIONE DUAL DATABASE: MYSQL LOCALE (XAMPP) & SUPABASE REST API
// ==============================================================================

// Scegli la modalità: 'local' (MySQL locale XAMPP) oppure 'supabase' (Supabase REST API)
$db_driver = getenv('DB_DRIVER') ?: 'local';

// ------------------------------------------------------------------------------
// CREDENZIALI SUPABASE (Project URL + Anon Key / Service Key)
// ------------------------------------------------------------------------------
$supabase_url = 'https://swwbcpgwqrbfjmsafbrj.supabase.co';
$supabase_key = 'sb_publishable_RAjCOYpXJ1IltA630y_fTw_SyyqCnXt';

if ($db_driver === 'supabase' || getenv('USE_SUPABASE') === 'true') {
    // Wrapper helper per interagire con Supabase tramite REST API (PostgREST nativo)
    class SupabaseClient {
        private $url;
        private $key;

        public function __construct($url, $key) {
            $this->url = rtrim($url, '/');
            $this->key = $key;
        }

        public function query($table, $params = []) {
            $queryString = !empty($params) ? '?' . http_build_query($params) : '';
            $ch = curl_init("{$this->url}/rest/v1/{$table}{$queryString}");
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => [
                    "apikey: {$this->key}",
                    "Authorization: Bearer {$this->key}",
                    "Content-Type: application/json"
                ]
            ]);
            $response = curl_exec($ch);
            curl_close($ch);
            return json_decode($response, true) ?: [];
        }

        public function insert($table, $data) {
            $ch = curl_init("{$this->url}/rest/v1/{$table}");
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($data),
                CURLOPT_HTTPHEADER => [
                    "apikey: {$this->key}",
                    "Authorization: Bearer {$this->key}",
                    "Content-Type: application/json",
                    "Prefer: return=representation"
                ]
            ]);
            $response = curl_exec($ch);
            curl_close($ch);
            return json_decode($response, true) ?: [];
        }
    }

    $supabase = new SupabaseClient($supabase_url, $supabase_key);
} else {
    // -------------------------------------------------------------
    // Connessione Locale (MySQL su XAMPP)
    // -------------------------------------------------------------
    $host = '127.0.0.1';
    $db   = 'sito_leila';
    $user = 'root';
    $pass = ''; // Default vuoto su XAMPP
    $charset = 'utf8mb4';

    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
}

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     header('Content-Type: application/json');
     echo json_encode([
         'status' => 'error',
         'message' => 'Errore di connessione al database (' . $db_driver . '): ' . $e->getMessage()
     ]);
     exit;
}

