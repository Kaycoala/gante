<?php
// ============================================
// GANTE — Diagnostico Completo (Banco + Imagens)
// ============================================
// Acesse: https://ganteartesanal.com.br/api/test-images.php
//
// Testa:
// 1. Conexao com o banco MySQL
// 2. Leitura de produtos, categorias, extras
// 3. Escrita no banco (INSERT + DELETE de teste)
// 4. Imagens: arquivos existem no servidor?
// 5. Imagens: URL absoluta acessivel?

require_once __DIR__ . '/db.php';

// Desabilitar o JSON header para exibir HTML
header('Content-Type: text/html; charset=utf-8');

$baseDir = realpath(__DIR__ . '/..');
$baseUrl = 'https://ganteartesanal.com.br';

$tests = [];

function addTest($name, $ok, $detail = '') {
    global $tests;
    $tests[] = ['name' => $name, 'ok' => $ok, 'detail' => $detail];
}

// ---- 1. Conexao ----
$db = null;
try {
    $db = getDB();
    addTest('Conexao com MySQL', true, 'PDO conectou com sucesso ao banco u668423313_gante');
} catch (Exception $e) {
    addTest('Conexao com MySQL', false, 'Erro: ' . $e->getMessage());
}

// ---- 2. Tabela products existe? ----
if ($db) {
    try {
        $stmt = $db->query("SHOW TABLES LIKE 'products'");
        $exists = $stmt->fetch();
        addTest('Tabela "products" existe', (bool)$exists, $exists ? 'OK' : 'Tabela NAO encontrada!');
    } catch (Exception $e) {
        addTest('Tabela "products" existe', false, 'Erro: ' . $e->getMessage());
    }
}

// ---- 3. Tabela categories existe? ----
if ($db) {
    try {
        $stmt = $db->query("SHOW TABLES LIKE 'categories'");
        $exists = $stmt->fetch();
        addTest('Tabela "categories" existe', (bool)$exists, $exists ? 'OK' : 'Tabela NAO encontrada!');
    } catch (Exception $e) {
        addTest('Tabela "categories" existe', false, 'Erro: ' . $e->getMessage());
    }
}

// ---- 4. Leitura de produtos ----
$products = [];
if ($db) {
    try {
        $stmt = $db->query('SELECT * FROM products ORDER BY type, name');
        $products = $stmt->fetchAll();
        addTest('Leitura de produtos', true, count($products) . ' produtos encontrados');
    } catch (Exception $e) {
        addTest('Leitura de produtos', false, 'Erro: ' . $e->getMessage());
    }
}

// ---- 5. Leitura de categorias ----
$categories = [];
if ($db) {
    try {
        $stmt = $db->query('SELECT * FROM categories ORDER BY type, name');
        $categories = $stmt->fetchAll();
        addTest('Leitura de categorias', true, count($categories) . ' categorias encontradas');
    } catch (Exception $e) {
        addTest('Leitura de categorias', false, 'Erro: ' . $e->getMessage());
    }
}

// ---- 6. Extras: gelato_sizes ----
if ($db) {
    try {
        $stmt = $db->query("SHOW TABLES LIKE 'gelato_sizes'");
        $exists = $stmt->fetch();
        if ($exists) {
            $stmt2 = $db->query('SELECT * FROM gelato_sizes');
            $rows = $stmt2->fetchAll();
            addTest('Tabela "gelato_sizes"', true, count($rows) . ' tamanhos');
        } else {
            addTest('Tabela "gelato_sizes"', false, 'Tabela NAO existe');
        }
    } catch (Exception $e) {
        addTest('Tabela "gelato_sizes"', false, 'Erro: ' . $e->getMessage());
    }
}

