// ============================================
// GANTE — Configuracao do Supabase
// ============================================
//
// ========================================================
//  COMO CONFIGURAR O SUPABASE PARA ESTE PROJETO
// ========================================================
//
//  1. Acesse https://supabase.com e crie uma conta (gratuito)
//  2. Clique em "New Project" e crie um novo projeto
//  3. Anote a URL do projeto e a chave publica (anon key)
//     - Va em Settings > API
//     - Copie "Project URL" e "anon public" key
//  4. Substitua os valores abaixo com suas credenciais
//  5. Execute o SQL de criacao das tabelas no SQL Editor do Supabase
//     (veja o arquivo sql/setup.sql neste projeto)
//  6. Execute o SQL de seed dos dados iniciais
//     (veja o arquivo sql/seed.sql neste projeto)
//
// ========================================================

// ---- SUBSTITUA COM SEUS DADOS DO SUPABASE ----
const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA-CHAVE-ANON-PUBLICA';

// Inicializar cliente Supabase
// O CDN cria window.supabase como a biblioteca. Usamos um nome diferente
// para o cliente para evitar conflito com o objeto global da biblioteca.
let supabaseClient = null;

try {
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.SUPABASE_ENABLED = true;
    console.log('Supabase inicializado com sucesso!');
  } else {
    console.error('Supabase SDK nao encontrado. Verifique se o script do CDN foi carregado.');
    window.SUPABASE_ENABLED = false;
  }
} catch (e) {
  console.error('Erro ao inicializar Supabase:', e);
  window.SUPABASE_ENABLED = false;
}
