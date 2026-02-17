<?php
// ============================================
// GANTE — API de Extras (Tamanhos, Caixas, Toppings)
// ============================================

require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError('Apenas GET e permitido.', 405);
}

$table = $_GET['table'] ?? '';

$allowed = [
    'gelato_sizes'    => 'SELECT * FROM gelato_sizes ORDER BY price ASC',
    'chocolate_boxes' => 'SELECT * FROM chocolate_boxes ORDER BY units ASC',
    'toppings'        => 'SELECT * FROM toppings ORDER BY name ASC',
];

if (!isset($allowed[$table])) {
    jsonError('Parametro "table" invalido. Use: gelato_sizes, chocolate_boxes, toppings.');
}

$db = getDB();
$stmt = $db->query($allowed[$table]);
jsonResponse($stmt->fetchAll());
