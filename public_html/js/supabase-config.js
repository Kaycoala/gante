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

// Inicializar o client Supabase (usando o SDK global carregado via CDN)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Supabase inicializado com sucesso!');
