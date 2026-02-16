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
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Flag para indicar que Supabase esta ativo
window.SUPABASE_ENABLED = true;

console.log('Supabase inicializado com sucesso!');
