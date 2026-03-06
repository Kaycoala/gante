<?php
// ============================================
// GANTE — API de Extras (Tamanhos, Caixas, Toppings, Sabores do Dia)
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

    $allowed = [
        'gelato_sizes'    => 'SELECT * FROM gelato_sizes ORDER BY price ASC',
        'chocolate_boxes' => 'SELECT * FROM chocolate_boxes ORDER BY units ASC',
        'toppings'        => 'SELECT * FROM toppings ORDER BY name ASC',
    ];

    // Special case: flavors of the day
    if ($table === 'flavors_of_the_day') {
        $db = getDB();
        // Check if the table exists
        try {
            $stmt = $db->query("
                SELECT p.* FROM products p
                INNER JOIN flavors_of_the_day f ON p.id = f.product_id
                WHERE p.type = 'gelato'
                ORDER BY p.name ASC
            ");
            jsonResponse($stmt->fetchAll());
        } catch (Exception $e) {
            // Table might not exist yet, return empty
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

    if ($table === 'flavors_of_the_day') {
        $db = getDB();
        $productIds = $body['product_ids'] ?? [];

        // Create table if not exists
        $db->exec("
            CREATE TABLE IF NOT EXISTS flavors_of_the_day (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_product (product_id)
            )
        ");

        // Clear existing and insert new
        $db->exec("DELETE FROM flavors_of_the_day");

        if (!empty($productIds)) {
            $stmt = $db->prepare("INSERT INTO flavors_of_the_day (product_id) VALUES (:pid)");
            foreach ($productIds as $pid) {
                $stmt->execute([':pid' => $pid]);
            }
        }

        jsonResponse(['success' => true, 'count' => count($productIds)]);
        return;
    }

    jsonError('Operacao POST nao suportada para esta tabela.');
}
