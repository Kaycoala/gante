<?php
// ============================================
// GANTE — API de Categorias (CRUD)
// ============================================

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet();
        break;
    case 'POST':
        handlePost();
        break;
    case 'PUT':
        handlePut();
        break;
    case 'DELETE':
        handleDelete();
        break;
    default:
        jsonError('Metodo nao permitido.', 405);
}

// ---- GET: Listar categorias por tipo ----
function handleGet() {
    $db = getDB();

    if (empty($_GET['type'])) {
        jsonError('Parametro "type" e obrigatorio (gelato, chocolate, diversos).');
        return;
    }

    $stmt = $db->prepare('SELECT * FROM categories WHERE type = :type ORDER BY created_at ASC');
    $stmt->execute([':type' => $_GET['type']]);
    jsonResponse($stmt->fetchAll());
}

// ---- POST: Criar categoria ----
function handlePost() {
    $db = getDB();
    $body = getRequestBody();

    if (empty($body['name']) || empty($body['type'])) {
        jsonError('Campos "name" e "type" sao obrigatorios.');
        return;
    }

    $stmt = $db->prepare('INSERT INTO categories (name, type) VALUES (:name, :type)');
    $stmt->execute([
        ':name' => $body['name'],
        ':type' => $body['type'],
    ]);

    $id = $db->lastInsertId();

    $stmt = $db->prepare('SELECT * FROM categories WHERE id = :id');
    $stmt->execute([':id' => $id]);
    jsonResponse($stmt->fetch(), 201);
}

// ---- PUT: Atualizar categoria ----
function handlePut() {
    $db = getDB();
    $body = getRequestBody();

    if (empty($body['id'])) {
        jsonError('Campo "id" e obrigatorio para atualizar.');
        return;
    }

    if (empty($body['name'])) {
        jsonError('Campo "name" e obrigatorio.');
        return;
    }

    $stmt = $db->prepare('UPDATE categories SET name = :name WHERE id = :id');
    $stmt->execute([
        ':name' => $body['name'],
        ':id'   => $body['id'],
    ]);

    $stmt = $db->prepare('SELECT * FROM categories WHERE id = :id');
    $stmt->execute([':id' => $body['id']]);
    $row = $stmt->fetch();

    if ($row) {
        jsonResponse($row);
    } else {
        jsonError('Categoria nao encontrada.', 404);
    }
}

// ---- DELETE: Deletar categoria ----
function handleDelete() {
    $db = getDB();

    if (empty($_GET['id'])) {
        jsonError('Parametro "id" e obrigatorio para deletar.');
        return;
    }

    $stmt = $db->prepare('DELETE FROM categories WHERE id = :id');
    $stmt->execute([':id' => $_GET['id']]);

    if ($stmt->rowCount() > 0) {
        jsonResponse(['success' => true, 'message' => 'Categoria deletada.']);
    } else {
        jsonError('Categoria nao encontrada.', 404);
    }
}
