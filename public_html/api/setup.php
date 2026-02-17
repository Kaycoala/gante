<?php
// ============================================
// GANTE — Setup: Criar Tabelas e Seed de Dados
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

    $db->exec('DELETE FROM products');
    $db->exec('DELETE FROM categories');
    $db->exec('DELETE FROM gelato_sizes');
    $db->exec('DELETE FROM chocolate_boxes');
    $db->exec('DELETE FROM toppings');
    $db->exec('ALTER TABLE products AUTO_INCREMENT = 1');
    $db->exec('ALTER TABLE categories AUTO_INCREMENT = 1');
    $results[] = 'Dados antigos removidos (re-execucao segura).';

    // ========== SEED: CATEGORIAS ==========

    $catStmt = $db->prepare('INSERT INTO categories (name, type) VALUES (:name, :type)');

    $gelatoCats = [
        ['name' => 'Classicos Italianos', 'type' => 'gelato'],
        ['name' => 'Especiais da Casa',   'type' => 'gelato'],
        ['name' => 'Edicao Limitada',     'type' => 'gelato'],
    ];

    $chocoCats = [
        ['name' => 'Trufas & Bombons',    'type' => 'chocolate'],
        ['name' => 'Barras Artesanais',    'type' => 'chocolate'],
        ['name' => 'Drageas & Especiais',  'type' => 'chocolate'],
        ['name' => 'Sazonais',             'type' => 'chocolate'],
    ];

    foreach (array_merge($gelatoCats, $chocoCats) as $cat) {
        $catStmt->execute($cat);
    }
    $results[] = '7 categorias inseridas.';

    // Mapear IDs de categorias para uso nos produtos
    // Precisamos mapear os nomes das categorias para os slug IDs usados no frontend
    $catMap = [];
    $rows = $db->query('SELECT id, name, type FROM categories')->fetchAll();
    foreach ($rows as $r) {
        // Criar o slug a partir do nome para mapeamento
        $catMap[$r['type'] . ':' . $r['name']] = $r['id'];
    }

    // Mapeamento de slug antigo -> nome da categoria
    $slugToName = [
        'classicos' => 'Classicos Italianos',
        'especiais' => 'Especiais da Casa',
        'limitada'  => 'Edicao Limitada',
        'trufas'    => 'Trufas & Bombons',
        'barras'    => 'Barras Artesanais',
        'drageas'   => 'Drageas & Especiais',
        'sazonais'  => 'Sazonais',
    ];

    // ========== SEED: PRODUCTS (GELATOS) ==========

    $prodStmt = $db->prepare('
        INSERT INTO products (name, description, price, category, type, image_url)
        VALUES (:name, :description, :price, :category, :type, :image_url)
    ');

    $gelatos = [
        ['Stracciatella',      'Cremoso gelato de baunilha com lascas finas de chocolate amargo italiano.',                          16.00, 'classicos'],
        ['Pistacchio',         'Pistache siciliano torrado, intenso e aveludado, receita tradicional de Bronte.',                    18.00, 'classicos'],
        ['Fior di Latte',      'A pureza do leite fresco em sua forma mais elegante, suave e delicado.',                             14.00, 'classicos'],
        ['Cioccolato Fondente','Chocolate belga 70% cacau, intenso e encorpado, para verdadeiros apreciadores.',                     16.00, 'classicos'],
        ['Nocciola',           'Avela piemontesa tostada, sabor profundo e textura irresistivelmente cremosa.',                      18.00, 'classicos'],
        ['Limone',             'Sorbetto refrescante de limao siciliano, acidez equilibrada e aroma vibrante.',                      14.00, 'classicos'],
        ['Amarena',            'Gelato de creme com cerejas amarena italianas e calda artesanal.',                                   16.00, 'classicos'],
        ['Doce de Leite com Nozes', 'Doce de leite argentino cremoso com nozes pecas caramelizadas.',                                18.00, 'especiais'],
        ['Acai com Granola',   'Acai do Para com granola crocante e mel organico, sabor brasileiro.',                                20.00, 'especiais'],
        ['Brigadeiro',         'O classico brasileiro em gelato: chocolate ao leite, cacau e granulado.',                            18.00, 'especiais'],
        ['Maracuja',           'Sorbetto tropical de maracuja, intenso, cremoso e refrescante.',                                     16.00, 'especiais'],
        ['Cafe Espresso',      'Cafe especial brasileiro em gelato, notas de caramelo e torra media.',                               16.00, 'especiais'],
        ['Coco Queimado',      'Coco fresco tostado com notas de caramelo, textura rica e tropical.',                                16.00, 'especiais'],
        ['Panettone',          'Sabor natalino com frutas cristalizadas, baunilha e gotas de chocolate.',                            22.00, 'limitada'],
        ['Tiramisu',           'Mascarpone, cafe espresso, biscoito champagne e cacau, a sobremesa italiana.',                       22.00, 'limitada'],
        ['Frutas Vermelhas',   'Mix de morango, framboesa e mirtilo com coulis artesanal.',                                          20.00, 'limitada'],
        ['Pistache com Framboesa', 'Combinacao ousada de pistache tostado com coulis de framboesa fresca.',                          24.00, 'limitada'],
    ];

    foreach ($gelatos as $g) {
        $catName = $slugToName[$g[3]] ?? $g[3];
        $catId = $catMap['gelato:' . $catName] ?? null;
        $prodStmt->execute([
            ':name'        => $g[0],
            ':description' => $g[1],
            ':price'       => $g[2],
            ':category'    => $catId,
            ':type'        => 'gelato',
            ':image_url'   => '',
        ]);
    }
    $results[] = count($gelatos) . ' gelatos inseridos.';

    // ========== SEED: PRODUCTS (CHOCOLATES) ==========

    $chocolates = [
        ['Trufa de Champagne',       'Ganache de champagne frances envolta em chocolate belga 54%.',                         8.50, 'trufas'],
        ['Bombom de Pistache',       'Recheio cremoso de pistache siciliano em casca de chocolate ao leite.',                9.00, 'trufas'],
        ['Trufa de Maracuja',        'Ganache de maracuja fresco com chocolate branco e toque de pimenta rosa.',             8.50, 'trufas'],
        ['Bombom de Avela',          'Avela piemontesa inteira coberta com praline e chocolate amargo.',                     9.50, 'trufas'],
        ['Trufa de Cafe',            'Ganache de cafe especial com cobertura de cacau em po holandes.',                      8.00, 'trufas'],
        ['Bombom de Caramelo Salgado','Caramelo com flor de sal em chocolate ao leite 45% cacau.',                           9.00, 'trufas'],
        ['Barra 70% Cacau Origem',   'Chocolate single-origin da Bahia, notas frutadas e torra suave. 80g.',               28.00, 'barras'],
        ['Barra ao Leite com Caramelo','Chocolate ao leite 45% com camada de caramelo crocante. 80g.',                      26.00, 'barras'],
        ['Barra Branca com Matcha',  'Chocolate branco premium com matcha japones ceremonial. 80g.',                        30.00, 'barras'],
        ['Barra Ruby',               'Chocolate ruby com notas naturais de frutas vermelhas. 80g.',                         32.00, 'barras'],
        ['Barra Amargo com Laranja', 'Chocolate 60% com raspas de laranja cristalizadas e especiarias. 80g.',               28.00, 'barras'],
        ['Drageas de Amendoa',       'Amendoas torradas cobertas com chocolate ao leite belga. 150g.',                      22.00, 'drageas'],
        ['Drageas de Damasco',       'Damascos turcos cobertos com chocolate amargo. 150g.',                                24.00, 'drageas'],
        ['Nibs de Cacau Caramelizado','Nibs de cacau da Bahia caramelizados com acucar demerara. 100g.',                    18.00, 'drageas'],
        ['Mix Nuts Chocolate',       'Selecao de castanhas nobres cobertas com chocolate 54%. 200g.',                       35.00, 'drageas'],
        ['Ovo de Pascoa Classico',   'Chocolate ao leite 45% com recheio de ganache trufado. 250g.',                        65.00, 'sazonais'],
        ['Caixa Natalina',           'Selecao especial de 12 bombons sortidos em caixa presenteavel.',                      78.00, 'sazonais'],
        ['Coracao de Chocolate',     'Coracao de chocolate ruby com recheio de frutas vermelhas. 180g.',                    45.00, 'sazonais'],
    ];

    foreach ($chocolates as $c) {
        $catName = $slugToName[$c[3]] ?? $c[3];
        $catId = $catMap['chocolate:' . $catName] ?? null;
        $prodStmt->execute([
            ':name'        => $c[0],
            ':description' => $c[1],
            ':price'       => $c[2],
            ':category'    => $catId,
            ':type'        => 'chocolate',
            ':image_url'   => '',
        ]);
    }
    $results[] = count($chocolates) . ' chocolates inseridos.';

    // ========== SEED: PRODUCTS (DIVERSOS) ==========

    $diversos = [
        ['Casquinha Simples',  'Casquinha crocante para acompanhar seu gelato.',            3.00],
        ['Casquinha Coberta',  'Casquinha com cobertura de chocolate belga.',                5.00],
        ['Agua Mineral',       'Agua mineral sem gas 500ml.',                                4.00],
        ['Agua com Gas',       'Agua mineral com gas 500ml.',                                5.00],
        ['Suco Natural',       'Suco natural da fruta do dia 300ml.',                       10.00],
        ['Cafe Espresso',      'Cafe espresso curto ou longo.',                              6.00],
        ['Cappuccino',         'Cappuccino italiano com espuma cremosa.',                   10.00],
        ['Milkshake',          'Milkshake cremoso com o sabor de gelato da sua escolha.',   18.00],
        ['Affogato',           'Gelato de fior di latte com shot de cafe espresso.',        16.00],
        ['Brownie',            'Brownie artesanal de chocolate belga.',                     12.00],
    ];

    foreach ($diversos as $d) {
        $prodStmt->execute([
            ':name'        => $d[0],
            ':description' => $d[1],
            ':price'       => $d[2],
            ':category'    => null,
            ':type'        => 'diversos',
            ':image_url'   => '',
        ]);
    }
    $results[] = count($diversos) . ' diversos inseridos.';

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
