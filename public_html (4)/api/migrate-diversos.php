<?php
// ============================================
// GANTE — Migracao: Adicionar 'diversos' ao ENUM de categories
// ============================================
//
// Execute este script para corrigir a tabela categories
// e permitir categorias do tipo 'diversos' (Cafeteria).
//
// Acesse: https://seudominio.com/api/migrate-diversos.php?token=gante2026setup
//
// Este script NAO apaga dados existentes. Apenas altera a coluna.

require_once __DIR__ . '/db.php';

// Protecao simples por token
$token = $_GET['token'] ?? '';
if ($token !== 'gante2026setup') {
    jsonError('Token invalido. Acesso negado.', 403);
}

$db = getDB();
$results = [];

try {
    // Alterar o ENUM da coluna type para incluir 'diversos'
    $db->exec("ALTER TABLE categories MODIFY COLUMN type ENUM('gelato', 'chocolate', 'diversos') NOT NULL");
    $results[] = 'Coluna "type" da tabela categories atualizada: agora aceita "gelato", "chocolate" e "diversos".';

    // Verificar se a alteracao foi aplicada
    $stmt = $db->query("SHOW COLUMNS FROM categories WHERE Field = 'type'");
    $column = $stmt->fetch();
    $results[] = 'Tipo atual da coluna: ' . ($column['Type'] ?? 'desconhecido');

    jsonResponse([
        'success' => true,
        'message' => 'Migracao concluida com sucesso! Agora voce pode adicionar categorias para Cafeteria (diversos).',
        'details' => $results,
    ]);

} catch (PDOException $e) {
    jsonError('Erro na migracao: ' . $e->getMessage(), 500);
}
