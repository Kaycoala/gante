// ============================================
// GANTE — Catalogo de Produtos (Seed Data)
// ============================================
//
// COMO FUNCIONA:
// Este arquivo contem os dados seed dos produtos da loja.
// Os dados reais sao gerenciados exclusivamente pelo banco de dados
// via API PHP/MySQL. Este arquivo serve apenas como referencia
// e seed inicial.
//
// ESTRUTURA DE CADA PRODUTO:
// {
//   id:          String  - Identificador unico (ex: 'g1', 'c5', 'd3')
//   name:        String  - Nome do produto
//   description: String  - Descricao detalhada
//   price:       Number  - Preco unitario em reais (ex: 16.00)
//   category:    String  - ID da categoria (ex: 'classicos', 'trufas')
//   type:        String  - Tipo: 'gelato', 'chocolate' ou 'diversos'
//   imageUrl:    String  - Caminho da imagem (ex: 'images/produtos/pistacchio.jpg')
//                          Deixe '' para exibir placeholder com a inicial
// }
//
// Para adicionar/atualizar/remover produtos, use o painel admin
// que se comunica diretamente com o banco de dados.

// ========== NUMERO DO WHATSAPP PARA PEDIDOS ==========
// Substitua pelo numero da loja com codigo do pais (sem espacos, sem tracos)
// Exemplo Brasil: 5511999999999
const WHATSAPP_NUMBER = '5511999999999';

// ========== CATEGORIAS ==========

const GELATO_CATEGORIES = [
  { id: 'classicos', name: 'Classicos Italianos' },
  { id: 'especiais', name: 'Especiais da Casa' },
  { id: 'limitada',  name: 'Edicao Limitada' },
];

const CHOCOLATE_CATEGORIES = [
  { id: 'trufas',   name: 'Trufas & Bombons' },
  { id: 'barras',   name: 'Barras Artesanais' },
  { id: 'drageas',  name: 'Drageas & Especiais' },
  { id: 'sazonais', name: 'Sazonais' },
];

// ========== GELATOS ==========

