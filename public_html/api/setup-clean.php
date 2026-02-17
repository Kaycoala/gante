<?php
// ============================================
// GANTE — Limpar Banco: Zerar Produtos e Categorias
// ============================================
//
// Execute este script para LIMPAR todos os produtos e categorias do banco.
// As tabelas de configuracao (gelato_sizes, chocolate_boxes, toppings) sao MANTIDAS.
//
// Acesse: https://ganteartesanal.com.br/api/setup-clean.php?token=gante2026clean

require_once __DIR__ . '/db.php';

// Protecao por token
$token = $_GET['token'] ?? '';
if ($token !== 'gante2026clean') {
    jsonError('Token invalido. Acesso negado.', 403);
}

$db = getDB();
$results = [];

try {
    // Limpar produtos
    $stmt = $db->query('SELECT COUNT(*) FROM products');
    $countProducts = $stmt->fetchColumn();
    $db->exec('DELETE FROM products');
    $db->exec('ALTER TABLE products AUTO_INCREMENT = 1');
    $results[] = "$countProducts produtos removidos. AUTO_INCREMENT resetado.";

    // Limpar categorias
    $stmt = $db->query('SELECT COUNT(*) FROM categories');
    $countCategories = $stmt->fetchColumn();
    $db->exec('DELETE FROM categories');
    $db->exec('ALTER TABLE categories AUTO_INCREMENT = 1');
    $results[] = "$countCategories categorias removidas. AUTO_INCREMENT resetado.";

    // Confirmar que extras permanecem intactos
    $sizesCount = $db->query('SELECT COUNT(*) FROM gelato_sizes')->fetchColumn();
    $boxesCount = $db->query('SELECT COUNT(*) FROM chocolate_boxes')->fetchColumn();
    $toppingsCount = $db->query('SELECT COUNT(*) FROM toppings')->fetchColumn();
    $results[] = "Extras preservados: $sizesCount tamanhos, $boxesCount caixas, $toppingsCount coberturas.";

    jsonResponse([
        'success' => true,
        'message' => 'Banco limpo com sucesso! Pronto para receber novos produtos.',
        'details' => $results,
    ]);

} catch (PDOException $e) {
    jsonError('Erro ao limpar banco: ' . $e->getMessage(), 500);
}
