<?php
// ============================================
// GANTE — API de Upload de Imagens
// ============================================

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Responder preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Diretorio de upload (relativo a raiz do site)
$uploadDir = __DIR__ . '/../images/produtos/';

// Criar diretorio se nao existir
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Extensoes permitidas
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
$maxFileSize = 5 * 1024 * 1024; // 5MB

function jsonResponse($data, $code = 200) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function jsonError($message, $code = 400) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($code);
    echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

// Gerar nome unico para o arquivo
function generateUniqueFilename($originalName) {
    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    $baseName = pathinfo($originalName, PATHINFO_FILENAME);
    
    // Sanitizar nome do arquivo
    $baseName = preg_replace('/[^a-zA-Z0-9_-]/', '-', $baseName);
    $baseName = strtolower(trim($baseName, '-'));
    
    // Adicionar timestamp para garantir unicidade
    $timestamp = time();
    $randomSuffix = substr(md5(uniqid()), 0, 6);
    
    return "{$baseName}-{$timestamp}-{$randomSuffix}.{$extension}";
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        handleUpload();
        break;
    case 'GET':
        handleList();
        break;
    case 'DELETE':
        handleDelete();
        break;
    default:
        jsonError('Metodo nao permitido.', 405);
}

// POST: Upload de imagem
function handleUpload() {
    global $uploadDir, $allowedExtensions, $maxFileSize;
    
    // Verificar se arquivo foi enviado
    if (!isset($_FILES['image']) || $_FILES['image']['error'] === UPLOAD_ERR_NO_FILE) {
        jsonError('Nenhum arquivo enviado.');
    }
    
    $file = $_FILES['image'];
    
    // Verificar erros de upload
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE   => 'Arquivo muito grande (limite do servidor).',
            UPLOAD_ERR_FORM_SIZE  => 'Arquivo muito grande (limite do formulario).',
            UPLOAD_ERR_PARTIAL    => 'Upload incompleto.',
            UPLOAD_ERR_NO_TMP_DIR => 'Pasta temporaria nao encontrada.',
            UPLOAD_ERR_CANT_WRITE => 'Falha ao gravar arquivo.',
            UPLOAD_ERR_EXTENSION  => 'Extensao bloqueada pelo servidor.',
        ];
        $msg = $errorMessages[$file['error']] ?? 'Erro desconhecido no upload.';
        jsonError($msg);
    }
    
    // Verificar tamanho
    if ($file['size'] > $maxFileSize) {
        jsonError('Arquivo muito grande. Maximo: 5MB.');
    }
    
    // Verificar extensao
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, $allowedExtensions)) {
        jsonError('Tipo de arquivo nao permitido. Use: ' . implode(', ', $allowedExtensions));
    }
    
    // Verificar se e realmente uma imagem
    $imageInfo = getimagesize($file['tmp_name']);
    if ($imageInfo === false) {
        jsonError('Arquivo nao e uma imagem valida.');
    }
    
    // Gerar nome unico
    $newFilename = generateUniqueFilename($file['name']);
    $destination = $uploadDir . $newFilename;
    
    // Mover arquivo
    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        jsonError('Falha ao salvar arquivo. Verifique permissoes da pasta.');
    }
    
    // Retornar sucesso com caminho relativo (para filial Orlandia)
    jsonResponse([
        'success' => true,
        'filename' => $newFilename,
        'path' => 'images/produtos/' . $newFilename,
        'url' => 'https://ganteartesanal.com.br/orlandia/images/produtos/' . $newFilename,
        'size' => $file['size'],
        'type' => $imageInfo['mime'],
    ], 201);
}

// GET: Listar imagens existentes
function handleList() {
    global $uploadDir, $allowedExtensions;
    
    if (!is_dir($uploadDir)) {
        jsonResponse([]);
    }
    
    $files = [];
    $iterator = new DirectoryIterator($uploadDir);
    
    foreach ($iterator as $fileInfo) {
        if ($fileInfo->isDot() || $fileInfo->isDir()) continue;
        
        $extension = strtolower($fileInfo->getExtension());
        if (!in_array($extension, $allowedExtensions)) continue;
        
        $files[] = [
            'filename' => $fileInfo->getFilename(),
            'path' => 'images/produtos/' . $fileInfo->getFilename(),
            'url' => 'https://ganteartesanal.com.br/orlandia/images/produtos/' . $fileInfo->getFilename(),
            'size' => $fileInfo->getSize(),
            'modified' => $fileInfo->getMTime(),
        ];
    }
    
    // Ordenar por data de modificacao (mais recentes primeiro)
    usort($files, function($a, $b) {
        return $b['modified'] - $a['modified'];
    });
    
    jsonResponse($files);
}

// DELETE: Remover imagem
function handleDelete() {
    global $uploadDir;
    
    if (empty($_GET['filename'])) {
        jsonError('Parametro "filename" e obrigatorio.');
    }
    
    $filename = basename($_GET['filename']); // Seguranca: apenas nome do arquivo
    $filepath = $uploadDir . $filename;
    
    if (!file_exists($filepath)) {
        jsonError('Arquivo nao encontrado.', 404);
    }
    
    if (!unlink($filepath)) {
        jsonError('Falha ao remover arquivo.');
    }
    
    jsonResponse([
        'success' => true,
        'message' => 'Imagem removida com sucesso.',
    ]);
}