const SEED_GELATOS = [
  // --- Classicos Italianos ---
  {
    id: 'g1',
    name: 'Stracciatella',
    description: 'Cremoso gelato de baunilha com lascas finas de chocolate amargo italiano.',
    price: 16.00,
    category: 'classicos',
    type: 'gelato',
    imageUrl: ''
  },
  {
    id: 'g2',
    name: 'Pistacchio',
    description: 'Pistache siciliano torrado, intenso e aveludado, receita tradicional de Bronte.',
    price: 18.00,
    category: 'classicos',
    type: 'gelato',
    imageUrl: ''
  },
  {
    id: 'g3',
    name: 'Fior di Latte',
    description: 'A pureza do leite fresco em sua forma mais elegante, suave e delicado.',
    price: 14.00,
    category: 'classicos',
    type: 'gelato',
    imageUrl: ''
  },
  {
    id: 'g4',
    name: 'Cioccolato Fondente',
    description: 'Chocolate belga 70% cacau, intenso e encorpado, para verdadeiros apreciadores.',
    price: 16.00,
    category: 'classicos',
    type: 'gelato',
    imageUrl: ''
  },
  {
    id: 'g5',
    name: 'Nocciola',
    description: 'Avela piemontesa tostada, sabor profundo e textura irresistivelmente cremosa.',
    price: 18.00,
    category: 'classicos',
    type: 'gelato',
    imageUrl: ''
  },
  {
    id: 'g6',
    name: 'Limone',
    description: 'Sorbetto refrescante de limao siciliano, acidez equilibrada e aroma vibrante.',
    price: 14.00,
    category: 'classicos',
    type: 'gelato',
    imageUrl: ''
  },
  {
    id: 'g7',
    name: 'Amarena',
    description: 'Gelato de creme com cerejas amarena italianas e calda artesanal.',
    price: 16.00,
    category: 'classicos',
    type: 'gelato',
    imageUrl: ''
  },

  // --- Especiais da Casa ---
  {
    id: 'g8',
    name: 'Doce de Leite com Nozes',
    description: 'Doce de leite argentino cremoso com nozes pecas caramelizadas.',
    price: 18.00,
    category: 'especiais',
    type: 'gelato',
    imageUrl: ''
  },
  {
    id: 'g9',
    name: 'Acai com Granola',
    description: 'Acai do Para com granola crocante e mel organico, sabor brasileiro.',
    price: 20.00,
    category: 'especiais',
    type: 'gelato',
    imageUrl: ''
  },
  {
    id: 'g10',
    name: 'Brigadeiro',
    description: 'O classico brasileiro em gelato: chocolate ao leite, cacau e granulado.',
    price: 18.00,
    category: 'especiais',
    type: 'gelato',
    imageUrl: ''
  },
  {
    id: 'g11',
    name: 'Maracuja',
    description: 'Sorbetto tropical de maracuja, intenso, cremoso e refrescante.',
    price: 16.00,
    category: 'especiais',
    type: 'gelato',
    imageUrl: ''
  },
  {
    id: 'g12',
    name: 'Cafe Espresso',
    description: 'Cafe especial brasileiro em gelato, notas de caramelo e torra media.',
    price: 16.00,
    category: 'especiais',
    type: 'gelato',
    imageUrl: ''
  },
  {
    id: 'g13',
    name: 'Coco Queimado',
    description: 'Coco fresco tostado com notas de caramelo, textura rica e tropical.',
    price: 16.00,
    category: 'especiais',
    type: 'gelato',
    imageUrl: ''
  },

  // --- Edicao Limitada ---
  {
    id: 'g14',
    name: 'Panettone',
    description: 'Sabor natalino com frutas cristalizadas, baunilha e gotas de chocolate.',
    price: 22.00,
    category: 'limitada',
    type: 'gelato',
    imageUrl: ''
  },
  {
    id: 'g15',
    name: 'Tiramisu',
    description: 'Mascarpone, cafe espresso, biscoito champagne e cacau, a sobremesa italiana.',
    price: 22.00,
    category: 'limitada',
    type: 'gelato',
    imageUrl: ''
  },
  {
    id: 'g16',
    name: 'Frutas Vermelhas',
    description: 'Mix de morango, framboesa e mirtilo com coulis artesanal.',
    price: 20.00,
    category: 'limitada',
    type: 'gelato',
    imageUrl: ''
  },
  {
    id: 'g17',
    name: 'Pistache com Framboesa',
    description: 'Combinacao ousada de pistache tostado com coulis de framboesa fresca.',
    price: 24.00,
    category: 'limitada',
    type: 'gelato',
    imageUrl: ''
  },
];

// ========== CHOCOLATES ==========