// ---- 7. Extras: toppings ----
if ($db) {
    try {
        $stmt = $db->query("SHOW TABLES LIKE 'toppings'");
        $exists = $stmt->fetch();
        if ($exists) {
            $stmt2 = $db->query('SELECT * FROM toppings');
            $rows = $stmt2->fetchAll();
            addTest('Tabela "toppings"', true, count($rows) . ' coberturas');
        } else {
            addTest('Tabela "toppings"', false, 'Tabela NAO existe');
        }
    } catch (Exception $e) {
        addTest('Tabela "toppings"', false, 'Erro: ' . $e->getMessage());
    }
}

// ---- 8. Extras: chocolate_boxes ----
if ($db) {
    try {
        $stmt = $db->query("SHOW TABLES LIKE 'chocolate_boxes'");
        $exists = $stmt->fetch();
        if ($exists) {
            $stmt2 = $db->query('SELECT * FROM chocolate_boxes');
            $rows = $stmt2->fetchAll();
            addTest('Tabela "chocolate_boxes"', true, count($rows) . ' caixas');
        } else {
            addTest('Tabela "chocolate_boxes"', false, 'Tabela NAO existe');
        }
    } catch (Exception $e) {
        addTest('Tabela "chocolate_boxes"', false, 'Erro: ' . $e->getMessage());
    }
}

// ---- 9. TESTE DE ESCRITA: Insert + Delete ----
$writeOk = false;
if ($db) {
    try {
        $db->beginTransaction();

        $stmt = $db->prepare("INSERT INTO products (name, description, price, category, type, image_url) VALUES (:name, :desc, :price, :cat, :type, :img)");
        $stmt->execute([
            ':name' => '__TESTE_ESCRITA__',
            ':desc' => 'Produto de teste - sera deletado imediatamente',
            ':price' => 0.01,
            ':cat' => null,
            ':type' => 'gelato',
            ':img' => '',
        ]);
        $testId = $db->lastInsertId();

        // Verificar se inseriu
        $stmt2 = $db->prepare('SELECT * FROM products WHERE id = :id');
        $stmt2->execute([':id' => $testId]);
        $testRow = $stmt2->fetch();

        if ($testRow && $testRow['name'] === '__TESTE_ESCRITA__') {
            $writeOk = true;
        }

        // Reverter (nao salvar o teste)
        $db->rollBack();

        addTest('Escrita no banco (INSERT)', $writeOk, $writeOk ? 'Insert + Select OK. Rollback feito (nada salvo).' : 'Insert executou mas dado nao foi encontrado.');
    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        addTest('Escrita no banco (INSERT)', false, 'Erro: ' . $e->getMessage());
    }
}

// ---- 10. Teste API via HTTP (simula o que o JS faz) ----
$apiUrl = $baseUrl . '/api/extras.php?table=gelato_sizes';
$apiOk = false;
$apiDetail = '';
try {
    $ctx = stream_context_create([
        'http' => [
            'timeout' => 5,
            'header' => "Accept: application/json\r\n",
        ]
    ]);
    $apiResp = @file_get_contents($apiUrl, false, $ctx);
    if ($apiResp !== false) {
        $decoded = json_decode($apiResp, true);
        if (is_array($decoded)) {
            $apiOk = true;
            $apiDetail = 'Retornou JSON valido com ' . count($decoded) . ' itens';
        } else {
            $apiDetail = 'Retornou resposta nao-JSON: ' . substr($apiResp, 0, 200);
        }
    } else {
        $apiDetail = 'file_get_contents retornou false. Possivel erro de rede/DNS.';
    }
} catch (Exception $e) {
    $apiDetail = 'Erro: ' . $e->getMessage();
}
addTest('API HTTP (como o JS chama)', $apiOk, $apiDetail);

// ---- Imagens ----
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

addTest('Pasta /images/produtos/ existe', is_dir($imgDir), is_dir($imgDir) ? (count($filesInDir) . ' arquivos encontrados') : 'Pasta NAO encontrada em: ' . $imgDir);

// Montar dados de imagens dos produtos
$imgResults = [];
$withImage = 0;
$imageOk = 0;
$imageMissing = 0;
$usedFiles = [];

