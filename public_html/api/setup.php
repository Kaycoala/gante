<?php
// ============================================
// GANTE — Setup: Criar Tabelas e Seed de Extras (Tamanhos, Caixas, Toppings)
// ============================================
//
// Execute este script UMA VEZ para configurar o banco.
// Acesse: https://seudominio.com/api/setup.php?token=gante2026setup
//
// Apos executar com sucesso, REMOVA ou renomeie este arquivo
// para evitar execucao acidental.

require_once __DIR__ . '/db.php';

// Protecao simples por token
$token = $_GET['token'] ?? '';
if ($token !== 'gante2026setup') {
    jsonError('Token invalido. Acesso negado.', 403);
}

$db = getDB();
$results = [];

try {
    // ========== CRIAR TABELAS ==========

    $db->exec("
        CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            type ENUM('gelato', 'chocolate') NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    $results[] = 'Tabela "categories" criada.';

    $db->exec("
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            category VARCHAR(100) DEFAULT NULL,
            type ENUM('gelato', 'chocolate', 'diversos') NOT NULL,
            image_url VARCHAR(500) DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    $results[] = 'Tabela "products" criada.';

    $db->exec("
        CREATE TABLE IF NOT EXISTS gelato_sizes (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            balls INT NOT NULL DEFAULT 1,
            price DECIMAL(10,2) NOT NULL DEFAULT 0.00
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    $results[] = 'Tabela "gelato_sizes" criada.';

    $db->exec("
        CREATE TABLE IF NOT EXISTS chocolate_boxes (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            units INT NOT NULL DEFAULT 1,
            price DECIMAL(10,2) NOT NULL DEFAULT 0.00
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    $results[] = 'Tabela "chocolate_boxes" criada.';

    $db->exec("
        CREATE TABLE IF NOT EXISTS toppings (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            price DECIMAL(10,2) NOT NULL DEFAULT 0.00
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    $results[] = 'Tabela "toppings" criada.';

    // ========== LIMPAR DADOS ANTIGOS (para re-execucao segura) ==========

    $db->exec('DELETE FROM gelato_sizes');
    $db->exec('DELETE FROM chocolate_boxes');
    $db->exec('DELETE FROM toppings');
    $results[] = 'Dados antigos de extras removidos (re-execucao segura).';

    // ========== SEED: GELATO SIZES ==========

    $sizeStmt = $db->prepare('INSERT INTO gelato_sizes (id, name, balls, price) VALUES (:id, :name, :balls, :price)');
    $sizes = [
        ['pequeno', 'Pequeno',     1, 10.00],
        ['medio',   'Medio',       2, 16.00],
        ['grande',  'Grande',      3, 22.00],
        ['240ml',   '240 Ml',      2, 14.00],
        ['500ml',   '500 Ml',      3, 22.00],
        ['600g',    '600 Gramas',  4, 28.00],
        ['1kg',     '1 Kg',        6, 45.00],
    ];
    foreach ($sizes as $s) {
        $sizeStmt->execute([':id' => $s[0], ':name' => $s[1], ':balls' => $s[2], ':price' => $s[3]]);
    }
    $results[] = count($sizes) . ' tamanhos de gelato inseridos.';

    // ========== SEED: CHOCOLATE BOXES ==========

    $boxStmt = $db->prepare('INSERT INTO chocolate_boxes (id, name, units, price) VALUES (:id, :name, :units, :price)');
    $boxes = [
        ['box6',  'Caixa Pequena', 6,  48.00],
        ['box12', 'Caixa Media',   12, 89.00],
        ['box24', 'Caixa Grande',  24, 165.00],
    ];
    foreach ($boxes as $b) {
        $boxStmt->execute([':id' => $b[0], ':name' => $b[1], ':units' => $b[2], ':price' => $b[3]]);
    }
    $results[] = count($boxes) . ' caixas de chocolate inseridas.';

    // ========== SEED: TOPPINGS ==========

    $topStmt = $db->prepare('INSERT INTO toppings (id, name, price) VALUES (:id, :name, :price)');
    $toppings = [
        ['t1', 'Calda de Chocolate',   3.00],
        ['t2', 'Calda de Caramelo',    3.00],
        ['t3', 'Frutas Frescas',       4.00],
        ['t4', 'Granola',              3.00],
        ['t5', 'Chantilly',            2.50],
        ['t6', 'Castanhas Trituradas', 4.00],
    ];
    foreach ($toppings as $t) {
        $topStmt->execute([':id' => $t[0], ':name' => $t[1], ':price' => $t[2]]);
    }
    $results[] = count($toppings) . ' coberturas inseridas.';

    // ========== RESULTADO ==========
    jsonResponse([
        'success' => true,
        'message' => 'Setup concluido com sucesso!',
        'details' => $results,
    ]);

} catch (PDOException $e) {
    jsonError('Erro no setup: ' . $e->getMessage(), 500);
}