const SEED_CHOCOLATES = [
  // --- Trufas & Bombons ---
  {
    id: 'c1',
    name: 'Trufa de Champagne',
    description: 'Ganache de champagne frances envolta em chocolate belga 54%.',
    price: 8.50,
    category: 'trufas',
    type: 'chocolate',
    imageUrl: ''
  },
  {
    id: 'c2',
    name: 'Bombom de Pistache',
    description: 'Recheio cremoso de pistache siciliano em casca de chocolate ao leite.',
    price: 9.00,
    category: 'trufas',
    type: 'chocolate',
    imageUrl: ''
  },
  {
    id: 'c3',
    name: 'Trufa de Maracuja',
    description: 'Ganache de maracuja fresco com chocolate branco e toque de pimenta rosa.',
    price: 8.50,
    category: 'trufas',
    type: 'chocolate',
    imageUrl: ''
  },
  {
    id: 'c4',
    name: 'Bombom de Avela',
    description: 'Avela piemontesa inteira coberta com praline e chocolate amargo.',
    price: 9.50,
    category: 'trufas',
    type: 'chocolate',
    imageUrl: ''
  },
  {
    id: 'c5',
    name: 'Trufa de Cafe',
    description: 'Ganache de cafe especial com cobertura de cacau em po holandes.',
    price: 8.00,
    category: 'trufas',
    type: 'chocolate',
    imageUrl: ''
  },
  {
    id: 'c6',
    name: 'Bombom de Caramelo Salgado',
    description: 'Caramelo com flor de sal em chocolate ao leite 45% cacau.',
    price: 9.00,
    category: 'trufas',
    type: 'chocolate',
    imageUrl: ''
  },

  // --- Barras Artesanais ---
  {
    id: 'c7',
    name: 'Barra 70% Cacau Origem',
    description: 'Chocolate single-origin da Bahia, notas frutadas e torra suave. 80g.',
    price: 28.00,
    category: 'barras',
    type: 'chocolate',
    imageUrl: ''
  },
  {
    id: 'c8',
    name: 'Barra ao Leite com Caramelo',
    description: 'Chocolate ao leite 45% com camada de caramelo crocante. 80g.',
    price: 26.00,
    category: 'barras',
    type: 'chocolate',
    imageUrl: ''
  },
  {
    id: 'c9',
    name: 'Barra Branca com Matcha',
    description: 'Chocolate branco premium com matcha japones ceremonial. 80g.',
    price: 30.00,
    category: 'barras',
    type: 'chocolate',
    imageUrl: ''
  },
  {
    id: 'c10',
    name: 'Barra Ruby',
    description: 'Chocolate ruby com notas naturais de frutas vermelhas. 80g.',
    price: 32.00,
    category: 'barras',
    type: 'chocolate',
    imageUrl: ''
  },
  {
    id: 'c11',
    name: 'Barra Amargo com Laranja',
    description: 'Chocolate 60% com raspas de laranja cristalizadas e especiarias. 80g.',
    price: 28.00,
    category: 'barras',
    type: 'chocolate',
    imageUrl: ''
  },

  // --- Drageas & Especiais ---
  {
    id: 'c12',
    name: 'Drageas de Amendoa',
    description: 'Amendoas torradas cobertas com chocolate ao leite belga. 150g.',
    price: 22.00,
    category: 'drageas',
    type: 'chocolate',
    imageUrl: ''
  },
  {
    id: 'c13',
    name: 'Drageas de Damasco',
    description: 'Damascos turcos cobertos com chocolate amargo. 150g.',
    price: 24.00,
    category: 'drageas',
    type: 'chocolate',
    imageUrl: ''
  },
  {
    id: 'c14',
    name: 'Nibs de Cacau Caramelizado',
    description: 'Nibs de cacau da Bahia caramelizados com acucar demerara. 100g.',
    price: 18.00,
    category: 'drageas',
    type: 'chocolate',
    imageUrl: ''
  },
  {
    id: 'c15',
    name: 'Mix Nuts Chocolate',
    description: 'Selecao de castanhas nobres cobertas com chocolate 54%. 200g.',
    price: 35.00,
    category: 'drageas',
    type: 'chocolate',
    imageUrl: ''
  },

  // --- Sazonais ---
  {
    id: 'c16',
    name: 'Ovo de Pascoa Classico',
    description: 'Chocolate ao leite 45% com recheio de ganache trufado. 250g.',
    price: 65.00,
    category: 'sazonais',
    type: 'chocolate',
    imageUrl: ''
  },
  {
    id: 'c17',
    name: 'Caixa Natalina',
    description: 'Selecao especial de 12 bombons sortidos em caixa presenteavel.',
    price: 78.00,
    category: 'sazonais',
    type: 'chocolate',
    imageUrl: ''
  },
  {
    id: 'c18',
    name: 'Coracao de Chocolate',
    description: 'Coracao de chocolate ruby com recheio de frutas vermelhas. 180g.',
    price: 45.00,
    category: 'sazonais',
    type: 'chocolate',
    imageUrl: ''
  },
];

