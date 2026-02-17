<?php
// ============================================
// GANTE — Teste de Imagens dos Produtos
// ============================================
// Acesse: https://ganteartesanal.com.br/api/test-images.php
//
// Este script verifica:
// 1. Conexao com o banco de dados
// 2. Todos os produtos e suas image_url
// 3. Se os arquivos de imagem existem no servidor
// 4. Se as URLs sao acessiveis

require_once __DIR__ . '/db.php';

// Desabilitar o JSON header para exibir HTML
header('Content-Type: text/html; charset=utf-8');

$baseDir = realpath(__DIR__ . '/..');
$baseUrl = 'https://ganteartesanal.com.br';

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gante - Teste de Imagens</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f0eb; color: #0f3b2e; padding: 20px; }
    h1 { margin-bottom: 8px; }
    .subtitle { color: #666; margin-bottom: 24px; font-size: 0.9rem; }
    .section { background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .section h2 { margin-bottom: 16px; font-size: 1.1rem; border-bottom: 2px solid #e8d9c5; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #eee; }
    th { background: #f8f5f0; font-weight: 600; }
    .status-ok { color: #16a34a; font-weight: 600; }
    .status-error { color: #dc2626; font-weight: 600; }
    .status-warn { color: #d97706; font-weight: 600; }
    .img-preview { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd; }
    .img-placeholder { width: 60px; height: 60px; border-radius: 8px; background: #f0e6d8; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: #999; }
    .summary { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
    .summary-card { background: white; border-radius: 12px; padding: 16px 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); min-width: 150px; }
    .summary-card .num { font-size: 2rem; font-weight: 700; }
    .summary-card .label { font-size: 0.8rem; color: #666; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
    .badge-gelato { background: #dbeafe; color: #1d4ed8; }
    .badge-chocolate { background: #fef3c7; color: #92400e; }
    .badge-diversos { background: #e0e7ff; color: #4338ca; }
    .dir-listing { font-family: monospace; font-size: 0.8rem; background: #f8f5f0; padding: 12px; border-radius: 8px; max-height: 300px; overflow-y: auto; }
    .dir-listing div { padding: 2px 0; }
    .dir-file-img { color: #16a34a; }
    .dir-file-other { color: #666; }
  </style>
</head>
<body>
  <h1>Gante - Teste de Imagens</h1>
  <p class="subtitle">Diagnostico completo de imagens dos produtos no banco e no servidor.</p>

<?php

// ---- 1. Testar conexao com o banco ----
try {
    $db = getDB();
    $dbOk = true;
} catch (Exception $e) {
    $dbOk = false;
    echo '<div class="section"><h2>Conexao com o Banco</h2><p class="status-error">ERRO: Nao foi possivel conectar ao banco de dados.</p></div>';
    echo '</body></html>';
    exit;
}

// ---- 2. Buscar todos os produtos ----
$stmt = $db->query('SELECT id, name, type, image_url, price FROM products ORDER BY type, name');
$products = $stmt->fetchAll();

$totalProducts = count($products);
$withImage = 0;
$withoutImage = 0;
$imageExists = 0;
$imageMissing = 0;

$results = [];

foreach ($products as $p) {
    $row = [
        'id' => $p['id'],
        'name' => $p['name'],
        'type' => $p['type'],
        'price' => $p['price'],
        'image_url' => $p['image_url'],
        'has_url' => false,
        'file_exists' => false,
        'full_path' => '',
        'absolute_url' => '',
    ];

    if (!empty($p['image_url'])) {
        $row['has_url'] = true;
        $withImage++;

        // Montar path absoluto no servidor
        $relativePath = ltrim($p['image_url'], '/');
        $fullPath = $baseDir . '/' . $relativePath;
        $row['full_path'] = $fullPath;
        $row['absolute_url'] = $baseUrl . '/' . $relativePath;

        if (file_exists($fullPath)) {
            $row['file_exists'] = true;
            $imageExists++;
        } else {
            $imageMissing++;
        }
    } else {
        $withoutImage++;
    }

    $results[] = $row;
}

// ---- 3. Listar arquivos na pasta images/produtos/ ----
$imgDir = $baseDir . '/images/produtos';
$filesInDir = [];
if (is_dir($imgDir)) {
    $scan = scandir($imgDir);
    foreach ($scan as $f) {
        if ($f === '.' || $f === '..') continue;
        $filesInDir[] = $f;
    }
    sort($filesInDir);
}

// Encontrar arquivos orfaos (no disco mas nao no banco)
$usedFiles = [];
foreach ($results as $r) {
    if ($r['has_url']) {
        $usedFiles[] = basename($r['image_url']);
    }
}
$orphanFiles = array_diff($filesInDir, $usedFiles);

?>

<!-- Sumario -->
<div class="summary">
  <div class="summary-card">
    <div class="num status-ok"><?= $totalProducts ?></div>
    <div class="label">Produtos no banco</div>
  </div>
  <div class="summary-card">
    <div class="num" style="color:#1d4ed8;"><?= $withImage ?></div>
    <div class="label">Com image_url</div>
  </div>
  <div class="summary-card">
    <div class="num status-warn"><?= $withoutImage ?></div>
    <div class="label">Sem imagem</div>
  </div>
  <div class="summary-card">
    <div class="num status-ok"><?= $imageExists ?></div>
    <div class="label">Arquivos encontrados</div>
  </div>
  <div class="summary-card">
    <div class="num status-error"><?= $imageMissing ?></div>
    <div class="label">Arquivos faltando</div>
  </div>
  <div class="summary-card">
    <div class="num" style="color:#7c3aed;"><?= count($filesInDir) ?></div>
    <div class="label">Arquivos na pasta</div>
  </div>
  <div class="summary-card">
    <div class="num status-warn"><?= count($orphanFiles) ?></div>
    <div class="label">Orfaos (sem uso)</div>
  </div>
</div>

<!-- Conexao OK -->
<div class="section">
  <h2>Conexao com o Banco</h2>
  <p class="status-ok">OK - Conectado ao banco u668423313_gante</p>
</div>

<!-- Tabela de produtos -->
<div class="section">
  <h2>Produtos e Imagens</h2>
  <table>
    <thead>
      <tr>
        <th>Preview</th>
        <th>ID</th>
        <th>Nome</th>
        <th>Tipo</th>
        <th>image_url (banco)</th>
        <th>Arquivo</th>
        <th>URL Absoluta</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($results as $r): ?>
      <tr>
        <td>
          <?php if ($r['has_url'] && $r['file_exists']): ?>
            <img class="img-preview" src="<?= htmlspecialchars($r['absolute_url']) ?>" alt="<?= htmlspecialchars($r['name']) ?>">
          <?php elseif ($r['has_url']): ?>
            <div class="img-placeholder">404</div>
          <?php else: ?>
            <div class="img-placeholder">Sem URL</div>
          <?php endif; ?>
        </td>
        <td><?= $r['id'] ?></td>
        <td><strong><?= htmlspecialchars($r['name']) ?></strong></td>
        <td>
          <span class="badge badge-<?= $r['type'] ?>"><?= $r['type'] ?></span>
        </td>
        <td>
          <?php if ($r['has_url']): ?>
            <code style="font-size:0.75rem;"><?= htmlspecialchars($r['image_url']) ?></code>
          <?php else: ?>
            <span class="status-warn">(vazio)</span>
          <?php endif; ?>
        </td>
        <td>
          <?php if (!$r['has_url']): ?>
            <span class="status-warn">Sem URL</span>
          <?php elseif ($r['file_exists']): ?>
            <span class="status-ok">Existe</span>
          <?php else: ?>
            <span class="status-error">NAO ENCONTRADO</span>
            <br><small style="color:#999;font-size:0.7rem;"><?= htmlspecialchars($r['full_path']) ?></small>
          <?php endif; ?>
        </td>
        <td>
          <?php if ($r['has_url']): ?>
            <a href="<?= htmlspecialchars($r['absolute_url']) ?>" target="_blank" style="font-size:0.75rem; color:#1d4ed8;">
              Abrir
            </a>
          <?php endif; ?>
        </td>
      </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</div>

<!-- Arquivos na pasta -->
<div class="section">
  <h2>Arquivos em /images/produtos/ (<?= count($filesInDir) ?> arquivos)</h2>
  <?php if (empty($filesInDir)): ?>
    <p class="status-warn">Pasta vazia ou nao encontrada em: <?= htmlspecialchars($imgDir) ?></p>
  <?php else: ?>
    <div class="dir-listing">
      <?php foreach ($filesInDir as $f): ?>
        <?php
          $isUsed = in_array($f, $usedFiles);
          $isImage = preg_match('/\.(jpg|jpeg|png|gif|webp|svg)$/i', $f);
        ?>
        <div class="<?= $isImage ? 'dir-file-img' : 'dir-file-other' ?>">
          <?= htmlspecialchars($f) ?>
          <?php if (!$isUsed): ?>
            <span class="status-warn"> (orfao - nao usado por nenhum produto)</span>
          <?php endif; ?>
        </div>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
</div>

<!-- Teste de cache -->
<div class="section">
  <h2>Dicas de Cache</h2>
  <p style="font-size:0.85rem; line-height:1.6;">
    Se voce adicionou imagens via FTP/painel da Hostinger mas elas nao aparecem no celular:
  </p>
  <ul style="font-size:0.85rem; line-height:1.8; margin-top:8px; padding-left: 20px;">
    <li><strong>Cache do navegador:</strong> Limpe o cache do navegador no celular (Configuracoes > Limpar dados de navegacao).</li>
    <li><strong>Cache CDN/Hostinger:</strong> No painel da Hostinger, va em "Cache Manager" e limpe o cache.</li>
    <li><strong>Permissoes:</strong> Verifique se os arquivos de imagem tem permissao 644 (leitura publica).</li>
    <li><strong>Nome do arquivo:</strong> Use apenas letras minusculas, numeros, hifens e underscores. Sem acentos ou espacos.</li>
    <li><strong>Formato:</strong> Recomendado .jpg ou .webp para melhor compatibilidade.</li>
  </ul>
</div>

<div class="section">
  <h2>Timestamp</h2>
  <p style="font-size:0.85rem;">Teste executado em: <strong><?= date('d/m/Y H:i:s') ?></strong></p>
</div>

</body>
</html>
