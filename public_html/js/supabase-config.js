// ============================================
// GANTE — Configuracao do Supabase
// ============================================
//
// ========================================================
//  COMO CONFIGURAR O SUPABASE PARA ESTE PROJETO
// ========================================================
//
//  1. Acesse https://supabase.com/ e crie uma conta gratuita
//  2. Clique em "New Project" e crie um novo projeto
//  3. Anote a URL do projeto e a anon key (public)
//     - Va em Settings > API
//     - Copie "Project URL" e "anon public" key
//  4. Substitua os valores abaixo com seus dados
//  5. Execute o script SQL (supabase-setup.sql) no SQL Editor
//     do Supabase para criar as tabelas
//  6. Pronto! O site vai carregar os dados do Supabase
//
// ========================================================

// SUBSTITUA com seus dados do Supabase
const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA-ANON-KEY-AQUI';

// Detecta se o Supabase foi configurado
const SUPABASE_CONFIGURED = (
  SUPABASE_URL !== 'https://SEU-PROJETO.supabase.co' &&
  SUPABASE_ANON_KEY !== 'SUA-ANON-KEY-AQUI' &&
  SUPABASE_URL.length > 10 &&
  SUPABASE_ANON_KEY.length > 10
);

// Inicializar o client Supabase (somente se configurado)
let supabase = null;

if (SUPABASE_CONFIGURED && window.supabase) {
  try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase inicializado com sucesso!');
  } catch (err) {
    console.warn('Erro ao inicializar Supabase:', err);
    supabase = null;
  }
} else {
  console.log('Supabase nao configurado. Usando dados locais (data.js).');
}