// ========== TAMANHOS DE GELATO ==========

const GELATO_SIZES = [
  { id: 'pequeno', name: 'Pequeno', balls: 1, price: 10.00 },
  { id: 'medio',   name: 'Medio',   balls: 2, price: 16.00 },
  { id: 'grande',  name: 'Grande',  balls: 3, price: 22.00 },
  { id: '240ml',   name: '240 Ml',  balls: 2, price: 14.00 },
  { id: '500ml',   name: '500 Ml',  balls: 3, price: 22.00 },
  { id: '600g',    name: '600 Gramas', balls: 4, price: 28.00 },
  { id: '1kg',     name: '1 Kg',    balls: 6, price: 45.00 },
];

// ========== CAIXAS DE CHOCOLATE ==========

const CHOCOLATE_BOXES = [
  { id: 'box6',  name: 'Caixa Pequena', units: 6,  price: 48.00 },
  { id: 'box12', name: 'Caixa Media',   units: 12, price: 89.00 },
  { id: 'box24', name: 'Caixa Grande',  units: 24, price: 165.00 },
];

// ========== COBERTURAS ==========

const TOPPINGS = [
  { id: 't1', name: 'Calda de Chocolate',   price: 3.00 },
  { id: 't2', name: 'Calda de Caramelo',    price: 3.00 },
  { id: 't3', name: 'Frutas Frescas',       price: 4.00 },
  { id: 't4', name: 'Granola',              price: 3.00 },
  { id: 't5', name: 'Chantilly',            price: 2.50 },
  { id: 't6', name: 'Castanhas Trituradas', price: 4.00 },
];

// ========== DIVERSOS ==========

const SEED_DIVERSOS = [
  {
    id: 'd1',
    name: 'Casquinha Simples',
    description: 'Casquinha crocante para acompanhar seu gelato.',
    price: 3.00,
    type: 'diversos',
    imageUrl: ''
  },
  {
    id: 'd2',
    name: 'Casquinha Coberta',
    description: 'Casquinha com cobertura de chocolate belga.',
    price: 5.00,
    type: 'diversos',
    imageUrl: ''
  },
  {
    id: 'd3',
    name: 'Agua Mineral',
    description: 'Agua mineral sem gas 500ml.',
    price: 4.00,
    type: 'diversos',
    imageUrl: ''
  },
  {
    id: 'd4',
    name: 'Agua com Gas',
    description: 'Agua mineral com gas 500ml.',
    price: 5.00,
    type: 'diversos',
    imageUrl: ''
  },
  {
    id: 'd5',
    name: 'Suco Natural',
    description: 'Suco natural da fruta do dia 300ml.',
    price: 10.00,
    type: 'diversos',
    imageUrl: ''
  },
  {
    id: 'd6',
    name: 'Cafe Espresso',
    description: 'Cafe espresso curto ou longo.',
    price: 6.00,
    type: 'diversos',
    imageUrl: ''
  },
  {
    id: 'd7',
    name: 'Cappuccino',
    description: 'Cappuccino italiano com espuma cremosa.',
    price: 10.00,
    type: 'diversos',
    imageUrl: ''
  },
  {
    id: 'd8',
    name: 'Milkshake',
    description: 'Milkshake cremoso com o sabor de gelato da sua escolha.',
    price: 18.00,
    type: 'diversos',
    imageUrl: ''
  },
  {
    id: 'd9',
    name: 'Affogato',
    description: 'Gelato de fior di latte com shot de cafe espresso.',
    price: 16.00,
    type: 'diversos',
    imageUrl: ''
  },
  {
    id: 'd10',
    name: 'Brownie',
    description: 'Brownie artesanal de chocolate belga.',
    price: 12.00,
    type: 'diversos',
    imageUrl: ''
  },
];
