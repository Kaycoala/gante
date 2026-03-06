<?php
// ============================================
// GANTE ORLANDIA — API de Produtos (CRUD)
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

// ---- GET: Listar produtos por tipo, ou buscar por ID ----
function handleGet() {
    $db = getDB();
    $table = TABLE_PREFIX . 'products';

    // Busca por ID unico
    if (!empty($_GET['id'])) {
        $stmt = $db->prepare("SELECT * FROM {$table} WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $_GET['id']]);
        $row = $stmt->fetch();
        if ($row) {
            jsonResponse($row);
        } else {
            jsonError('Produto nao encontrado.', 404);
        }
        return;
    }

    // Listagem por tipo
    if (empty($_GET['type'])) {
        jsonError('Parametro "type" e obrigatorio (gelato, chocolate, diversos).');
        return;
    }

    $type = $_GET['type'];

    // Filtro opcional por categoria
    if (!empty($_GET['category']) && $_GET['category'] !== 'todos') {
        $stmt = $db->prepare("SELECT * FROM {$table} WHERE type = :type AND category = :category ORDER BY created_at ASC");
        $stmt->execute([':type' => $type, ':category' => $_GET['category']]);
    } else {
        $stmt = $db->prepare("SELECT * FROM {$table} WHERE type = :type ORDER BY created_at ASC");
        $stmt->execute([':type' => $type]);
    }

    jsonResponse($stmt->fetchAll());
}

// ---- POST: Criar produto ----
function handlePost() {
    $db = getDB();
    $body = getRequestBody();
    $table = TABLE_PREFIX . 'products';

    if (empty($body['name']) || empty($body['type'])) {
        jsonError('Campos "name" e "type" sao obrigatorios.');
        return;
    }

    $stmt = $db->prepare("
        INSERT INTO {$table} (name, description, price, category, type, image_url)
        VALUES (:name, :description, :price, :category, :type, :image_url)
    ");

    $stmt->execute([
        ':name'        => $body['name'],
        ':description' => $body['description'] ?? '',
        ':price'       => $body['price'] ?? 0,
        ':category'    => $body['category'] ?? null,
        ':type'        => $body['type'],
        ':image_url'   => $body['image_url'] ?? '',
    ]);

    $id = $db->lastInsertId();

    $stmt = $db->prepare("SELECT * FROM {$table} WHERE id = :id");
    $stmt->execute([':id' => $id]);
    jsonResponse($stmt->fetch(), 201);
}

// ---- PUT: Atualizar produto ----
function handlePut() {
    $db = getDB();
    $body = getRequestBody();
    $table = TABLE_PREFIX . 'products';

    if (empty($body['id'])) {
        jsonError('Campo "id" e obrigatorio para atualizar.');
        return;
    }

    // Construir UPDATE dinamico (so campos presentes)
    $fields = [];
    $params = [':id' => $body['id']];

    $allowed = ['name', 'description', 'price', 'category', 'type', 'image_url'];
    foreach ($allowed as $field) {
        if (array_key_exists($field, $body)) {
            $fields[] = "$field = :$field";
            $params[":$field"] = $body[$field];
        }
    }

    if (empty($fields)) {
        jsonError('Nenhum campo para atualizar.');
        return;
    }

    $sql = "UPDATE {$table} SET " . implode(', ', $fields) . ' WHERE id = :id';
    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    // Retornar produto atualizado
    $stmt = $db->prepare("SELECT * FROM {$table} WHERE id = :id");
    $stmt->execute([':id' => $body['id']]);
    $row = $stmt->fetch();

    if ($row) {
        jsonResponse($row);
    } else {
        jsonError('Produto nao encontrado.', 404);
    }
}

// ---- DELETE: Deletar produto ----
function handleDelete() {
    $db = getDB();
    $table = TABLE_PREFIX . 'products';

    if (empty($_GET['id'])) {
        jsonError('Parametro "id" e obrigatorio para deletar.');
        return;
    }

    $stmt = $db->prepare("DELETE FROM {$table} WHERE id = :id");
    $stmt->execute([':id' => $_GET['id']]);

    if ($stmt->rowCount() > 0) {
        jsonResponse(['success' => true, 'message' => 'Produto deletado.']);
    } else {
        jsonError('Produto nao encontrado.', 404);
    }
}
