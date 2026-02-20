<?php
// ============================================
// GANTE ORLANDIA — API de Extras (Tamanhos, Caixas, Toppings, Sabores do Dia)
// ============================================

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    handleGet();
} elseif ($method === 'POST') {
    handlePost();
} else {
    jsonError('Apenas GET e POST sao permitidos.', 405);
}

function handleGet() {
    $table = $_GET['table'] ?? '';

    $prefix = TABLE_PREFIX;

    $allowed = [
        'gelato_sizes'    => "SELECT * FROM {$prefix}gelato_sizes ORDER BY price ASC",
        'chocolate_boxes' => "SELECT * FROM {$prefix}chocolate_boxes ORDER BY units ASC",
        'toppings'        => "SELECT * FROM {$prefix}toppings ORDER BY name ASC",
    ];

    if ($table === 'flavors_of_the_day') {
        $db = getDB();
        $prodTable = $prefix . 'products';
        $fodTable = $prefix . 'flavors_of_the_day';
        try {
            $stmt = $db->query("
                SELECT p.* FROM $prodTable p
                INNER JOIN $fodTable f ON p.id = f.product_id
                WHERE p.type = 'gelato'
                ORDER BY p.name ASC
            ");
            jsonResponse($stmt->fetchAll());
        } catch (Exception $e) {
            jsonResponse([]);
        }
        return;
    }

    if (!isset($allowed[$table])) {
        jsonError('Parametro "table" invalido. Use: gelato_sizes, chocolate_boxes, toppings, flavors_of_the_day.');
    }

    $db = getDB();
    $stmt = $db->query($allowed[$table]);
    jsonResponse($stmt->fetchAll());
}

function handlePost() {
    $body = getRequestBody();
    $table = $body['table'] ?? '';
    $prefix = TABLE_PREFIX;

    if ($table === 'flavors_of_the_day') {
        $db = getDB();
        $fodTable = $prefix . 'flavors_of_the_day';
        $productIds = $body['product_ids'] ?? [];

        $db->exec("
            CREATE TABLE IF NOT EXISTS $fodTable (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_product (product_id)
            )
        ");

        $db->exec("DELETE FROM $fodTable");

        if (!empty($productIds)) {
            $stmt = $db->prepare("INSERT INTO $fodTable (product_id) VALUES (:pid)");
            foreach ($productIds as $pid) {
                $stmt->execute([':pid' => $pid]);
            }
        }

        jsonResponse(['success' => true, 'count' => count($productIds)]);
        return;
    }

    jsonError('Operacao POST nao suportada para esta tabela.');
}