foreach ($products as $p) {
    if (empty($p['image_url'])) continue;
    $withImage++;
    $relativePath = ltrim($p['image_url'], '/');
    $fullPath = $baseDir . '/' . $relativePath;
    $absoluteUrl = $baseUrl . '/' . $relativePath;
    $exists = file_exists($fullPath);
    if ($exists) $imageOk++; else $imageMissing++;
    $usedFiles[] = basename($p['image_url']);
    $imgResults[] = [
        'id' => $p['id'],
        'name' => $p['name'],
        'type' => $p['type'],
        'image_url' => $p['image_url'],
        'full_path' => $fullPath,
        'absolute_url' => $absoluteUrl,
        'exists' => $exists,
    ];
}

$orphanFiles = array_diff($filesInDir, $usedFiles);

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gante - Diagnostico Completo</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f0eb; color: #0f3b2e; padding: 20px; max-width: 1200px; margin: 0 auto; }
    h1 { margin-bottom: 4px; }
    .subtitle { color: #666; margin-bottom: 24px; font-size: 0.9rem; }
    .section { background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .section h2 { margin-bottom: 16px; font-size: 1.1rem; border-bottom: 2px solid #e8d9c5; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #eee; vertical-align: top; }
    th { background: #f8f5f0; font-weight: 600; }
    .ok { color: #16a34a; font-weight: 600; }
    .fail { color: #dc2626; font-weight: 600; }
    .warn { color: #d97706; font-weight: 600; }
    .img-preview { width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid #ddd; }
    .img-placeholder { width: 50px; height: 50px; border-radius: 6px; background: #f0e6d8; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; color: #999; text-align: center; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
    .badge-gelato { background: #dbeafe; color: #1d4ed8; }
    .badge-chocolate { background: #fef3c7; color: #92400e; }
    .badge-diversos { background: #e0e7ff; color: #4338ca; }
    code { font-size: 0.75rem; background: rgba(232,217,197,0.5); padding: 1px 6px; border-radius: 3px; word-break: break-all; }
    .summary { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
    .summary-card { background: white; border-radius: 12px; padding: 14px 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); min-width: 130px; }
    .summary-card .num { font-size: 1.8rem; font-weight: 700; }
    .summary-card .label { font-size: 0.75rem; color: #666; }
  </style>
</head>
<body>
  <h1>Gante - Diagnostico Completo</h1>
  <p class="subtitle">Testado em: <?= date('d/m/Y H:i:s') ?></p>

  <!-- Resumo -->
  <div class="summary">
    <div class="summary-card">
      <div class="num"><?= count($products) ?></div>
      <div class="label">Produtos</div>
    </div>
    <div class="summary-card">
      <div class="num"><?= count($categories) ?></div>
      <div class="label">Categorias</div>
    </div>
    <div class="summary-card">
      <div class="num"><?= $withImage ?></div>
      <div class="label">Com imagem</div>
    </div>
    <div class="summary-card">
      <div class="num <?= $imageOk > 0 ? 'ok' : '' ?>"><?= $imageOk ?></div>
      <div class="label">Imagens OK</div>
    </div>
    <div class="summary-card">
      <div class="num <?= $imageMissing > 0 ? 'fail' : '' ?>"><?= $imageMissing ?></div>
      <div class="label">Imagens faltando</div>
    </div>
  </div>

  <!-- Testes do sistema -->
  <div class="section">
    <h2>Testes do Sistema</h2>
    <table>
      <thead>
        <tr><th>Teste</th><th>Status</th><th>Detalhe</th></tr>
      </thead>
      <tbody>
        <?php foreach ($tests as $t): ?>
        <tr>
          <td><strong><?= htmlspecialchars($t['name']) ?></strong></td>
          <td class="<?= $t['ok'] ? 'ok' : 'fail' ?>"><?= $t['ok'] ? 'OK' : 'FALHOU' ?></td>
          <td><small><?= htmlspecialchars($t['detail']) ?></small></td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>

  <!-- Produtos no banco -->
  <div class="section">
    <h2>Produtos no Banco (<?= count($products) ?>)</h2>
    <table>
      <thead>
        <tr><th>ID</th><th>Nome</th><th>Tipo</th><th>Preco</th><th>Categoria</th><th>image_url</th></tr>
      </thead>
      <tbody>
        <?php foreach ($products as $p): ?>
        <tr>
          <td><?= $p['id'] ?></td>
          <td><strong><?= htmlspecialchars($p['name']) ?></strong></td>
          <td><span class="badge badge-<?= $p['type'] ?>"><?= $p['type'] ?></span></td>
          <td>R$ <?= number_format($p['price'], 2, ',', '.') ?></td>
          <td><?= $p['category'] ?: '<span class="warn">null</span>' ?></td>
          <td><code><?= htmlspecialchars($p['image_url'] ?: '(vazio)') ?></code></td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>

  <!-- Imagens: detalhe -->
  <?php if (count($imgResults) > 0): ?>
  <div class="section">
    <h2>Imagens dos Produtos</h2>
    <table>
      <thead>
        <tr><th>Preview</th><th>Produto</th><th>image_url (banco)</th><th>Arquivo no servidor</th><th>URL Absoluta</th></tr>
      </thead>
      <tbody>
        <?php foreach ($imgResults as $r): ?>
        <tr>
          <td>
            <?php if ($r['exists']): ?>
              <img class="img-preview" src="<?= htmlspecialchars($r['absolute_url']) ?>?t=<?= time() ?>" alt="">
            <?php else: ?>
              <div class="img-placeholder">404</div>
            <?php endif; ?>
          </td>
          <td><strong><?= htmlspecialchars($r['name']) ?></strong><br><span class="badge badge-<?= $r['type'] ?>"><?= $r['type'] ?></span></td>
          <td><code><?= htmlspecialchars($r['image_url']) ?></code></td>
          <td class="<?= $r['exists'] ? 'ok' : 'fail' ?>"><?= $r['exists'] ? 'Existe' : 'NAO ENCONTRADO' ?><br><small style="color:#999;"><?= htmlspecialchars($r['full_path']) ?></small></td>
          <td><a href="<?= htmlspecialchars($r['absolute_url']) ?>?t=<?= time() ?>" target="_blank" style="font-size:0.75rem;">Abrir</a></td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
  <?php endif; ?>

  <!-- Arquivos na pasta -->
  <div class="section">
    <h2>Arquivos em /images/produtos/ (<?= count($filesInDir) ?>)</h2>
    <?php if (empty($filesInDir)): ?>
      <p class="warn">Pasta vazia ou nao encontrada em: <?= htmlspecialchars($imgDir) ?></p>
    <?php else: ?>
      <table>
        <thead><tr><th>Arquivo</th><th>Status</th></tr></thead>
        <tbody>
          <?php foreach ($filesInDir as $f): ?>
          <tr>
            <td><code><?= htmlspecialchars($f) ?></code></td>
            <td>
              <?php if (in_array($f, $usedFiles)): ?>
                <span class="ok">Usado por produto</span>
              <?php else: ?>
                <span class="warn">Orfao (nao associado a nenhum produto)</span>
              <?php endif; ?>
            </td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    <?php endif; ?>
  </div>

  <!-- Categorias -->
  <div class="section">
    <h2>Categorias no Banco (<?= count($categories) ?>)</h2>
    <table>
      <thead><tr><th>ID</th><th>Nome</th><th>Tipo</th></tr></thead>
      <tbody>
        <?php foreach ($categories as $c): ?>
        <tr>
          <td><?= $c['id'] ?></td>
          <td><strong><?= htmlspecialchars($c['name']) ?></strong></td>
          <td><span class="badge badge-<?= $c['type'] ?>"><?= $c['type'] ?></span></td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>

</body>
</html>
