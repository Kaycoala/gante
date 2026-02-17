<?php
// ============================================
// GANTE — Diagnostico da API
// ============================================
// Acesse: https://seudominio.com/api/test.php
// Este arquivo testa a conexao com o banco e lista os dados.
// REMOVA apos confirmar que tudo funciona.

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$results = [];
$results['php_version'] = phpversion();
$results['timestamp'] = date('Y-m-d H:i:s');

// Testar conexao com o banco
try {
    require_once __DIR__ . '/db.php';
    $db = getDB();
    $results['db_connection'] = 'OK';

    // Verificar se as tabelas existem
    $tables = ['products', 'categories', 'gelato_sizes', 'chocolate_boxes', 'toppings'];
    foreach ($tables as $table) {
        try {
            $count = $db->query("SELECT COUNT(*) FROM $table")->fetchColumn();
            $results['tables'][$table] = [
                'exists' => true,
                'count' => (int)$count
            ];
        } catch (PDOException $e) {
            $results['tables'][$table] = [
                'exists' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    // Amostra de dados
    try {
        $stmt = $db->query('SELECT id, name, type, category FROM products LIMIT 5');
        $results['sample_products'] = $stmt->fetchAll();
    } catch (PDOException $e) {
        $results['sample_products_error'] = $e->getMessage();
    }

    try {
        $stmt = $db->query('SELECT id, name, type FROM categories');
        $results['all_categories'] = $stmt->fetchAll();
    } catch (PDOException $e) {
        $results['categories_error'] = $e->getMessage();
    }

    // Testar os endpoints da API
    $results['endpoints'] = [
        'products' => file_exists(__DIR__ . '/products.php') ? 'EXISTS' : 'MISSING',
        'categories' => file_exists(__DIR__ . '/categories.php') ? 'EXISTS' : 'MISSING',
        'extras' => file_exists(__DIR__ . '/extras.php') ? 'EXISTS' : 'MISSING',
        'db' => file_exists(__DIR__ . '/db.php') ? 'EXISTS' : 'MISSING',
    ];

} catch (Exception $e) {
    $results['db_connection'] = 'FAILED';
    $results['db_error'] = $e->getMessage();
}

echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
