<?php
// Central REST API Controller for Ciak Mania CMS
error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'db_connect.php';

try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `notifications` (
      `id` INT AUTO_INCREMENT PRIMARY KEY,
      `type` VARCHAR(50) NOT NULL,
      `title` VARCHAR(255) NOT NULL,
      `message` TEXT NOT NULL,
      `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      `is_read` TINYINT(1) DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    
    // Auto-update users table if columns from newer updates are missing or expand column size
    try {
        $pdo->exec("ALTER TABLE `users` ADD COLUMN `profile_image` TEXT DEFAULT NULL;");
    } catch (\PDOException $ex) {}
    try {
        $pdo->exec("ALTER TABLE `users` MODIFY COLUMN `profile_image` TEXT DEFAULT NULL;");
    } catch (\PDOException $ex) {}
    try {
        $pdo->exec("ALTER TABLE `users` ADD COLUMN `bio` TEXT DEFAULT NULL;");
    } catch (\PDOException $ex) {}

    // Auto-update articles table for custom Title & Excerpt font/color styling
    try { $pdo->exec("ALTER TABLE `articles` ADD COLUMN `title_font` VARCHAR(100) DEFAULT 'Playfair Display';"); } catch (\PDOException $ex) {}
    try { $pdo->exec("ALTER TABLE `articles` ADD COLUMN `title_color` VARCHAR(50) DEFAULT '#FFFFFF';"); } catch (\PDOException $ex) {}
    try { $pdo->exec("ALTER TABLE `articles` ADD COLUMN `excerpt_font` VARCHAR(100) DEFAULT 'Plus Jakarta Sans';"); } catch (\PDOException $ex) {}
    try { $pdo->exec("ALTER TABLE `articles` ADD COLUMN `excerpt_color` VARCHAR(50) DEFAULT '#D6D3DC';"); } catch (\PDOException $ex) {}

    // Auto-create rankings tables
    $pdo->exec("CREATE TABLE IF NOT EXISTS `rankings` (
      `id` INT AUTO_INCREMENT PRIMARY KEY,
      `title` VARCHAR(255) NOT NULL,
      `type` VARCHAR(50) DEFAULT 'film',
      `period` VARCHAR(50) DEFAULT 'settimanale',
      `status` VARCHAR(20) DEFAULT 'pubblicata',
      `start_date` VARCHAR(50) DEFAULT NULL,
      `end_date` VARCHAR(50) DEFAULT NULL,
      `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $pdo->exec("CREATE TABLE IF NOT EXISTS `ranking_items` (
      `id` INT AUTO_INCREMENT PRIMARY KEY,
      `ranking_id` INT NOT NULL,
      `movie_id` INT DEFAULT NULL,
      `title` VARCHAR(255) NOT NULL,
      `year` VARCHAR(10) DEFAULT '',
      `genre` VARCHAR(100) DEFAULT '',
      `rating` VARCHAR(20) DEFAULT '',
      `image` VARCHAR(500) DEFAULT '',
      `description` TEXT DEFAULT NULL,
      `position` INT NOT NULL,
      `previous_position` INT DEFAULT NULL,
      `movement` VARCHAR(20) DEFAULT 'same',
      `badge` VARCHAR(100) DEFAULT '',
      `link_url` VARCHAR(255) DEFAULT '',
      `reviews_count` VARCHAR(50) DEFAULT NULL,
      `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (`ranking_id`) REFERENCES `rankings`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Auto-seed delle 6 categorie fondamentali se la tabella categories è vuota
    $catCount = $pdo->query("SELECT COUNT(*) FROM `categories`")->fetchColumn();
    if ($catCount == 0) {
        $pdo->exec("INSERT INTO `categories` (`id`, `name`, `slug`, `color`, `desc`) VALUES
        (1, 'Film', 'film', '#e50914', 'Tutti i film e le ultime novita cinematografiche'),
        (2, 'Serie TV', 'serie-tv', '#0070f3', 'Recensioni e notizie sulle serie TV e streaming'),
        (3, 'Recensioni', 'recensioni', '#ffb400', 'Tutte le recensioni con voto e giudizio critico'),
        (4, 'Articoli', 'articoli', '#10b981', 'Approfondimenti, speciali ed interviste'),
        (5, 'Classifiche', 'classifiche', '#ffa305', 'Articoli in classifica'),
        (6, 'News', 'news', '#601f5e', 'Le news inerenti al mondo del cinema');");
    }
} catch (\PDOException $e) {
    // Silenzioso
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

// Helper to log activities
function logAudit($pdo, $user, $action, $target) {
    $timeString = date('d M') . ' alle ' . date('H:i');
    $stmt = $pdo->prepare("INSERT INTO audit_logs (user, action, target, time) VALUES (?, ?, ?, ?)");
    $stmt->execute([$user, $action, $target, $timeString]);
}

switch ($action) {

    // 1. User login authentication
    case 'login':
        $data = json_decode(file_get_contents('php://input'), true);
        $username = isset($data['username']) ? trim($data['username']) : '';
        $password = isset($data['password']) ? $data['password'] : '';

        if (empty($username) || empty($password)) {
            echo json_encode(['status' => 'error', 'message' => 'Inserisci username e password']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user) {
            // Check password hash, or plain text as fallback
            if (password_verify($password, $user['password']) || $password === $user['password']) {
                echo json_encode([
                    'status' => 'success',
                    'user' => [
                        'name' => $user['name'],
                        'username' => $user['username'],
                        'role' => $user['role'],
                        'avatar' => $user['avatar'],
                        'profile_image' => isset($user['profile_image']) ? $user['profile_image'] : null
                    ]
                ]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Password errata']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Utente non trovato']);
        }
        break;

    // 2. Fetch Dashboard stats/KPIs
    case 'get_dashboard_kpis':
        // Articles count by status
        $published = $pdo->query("SELECT COUNT(*) FROM articles WHERE status = 'pubblicato'")->fetchColumn();
        $bozza = $pdo->query("SELECT COUNT(*) FROM articles WHERE status = 'bozza'")->fetchColumn();
        $programmato = $pdo->query("SELECT COUNT(*) FROM articles WHERE status = 'programmato'")->fetchColumn();
        
        // Comments in_attesa count
        $comments_wait = $pdo->query("SELECT COUNT(*) FROM comments WHERE status = 'in_attesa'")->fetchColumn();
        
        // Unread messages count
        $unread_msgs = $pdo->query("SELECT COUNT(*) FROM messages WHERE unread = 1 AND folder = 'inbox'")->fetchColumn();
        
        // Total views sum
        $views_total = $pdo->query("SELECT SUM(views) FROM articles")->fetchColumn();
        $views_total = $views_total ? (int)$views_total : 0;

        // Fetch recent articles (limit 3)
        $recent_articles = $pdo->query("SELECT * FROM articles ORDER BY id DESC LIMIT 3")->fetchAll();

        // Fetch recent audit logs (limit 3)
        $recent_logs = $pdo->query("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 3")->fetchAll();

        // Fetch recent contact messages (limit 2)
        $recent_messages = $pdo->query("SELECT * FROM messages WHERE folder = 'inbox' ORDER BY id DESC LIMIT 2")->fetchAll();

        echo json_encode([
            'status' => 'success',
            'kpi' => [
                'published' => (int)$published,
                'drafts' => (int)$bozza,
                'scheduled' => (int)$programmato,
                'totalViews' => $views_total,
                'commentsToApprove' => (int)$comments_wait,
                'unreadMsgs' => (int)$unread_msgs
            ],
            'recent_articles' => $recent_articles,
            'recent_logs' => $recent_logs,
            'recent_messages' => $recent_messages
        ]);
        break;

    // 3. Get Articles List (Admin View)
    case 'get_articles':
        $search = isset($_GET['search']) ? '%' . $_GET['search'] . '%' : '%';
        $category = isset($_GET['category']) ? $_GET['category'] : 'all';
        $status = isset($_GET['status']) ? $_GET['status'] : 'all';
        $authorFilter = isset($_GET['author']) ? $_GET['author'] : 'all';

        $query = "SELECT * FROM articles WHERE (title LIKE ? OR excerpt LIKE ? OR content LIKE ?)";
        $params = [$search, $search, $search];

        if ($category !== 'all') {
            $query .= " AND category = ?";
            $params[] = $category;
        }

        if ($status !== 'all') {
            $query .= " AND status = ?";
            $params[] = $status;
        } else {
            // Default: do not show trashed items
            $query .= " AND status != 'cestino'";
        }

        if ($authorFilter !== 'all') {
            $query .= " AND author = ?";
            $params[] = $authorFilter;
        }

        $query .= " ORDER BY id DESC";

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $articles = $stmt->fetchAll();

        echo json_encode([
            'status' => 'success',
            'articles' => $articles
        ]);
        break;

    // 4. Save/Create/Update Article
    case 'save_article':
        $data = json_decode(file_get_contents('php://input'), true);
        
        $id = isset($data['id']) ? $data['id'] : null;
        $title = isset($data['title']) ? trim($data['title']) : '';
        $category = isset($data['category']) ? trim($data['category']) : 'film';
        $rating = isset($data['rating']) && $data['rating'] !== '' ? floatval($data['rating']) : null;
        $image = isset($data['image']) ? trim($data['image']) : '';
        $excerpt = isset($data['excerpt']) ? trim($data['excerpt']) : '';
        $content = isset($data['content']) ? trim($data['content']) : '';
        $status = isset($data['status']) ? trim($data['status']) : 'bozza';
        $tags = isset($data['tags']) ? json_encode($data['tags']) : '[]';
        $keyword = isset($data['keyword']) ? trim($data['keyword']) : '';
        $slug = isset($data['slug']) ? trim($data['slug']) : '';
        $metaDesc = isset($data['metaDesc']) ? trim($data['metaDesc']) : '';
        $author = isset($data['author']) ? trim($data['author']) : 'Leila Cimarelli';
        $technical_judgment = isset($data['technical_judgment']) ? trim($data['technical_judgment']) : '';
        $title_font = isset($data['title_font']) ? trim($data['title_font']) : 'Playfair Display';
        $title_color = isset($data['title_color']) ? trim($data['title_color']) : '#FFFFFF';
        $excerpt_font = isset($data['excerpt_font']) ? trim($data['excerpt_font']) : 'Plus Jakarta Sans';
        $excerpt_color = isset($data['excerpt_color']) ? trim($data['excerpt_color']) : '#D6D3DC';

        if (empty($title) || empty($content)) {
            echo json_encode(['status' => 'error', 'message' => 'Titolo e contenuto sono obbligatori.']);
            exit;
        }

        if (empty($slug)) {
            $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
            $slug = trim($slug, '-');
        }
        if (empty($slug)) {
            $slug = 'articolo-' . time();
        }

        // Guarantee unique slug to prevent SQL 1062 duplicate key error
        $baseSlug = $slug;
        $counter = 1;
        while (true) {
            $checkStmt = $pdo->prepare("SELECT id FROM articles WHERE slug = ? AND id != ?");
            $checkStmt->execute([$slug, $id ? $id : 0]);
            if (!$checkStmt->fetch()) {
                break;
            }
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        if ($id) {
            // Update
            $stmt = $pdo->prepare("UPDATE articles SET title = ?, category = ?, rating = ?, image = ?, excerpt = ?, content = ?, status = ?, tags = ?, keyword = ?, slug = ?, metaDesc = ?, author = ?, technical_judgment = ?, title_font = ?, title_color = ?, excerpt_font = ?, excerpt_color = ? WHERE id = ?");
            $stmt->execute([$title, $category, $rating, $image, $excerpt, $content, $status, $tags, $keyword, $slug, $metaDesc, $author, $technical_judgment, $title_font, $title_color, $excerpt_font, $excerpt_color, $id]);
            logAudit($pdo, $author, 'ha modificato l\'articolo', $title);
        } else {
            // Insert
            $monthsIt = [
                'January' => 'Gennaio', 'February' => 'Febbraio', 'March' => 'Marzo',
                'April' => 'Aprile', 'May' => 'Maggio', 'June' => 'Giugno',
                'July' => 'Luglio', 'August' => 'Agosto', 'September' => 'Settembre',
                'October' => 'Ottobre', 'November' => 'Novembre', 'December' => 'Dicembre'
            ];
            $dateStr = strtr(date('d F Y'), $monthsIt);
            $stmt = $pdo->prepare("INSERT INTO articles (title, category, rating, image, excerpt, content, date, status, tags, keyword, slug, metaDesc, author, technical_judgment, title_font, title_color, excerpt_font, excerpt_color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$title, $category, $rating, $image, $excerpt, $content, $dateStr, $status, $tags, $keyword, $slug, $metaDesc, $author, $technical_judgment, $title_font, $title_color, $excerpt_font, $excerpt_color]);
            logAudit($pdo, $author, 'ha creato l\'articolo', $title);
        }

        // Inserimento notifica automatica in base allo stato
        if ($status === 'pubblicato') {
            $stmtNoti = $pdo->prepare("INSERT INTO notifications (type, title, message) VALUES ('article_published', ?, ?)");
            $stmtNoti->execute(['Articolo pubblicato', "L'articolo \"$title\" è ora online."]);
        } elseif ($status === 'programmato') {
            $stmtNoti = $pdo->prepare("INSERT INTO notifications (type, title, message) VALUES ('article_scheduled', ?, ?)");
            $stmtNoti->execute(['Articolo programmato', "L'articolo \"$title\" è stato programmato per la pubblicazione."]);
        }

        echo json_encode(['status' => 'success']);
        break;

    // 5. Change article status to Cestino
    case 'trash_article':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($data['id']) ? $data['id'] : null;
        $author = isset($data['author']) ? $data['author'] : 'Admin';

        if ($id) {
            $stmt = $pdo->prepare("SELECT title FROM articles WHERE id = ?");
            $stmt->execute([$id]);
            $title = $stmt->fetchColumn();

            $stmt = $pdo->prepare("UPDATE articles SET status = 'cestino' WHERE id = ?");
            $stmt->execute([$id]);

            logAudit($pdo, $author, 'ha spostato nel cestino l\'articolo', $title);
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'ID non valido']);
        }
        break;

    // 6. Restore article from Cestino
    case 'restore_article':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($data['id']) ? $data['id'] : null;
        $author = isset($data['author']) ? $data['author'] : 'Admin';

        if ($id) {
            $stmt = $pdo->prepare("SELECT title FROM articles WHERE id = ?");
            $stmt->execute([$id]);
            $title = $stmt->fetchColumn();

            $stmt = $pdo->prepare("UPDATE articles SET status = 'bozza' WHERE id = ?");
            $stmt->execute([$id]);

            logAudit($pdo, $author, 'ha ripristinato dal cestino l\'articolo', $title);
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'ID non valido']);
        }
        break;

    // 7. Delete article permanently
    case 'delete_article_permanently':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($data['id']) ? $data['id'] : null;
        $author = isset($data['author']) ? $data['author'] : 'Admin';

        if ($id) {
            $stmt = $pdo->prepare("SELECT title FROM articles WHERE id = ?");
            $stmt->execute([$id]);
            $title = $stmt->fetchColumn();

            $stmt = $pdo->prepare("DELETE FROM articles WHERE id = ?");
            $stmt->execute([$id]);

            logAudit($pdo, $author, 'ha eliminato permanentemente', $title);
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'ID non valido']);
        }
        break;

    // 8. Bulk change status on selected articles
    case 'execute_bulk_action':
        $data = json_decode(file_get_contents('php://input'), true);
        $ids = isset($data['ids']) ? $data['ids'] : [];
        $newStatus = isset($data['status']) ? $data['status'] : 'bozza';
        $author = isset($data['author']) ? $data['author'] : 'Admin';

        if (!empty($ids)) {
            $in  = str_repeat('?,', count($ids) - 1) . '?';
            $sql = "UPDATE articles SET status = ? WHERE id IN ($in)";
            $params = array_merge([$newStatus], $ids);
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            logAudit($pdo, $author, "ha eseguito cambio stato multiplo ($newStatus) su", count($ids) . " articoli");
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Nessun articolo selezionato']);
        }
        break;

    // 9. Categories listing
    case 'get_categories':
        $categories = $pdo->query("SELECT * FROM categories ORDER BY name ASC")->fetchAll();
        if (empty($categories)) {
            $defaultCats = [
                ['Film', 'film', '#e50914', 'Tutti i film e le ultime novita cinematografiche'],
                ['Serie TV', 'serie-tv', '#0070f3', 'Recensioni e notizie sulle serie TV e streaming'],
                ['Recensioni', 'recensioni', '#ffb400', 'Tutte le recensioni con voto e giudizio critico'],
                ['Articoli', 'articoli', '#10b981', 'Approfondimenti, speciali ed interviste'],
                ['Eventi & Festival', 'eventi', '#8b5cf6', 'Eventi, festival cinematografici e mostre'],
                ['Classifiche', 'classifiche', '#ec4899', 'Top list, classifiche e ranking cinematografici']
            ];
            foreach ($defaultCats as $cat) {
                try {
                    $stmt = $pdo->prepare("INSERT INTO categories (name, slug, color, `desc`) VALUES (?, ?, ?, ?)");
                    $stmt->execute($cat);
                } catch (\PDOException $ex) {}
            }
            $categories = $pdo->query("SELECT * FROM categories ORDER BY name ASC")->fetchAll();
        }
        echo json_encode(['status' => 'success', 'categories' => $categories]);
        break;

    // 10. Save Category (Insert or Update)
    case 'save_category':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = isset($data['id']) && $data['id'] !== '' ? intval($data['id']) : null;
            $name = isset($data['name']) ? trim($data['name']) : '';
            $color = isset($data['color']) ? trim($data['color']) : '#800270';
            $desc = isset($data['desc']) ? trim($data['desc']) : '';
            $author = isset($data['author']) ? $data['author'] : 'Admin';

            if (empty($name)) {
                echo json_encode(['status' => 'error', 'message' => 'Il nome è obbligatorio']);
                exit;
            }

            $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));
            $slug = trim($slug, '-');
            if (empty($slug)) $slug = 'cat-' . time();

            if ($id) {
                // UPDATE existing category
                $stmt = $pdo->prepare("UPDATE categories SET name = ?, slug = ?, color = ?, `desc` = ? WHERE id = ?");
                $stmt->execute([$name, $slug, $color, $desc, $id]);
                logAudit($pdo, $author, 'ha modificato la categoria', $name);
            } else {
                // INSERT new category
                $stmt = $pdo->prepare("INSERT INTO categories (name, slug, color, `desc`) VALUES (?, ?, ?, ?)");
                $stmt->execute([$name, $slug, $color, $desc]);
                logAudit($pdo, $author, 'ha creato la categoria', $name);
            }
            echo json_encode(['status' => 'success']);
        } catch (Exception $e) {
            echo json_encode(['status' => 'error', 'message' => 'Errore nel database: ' . $e->getMessage()]);
        }
        break;

    // 10b. Delete Category
    case 'delete_category':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = isset($data['id']) ? intval($data['id']) : null;
            $author = isset($data['author']) ? $data['author'] : 'Admin';

            if (!$id) {
                echo json_encode(['status' => 'error', 'message' => 'ID categoria non valido']);
                exit;
            }

            $stmtCat = $pdo->prepare("SELECT name FROM categories WHERE id = ?");
            $stmtCat->execute([$id]);
            $cat = $stmtCat->fetch();
            $catName = $cat ? $cat['name'] : "ID #$id";

            $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
            $stmt->execute([$id]);

            logAudit($pdo, $author, 'ha eliminato la categoria', $catName);
            echo json_encode(['status' => 'success']);
        } catch (Exception $e) {
            echo json_encode(['status' => 'error', 'message' => 'Impossibile eliminare la categoria: ' . $e->getMessage()]);
        }
        break;

    // 11. Media Library listing
    case 'get_media':
        $media = $pdo->query("SELECT * FROM media ORDER BY id DESC")->fetchAll();
        echo json_encode(['status' => 'success', 'media' => $media]);
        break;

    // 12. Save Media URL link
    case 'save_media':
        $data = json_decode(file_get_contents('php://input'), true);
        $url = isset($data['url']) ? trim($data['url']) : '';
        $name = isset($data['name']) ? trim($data['name']) : 'media-' . time() . '.jpg';

        if (empty($url)) {
            echo json_encode(['status' => 'error', 'message' => 'L\'URL è obbligatorio']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO media (url, name) VALUES (?, ?)");
        $stmt->execute([$url, $name]);
        echo json_encode(['status' => 'success']);
        break;

    // 12b. Delete Media item (DB record & physical file)
    case 'delete_media':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($data['id']) ? $data['id'] : null;

        if ($id) {
            $stmt = $pdo->prepare("SELECT url FROM media WHERE id = ?");
            $stmt->execute([$id]);
            $url = $stmt->fetchColumn();

            if ($url && strpos($url, 'uploads/') === 0) {
                $physicalPath = '../' . $url;
                if (file_exists($physicalPath)) {
                    unlink($physicalPath);
                }
            }

            $stmt = $pdo->prepare("DELETE FROM media WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'ID non valido']);
        }
        break;

    // 13. Comments listing
    case 'get_comments':
        $comments = $pdo->query("SELECT * FROM comments ORDER BY id DESC")->fetchAll();
        echo json_encode(['status' => 'success', 'comments' => $comments]);
        break;

    // 14. Moderate comments (approve, spam, delete)
    case 'moderate_comment':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($data['id']) ? $data['id'] : null;
        $status = isset($data['status']) ? $data['status'] : '';

        if ($id) {
            if ($status === 'eliminato') {
                $stmt = $pdo->prepare("DELETE FROM comments WHERE id = ?");
                $stmt->execute([$id]);
            } else {
                $stmt = $pdo->prepare("UPDATE comments SET status = ? WHERE id = ?");
                $stmt->execute([$status, $id]);
            }
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'ID non valido']);
        }
        break;

    // 15. Messages listing (Inbox)
    case 'get_messages':
        $messages = $pdo->query("SELECT * FROM messages ORDER BY id DESC")->fetchAll();
        echo json_encode(['status' => 'success', 'messages' => $messages]);
        break;

    // 16. Star message toggle
    case 'star_message':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($data['id']) ? $data['id'] : null;

        if ($id) {
            $stmt = $pdo->prepare("UPDATE messages SET starred = 1 - starred WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error']);
        }
        break;

    // 17. Archive message toggle
    case 'archive_message':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($data['id']) ? $data['id'] : null;

        if ($id) {
            $stmt = $pdo->prepare("SELECT folder FROM messages WHERE id = ?");
            $stmt->execute([$id]);
            $folder = $stmt->fetchColumn();

            $newFolder = $folder === 'archiviati' ? 'inbox' : 'archiviati';
            $stmt = $pdo->prepare("UPDATE messages SET folder = ? WHERE id = ?");
            $stmt->execute([$newFolder, $id]);
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error']);
        }
        break;

    // 17.5 Delete message
    case 'delete_message':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($data['id']) ? $data['id'] : null;

        if ($id) {
            $stmt = $pdo->prepare("DELETE FROM messages WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'ID non valido']);
        }
        break;

    // 17.6 Mark message as read
    case 'read_message':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($data['id']) ? $data['id'] : null;

        if ($id) {
            $stmt = $pdo->prepare("UPDATE messages SET unread = 0 WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'ID non valido']);
        }
        break;

    // 18. Send message from public site
    case 'send_message':
        $data = json_decode(file_get_contents('php://input'), true);
        $sender = isset($data['sender']) ? trim($data['sender']) : '';
        $email = isset($data['email']) ? trim($data['email']) : '';
        $subject = isset($data['subject']) ? trim($data['subject']) : 'Nessun oggetto';
        $text = isset($data['text']) ? trim($data['text']) : '';

        if (empty($sender) || empty($email) || empty($text)) {
            echo json_encode(['status' => 'error', 'message' => 'Compila tutti i campi']);
            exit;
        }

        $excerpt = mb_substr($text, 0, 45) . (mb_strlen($text) > 45 ? '...' : '');
        $dateStr = date('d M');
        
        $stmt = $pdo->prepare("INSERT INTO messages (sender, email, subject, excerpt, text, date, folder, unread, starred) VALUES (?, ?, ?, ?, ?, ?, 'inbox', 1, 0)");
        $stmt->execute([$sender, $email, $subject, $excerpt, $text, $dateStr]);
        
        // Inserimento notifica
        $stmtNoti = $pdo->prepare("INSERT INTO notifications (type, title, message) VALUES ('message', ?, ?)");
        $stmtNoti->execute(['Nuovo messaggio ricevuto', "Da: $sender ($email) - Oggetto: $subject"]);

        echo json_encode(['status' => 'success']);
        break;

    // 19. Get dynamic article detail (Public)
    case 'get_article_detail':
        $id = isset($_GET['id']) ? $_GET['id'] : '';
        
        if (empty($id)) {
            echo json_encode(['status' => 'error', 'message' => 'ID non valido']);
            exit;
        }

        // Fetch detail
        $stmt = $pdo->prepare("
            SELECT a.*, u.profile_image, u.bio, u.avatar as author_avatar
            FROM articles a
            LEFT JOIN users u ON a.author = u.name
            WHERE a.id = ? AND a.status = 'pubblicato'
        ");
        $stmt->execute([$id]);
        $art = $stmt->fetch();

        if ($art) {
            // Increment view count
            $pdo->prepare("UPDATE articles SET views = views + 1 WHERE id = ?")->execute([$id]);
            
            // Get approved comments related to this article
            $stmt = $pdo->prepare("SELECT * FROM comments WHERE articleTitle = ? AND status = 'approvato' ORDER BY id ASC");
            $stmt->execute([$art['title']]);
            $comments = $stmt->fetchAll();

            echo json_encode([
                'status' => 'success',
                'article' => $art,
                'comments' => $comments
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Articolo non trovato']);
        }
        break;

    // 20. Public Comment Submission
    case 'add_comment':
        $data = json_decode(file_get_contents('php://input'), true);
        $articleTitle = isset($data['articleTitle']) ? trim($data['articleTitle']) : '';
        $author = isset($data['author']) ? trim($data['author']) : '';
        $text = isset($data['text']) ? trim($data['text']) : '';

        if (empty($articleTitle) || empty($author) || empty($text)) {
            echo json_encode(['status' => 'error', 'message' => 'Tutti i campi sono obbligatori']);
            exit;
        }

        $dateStr = date('d/m/Y');
        $stmt = $pdo->prepare("INSERT INTO comments (articleTitle, author, text, date, status) VALUES (?, ?, ?, ?, 'in_attesa')");
        $stmt->execute([$articleTitle, $author, $text, $dateStr]);

        // Inserimento notifica
        $stmtNoti = $pdo->prepare("INSERT INTO notifications (type, title, message) VALUES ('comment', ?, ?)");
        $stmtNoti->execute(['Nuovo commento da moderare', "Autore: $author per l'articolo \"$articleTitle\""]);

        echo json_encode(['status' => 'success']);
        break;

    // 21. Get settings
    case 'get_settings':
        $settings = $pdo->query("SELECT * FROM settings WHERE id = 1")->fetch();
        echo json_encode(['status' => 'success', 'settings' => $settings]);
        break;

    // 22. Save settings
    case 'save_settings':
        $data = json_decode(file_get_contents('php://input'), true);
        $siteName = isset($data['siteName']) ? trim($data['siteName']) : '';
        $siteDesc = isset($data['siteDesc']) ? trim($data['siteDesc']) : '';
        $author = isset($data['author']) ? $data['author'] : 'Admin';

        $stmt = $pdo->prepare("UPDATE settings SET siteName = ?, siteDesc = ? WHERE id = 1");
        $stmt->execute([$siteName, $siteDesc]);

        logAudit($pdo, $author, 'ha modificato le impostazioni generali del', 'sito');
        echo json_encode(['status' => 'success']);
        break;

    // 23. Export entire database to JSON
    case 'export_db':
        $dbData = [
            'articles' => $pdo->query("SELECT * FROM articles")->fetchAll(),
            'comments' => $pdo->query("SELECT * FROM comments")->fetchAll(),
            'messages' => $pdo->query("SELECT * FROM messages")->fetchAll(),
            'categories' => $pdo->query("SELECT * FROM categories")->fetchAll(),
            'media' => $pdo->query("SELECT * FROM media")->fetchAll(),
            'logs' => $pdo->query("SELECT * FROM audit_logs")->fetchAll(),
            'settings' => $pdo->query("SELECT * FROM settings WHERE id = 1")->fetch()
        ];
        echo json_encode(['status' => 'success', 'backup' => $dbData]);
        break;

    // 24. Import JSON database backup
    case 'import_db':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            echo json_encode(['status' => 'error', 'message' => 'JSON non valido']);
            exit;
        }

        try {
            $pdo->beginTransaction();

            // Clear tables
            $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
            $pdo->exec("TRUNCATE TABLE articles;");
            $pdo->exec("TRUNCATE TABLE comments;");
            $pdo->exec("TRUNCATE TABLE messages;");
            $pdo->exec("TRUNCATE TABLE categories;");
            $pdo->exec("TRUNCATE TABLE media;");
            $pdo->exec("TRUNCATE TABLE audit_logs;");
            $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");

            // Import Articles
            if (isset($data['articles'])) {
                foreach ($data['articles'] as $art) {
                    $stmt = $pdo->prepare("INSERT INTO articles (id, title, category, rating, image, excerpt, content, date, status, tags, keyword, slug, metaDesc, views, comments, author) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$art['id'], $art['title'], $art['category'], $art['rating'], $art['image'], $art['excerpt'], $art['content'], $art['date'], $art['status'], $art['tags'], $art['keyword'], $art['slug'], $art['metaDesc'], $art['views'], $art['comments'], $art['author']]);
                }
            }

            // Import Comments
            if (isset($data['comments'])) {
                foreach ($data['comments'] as $comm) {
                    $stmt = $pdo->prepare("INSERT INTO comments (id, articleTitle, author, text, date, status) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$comm['id'], $comm['articleTitle'], $comm['author'], $comm['text'], $comm['date'], $comm['status']]);
                }
            }

            // Import Messages
            if (isset($data['messages'])) {
                foreach ($data['messages'] as $msg) {
                    $stmt = $pdo->prepare("INSERT INTO messages (id, sender, email, subject, excerpt, text, date, folder, unread, starred) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$msg['id'], $msg['sender'], $msg['email'], $msg['subject'], $msg['excerpt'], $msg['text'], $msg['date'], $msg['folder'], $msg['unread'], $msg['starred']]);
                }
            }

            // Import Categories
            if (isset($data['categories'])) {
                foreach ($data['categories'] as $cat) {
                    $stmt = $pdo->prepare("INSERT INTO categories (id, name, slug, color, desc) VALUES (?, ?, ?, ?, ?)");
                    $stmt->execute([$cat['id'], $cat['name'], $cat['slug'], $cat['color'], $cat['desc']]);
                }
            }

            // Import Media
            if (isset($data['media'])) {
                foreach ($data['media'] as $item) {
                    $stmt = $pdo->prepare("INSERT INTO media (id, url, name) VALUES (?, ?, ?)");
                    $stmt->execute([$item['id'], $item['url'], $item['name']]);
                }
            }

            // Import Logs
            if (isset($data['logs'])) {
                foreach ($data['logs'] as $log) {
                    $stmt = $pdo->prepare("INSERT INTO audit_logs (id, user, action, target, time) VALUES (?, ?, ?, ?, ?)");
                    $stmt->execute([$log['id'], $log['user'], $log['action'], $log['target'], $log['time']]);
                }
            }

            // Import Settings
            if (isset($data['settings'])) {
                $set = $data['settings'];
                $stmt = $pdo->prepare("UPDATE settings SET siteName = ?, siteDesc = ? WHERE id = 1");
                $stmt->execute([$set['siteName'], $set['siteDesc']]);
            }

            $pdo->commit();
            echo json_encode(['status' => 'success']);
        } catch (\Exception $e) {
            $pdo->rollBack();
            echo json_encode(['status' => 'error', 'message' => 'Errore transazione: ' . $e->getMessage()]);
        }
        break;

    // 25. Users/Authors listing (with exact published articles count from DB)
    case 'get_users':
        $stmtUsers = $pdo->query("
            SELECT u.id, u.username, u.name, u.role, u.avatar, u.bio, u.profile_image,
                   (SELECT COUNT(*) FROM articles a WHERE LOWER(TRIM(a.author)) = LOWER(TRIM(u.name)) AND a.status = 'pubblicato') as published_articles_count
            FROM users u
            ORDER BY u.name ASC
        ");
        $users = $stmtUsers->fetchAll();
        echo json_encode(['status' => 'success', 'users' => $users]);
        break;


    // 26. Save User/Author
    case 'save_user':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($data['id']) ? $data['id'] : null;
        $username = isset($data['username']) ? trim($data['username']) : '';
        $password = isset($data['password']) ? trim($data['password']) : '';
        $name = isset($data['name']) ? trim($data['name']) : '';
        $role = isset($data['role']) ? trim($data['role']) : 'Author';
        $avatar = isset($data['avatar']) ? trim($data['avatar']) : '';
        $bio = isset($data['bio']) ? trim($data['bio']) : null;
        $profile_image = isset($data['profile_image']) ? trim($data['profile_image']) : null;
        $author = isset($data['author']) ? $data['author'] : 'Admin';

        if (empty($username) || empty($name)) {
            echo json_encode(['status' => 'error', 'message' => 'Username e Nome sono obbligatori']);
            exit;
        }

        if ($id) {
            // Update
            if (!empty($password)) {
                $stmt = $pdo->prepare("UPDATE users SET username = ?, password = ?, name = ?, role = ?, avatar = ?, bio = ?, profile_image = ? WHERE id = ?");
                $stmt->execute([$username, $password, $name, $role, $avatar, $bio, $profile_image, $id]);
            } else {
                $stmt = $pdo->prepare("UPDATE users SET username = ?, name = ?, role = ?, avatar = ?, bio = ?, profile_image = ? WHERE id = ?");
                $stmt->execute([$username, $name, $role, $avatar, $bio, $profile_image, $id]);
            }
            logAudit($pdo, $author, 'ha modificato l\'autore', $name);
        } else {
            // Insert
            if (empty($password)) {
                $password = 'password123';
            }
            $stmt = $pdo->prepare("INSERT INTO users (username, password, name, role, avatar, bio, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$username, $password, $name, $role, $avatar, $bio, $profile_image]);
            logAudit($pdo, $author, 'ha creato l\'autore', $name);
        }
        echo json_encode(['status' => 'success']);
        break;

    // 27. Delete User/Author
    case 'delete_user':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $id = isset($data['id']) ? $data['id'] : null;
            $author = isset($data['author']) ? $data['author'] : 'Admin';

            if ($id) {
                $stmt = $pdo->prepare("SELECT name FROM users WHERE id = ?");
                $stmt->execute([$id]);
                $name = $stmt->fetchColumn();

                $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
                $stmt->execute([$id]);

                logAudit($pdo, $author, 'ha eliminato l\'autore', $name);
                echo json_encode(['status' => 'success']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'ID non valido']);
            }
        } catch (Exception $e) {
            echo json_encode(['status' => 'error', 'message' => 'Errore del database: ' . $e->getMessage()]);
        }
        break;

    // 28. Upload file/image (Cover or WYSIWYG Content)
    case 'upload_file':
        if (!isset($_FILES['file'])) {
            echo json_encode(['status' => 'error', 'message' => 'Nessun file ricevuto dal server']);
            exit;
        }

        $file = $_FILES['file'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            echo json_encode(['status' => 'error', 'message' => 'Errore nel caricamento del file (codice ' . $file['error'] . ')']);
            exit;
        }

        $uploadDir = __DIR__ . '/../uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $filename = basename($file['name']);
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'mp4', 'webm', 'ogg', 'mov', 'm4v'];

        if (!in_array($extension, $allowedExtensions)) {
            echo json_encode(['status' => 'error', 'message' => 'Estensione file non consentita (.' . $extension . ')']);
            exit;
        }

        // Genera un nome file univoco e sicuro
        $safeName = preg_replace('/[^a-zA-Z0-9_-]/', '_', pathinfo($filename, PATHINFO_FILENAME));
        $uniqueFilename = time() . '_' . substr(md5(uniqid(rand(), true)), 0, 8) . '_' . $safeName . '.' . $extension;
        $targetPath = $uploadDir . $uniqueFilename;

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            $publicUrl = 'uploads/' . $uniqueFilename;

            // Salva anche nella tabella media se presente per la libreria
            try {
                $stmtMedia = $pdo->prepare("INSERT INTO media (url, name, size, type) VALUES (?, ?, ?, ?)");
                $stmtMedia->execute([$publicUrl, $filename, $file['size'], in_array($extension, ['mp4', 'webm', 'ogg', 'mov', 'm4v']) ? 'video' : 'image']);
            } catch (Exception $e) {}

            echo json_encode([
                'status' => 'success',
                'url' => $publicUrl,
                'filename' => $uniqueFilename
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Impossibile salvare il file nella cartella uploads/']);
        }
        break;

    // 29. Get notifications list
    case 'get_notifications':
        $stmt = $pdo->query("SELECT * FROM notifications ORDER BY id DESC LIMIT 15");
        $notifications = $stmt->fetchAll();
        
        $unread_count = $pdo->query("SELECT COUNT(*) FROM notifications WHERE is_read = 0")->fetchColumn();
        
        echo json_encode([
            'status' => 'success',
            'notifications' => $notifications,
            'unread_count' => (int)$unread_count
        ]);
        break;

    // 30. Mark notifications as read
    case 'mark_notifications_read':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($data['id']) ? $data['id'] : null;
        
        if ($id) {
            $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE id = ?");
            $stmt->execute([$id]);
        } else {
            $pdo->query("UPDATE notifications SET is_read = 1");
        }
        echo json_encode(['status' => 'success']);
        break;
    // 31. Get all rankings (Admin / Public)
    case 'get_rankings':
        $type = isset($_GET['type']) ? $_GET['type'] : 'all';
        $status = isset($_GET['status']) ? $_GET['status'] : 'all';
        
        $sql = "SELECT r.*, COUNT(ri.id) as items_count FROM rankings r LEFT JOIN ranking_items ri ON r.id = ri.ranking_id";
        $where = [];
        $params = [];
        
        if ($type !== 'all') {
            $where[] = "r.type = ?";
            $params[] = $type;
        }
        if ($status !== 'all') {
            $where[] = "r.status = ?";
            $params[] = $status;
        }
        if (!empty($where)) {
            $sql .= " WHERE " . implode(" AND ", $where);
        }
        $sql .= " GROUP BY r.id ORDER BY r.id DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rankings = $stmt->fetchAll();
        
        echo json_encode(['status' => 'success', 'rankings' => $rankings]);
        break;

    // 32. Get ranking detail with its ordered items (Public 3D scene & Admin editor)
    case 'get_ranking_detail':
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        $type = isset($_GET['type']) ? $_GET['type'] : '';
        
        if ($id > 0) {
            $stmt = $pdo->prepare("SELECT * FROM rankings WHERE id = ?");
            $stmt->execute([$id]);
            $ranking = $stmt->fetch();
        } else {
            // Prendi la più recente pubblicata (opzionalmente per tipo)
            if (!empty($type) && $type !== 'all') {
                $stmt = $pdo->prepare("SELECT * FROM rankings WHERE status = 'pubblicata' AND type = ? ORDER BY id DESC LIMIT 1");
                $stmt->execute([$type]);
            } else {
                $stmt = $pdo->query("SELECT * FROM rankings WHERE status = 'pubblicata' ORDER BY id DESC LIMIT 1");
            }
            $ranking = $stmt->fetch();
        }
        
        if ($ranking) {
            $itemsStmt = $pdo->prepare("SELECT * FROM ranking_items WHERE ranking_id = ? ORDER BY position ASC, id ASC");
            $itemsStmt->execute([$ranking['id']]);
            $items = $itemsStmt->fetchAll();
            
            echo json_encode([
                'status' => 'success',
                'ranking' => $ranking,
                'items' => $items
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Nessuna classifica trovata', 'ranking' => null, 'items' => []]);
        }
        break;

    // 33. Save / Create / Update Ranking with Items (Admin)
    case 'save_ranking':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || empty($data['title'])) {
            echo json_encode(['status' => 'error', 'message' => 'Titolo della classifica obbligatorio']);
            exit;
        }

        $id = isset($data['id']) ? (int)$data['id'] : 0;
        $title = trim($data['title']);
        $type = isset($data['type']) ? $data['type'] : 'film';
        $period = isset($data['period']) ? $data['period'] : 'settimanale';
        $status = isset($data['status']) ? $data['status'] : 'pubblicata';
        $startDate = isset($data['start_date']) ? $data['start_date'] : null;
        $endDate = isset($data['end_date']) ? $data['end_date'] : null;
        $author = isset($data['author']) ? $data['author'] : 'Admin';
        $items = isset($data['items']) && is_array($data['items']) ? $data['items'] : [];

        try {
            $pdo->beginTransaction();

            if ($id > 0) {
                $stmt = $pdo->prepare("UPDATE rankings SET title = ?, type = ?, period = ?, status = ?, start_date = ?, end_date = ? WHERE id = ?");
                $stmt->execute([$title, $type, $period, $status, $startDate, $endDate, $id]);
                logAudit($pdo, $author, 'ha modificato la classifica', $title);
            } else {
                $stmt = $pdo->prepare("INSERT INTO rankings (title, type, period, status, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$title, $type, $period, $status, $startDate, $endDate]);
                $id = $pdo->lastInsertId();
                logAudit($pdo, $author, 'ha creato la classifica', $title);
            }

            // Cancella i vecchi item e reinserisce in ordine
            $delStmt = $pdo->prepare("DELETE FROM ranking_items WHERE ranking_id = ?");
            $delStmt->execute([$id]);

            $insertItem = $pdo->prepare("INSERT INTO ranking_items (ranking_id, movie_id, title, year, genre, rating, image, description, position, previous_position, movement, badge, link_url, reviews_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

            $pos = 1;
            foreach ($items as $item) {
                $itemTitle = isset($item['title']) ? trim($item['title']) : 'Senza Titolo';
                $year = isset($item['year']) ? trim($item['year']) : '';
                $genre = isset($item['genre']) ? trim($item['genre']) : '';
                $rating = isset($item['rating']) ? trim($item['rating']) : '';
                $image = isset($item['image']) ? trim($item['image']) : '';
                $desc = isset($item['description']) ? trim($item['description']) : '';
                $position = isset($item['position']) && (int)$item['position'] > 0 ? (int)$item['position'] : $pos;
                $prevPos = isset($item['previous_position']) && $item['previous_position'] !== '' ? (int)$item['previous_position'] : null;
                
                // Calcola movement
                $movement = 'same';
                if ($prevPos !== null) {
                    if ($position < $prevPos) {
                        $movement = 'up';
                    } elseif ($position > $prevPos) {
                        $movement = 'down';
                    } else {
                        $movement = 'same';
                    }
                }
                if (isset($item['movement']) && in_array($item['movement'], ['up', 'down', 'same', 'new'])) {
                    $movement = $item['movement'];
                }

                $badge = isset($item['badge']) ? trim($item['badge']) : '';
                $linkUrl = isset($item['link_url']) ? trim($item['link_url']) : '';
                $reviewsCount = isset($item['reviews_count']) ? trim($item['reviews_count']) : null;
                $movieId = isset($item['movie_id']) && (int)$item['movie_id'] > 0 ? (int)$item['movie_id'] : null;

                $insertItem->execute([
                    $id,
                    $movieId,
                    $itemTitle,
                    $year,
                    $genre,
                    $rating,
                    $image,
                    $desc,
                    $position,
                    $prevPos,
                    $movement,
                    $badge,
                    $linkUrl,
                    $reviewsCount
                ]);
                $pos++;
            }

            $pdo->commit();
            echo json_encode(['status' => 'success', 'id' => $id]);
        } catch (Exception $e) {
            $pdo->rollBack();
            echo json_encode(['status' => 'error', 'message' => 'Errore nel salvataggio: ' . $e->getMessage()]);
        }
        break;

    // 34. Delete Ranking (Admin)
    case 'delete_ranking':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = isset($data['id']) ? (int)$data['id'] : 0;
        $author = isset($data['author']) ? $data['author'] : 'Admin';

        if ($id > 0) {
            $stmtTitle = $pdo->prepare("SELECT title FROM rankings WHERE id = ?");
            $stmtTitle->execute([$id]);
            $title = $stmtTitle->fetchColumn();

            $stmt = $pdo->prepare("DELETE FROM rankings WHERE id = ?");
            $stmt->execute([$id]);
            logAudit($pdo, $author, 'ha eliminato la classifica', $title ? $title : "ID #$id");
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'ID non valido']);
        }
        break;

    default:
        echo json_encode(['status' => 'error', 'message' => 'Azione non supportata']);
}
