// ============================================
// GANTE — Configuracao do Firebase
// ============================================
//
// ========================================================
//  COMO CONFIGURAR O FIREBASE PARA ESTE PROJETO
// ========================================================
//
//  1. Acesse https://console.firebase.google.com/
//  2. Clique em "Adicionar projeto" e crie um novo projeto
//  3. No painel do projeto, clique no icone "</>" (Web) para
//     registrar um app web
//  4. Copie as credenciais do firebaseConfig e substitua
//     os valores abaixo
//
//  5. FIRESTORE (banco de dados):
//     - No menu lateral, va em "Firestore Database"
//     - Clique em "Criar banco de dados"
//     - Escolha "Iniciar no modo de teste" (para desenvolvimento)
//     - Selecione a regiao mais proxima (ex: southamerica-east1)
//     - Crie duas colecoes: "gelatos" e "chocolates"
//       (ou deixe que o codigo crie automaticamente ao salvar)
//
//  6. STORAGE (armazenamento de imagens):
//     - No menu lateral, va em "Storage"
//     - Clique em "Comecar" e siga as instrucoes
//     - As regras de seguranca para teste:
//       rules_version = '2';
//       service firebase.storage {
//         match /b/{bucket}/o {
//           match /{allPaths=**} {
//             allow read, write: if true;
//           }
//         }
//       }
//     - IMPORTANTE: Em producao, restrinja as regras acima!
//
//  7. AUTENTICACAO (opcional, para o admin):
//     - No menu lateral, va em "Authentication"
//     - Ative o provedor "E-mail/senha"
//
//  8. Descomente as linhas de script no index.html e admin.html
//     que carregam os SDKs do Firebase
//
//  9. Descomente o codigo abaixo e no storage.js para ativar
//     a integracao com Firebase
//
// ========================================================

// ----------------------------------------------------------
// DESCOMENTE TODO O BLOCO ABAIXO PARA ATIVAR O FIREBASE
// ---------------------------------------------------------


// Configuracao do Firebase - SUBSTITUA com seus dados
const firebaseConfig = {
    apiKey: "AIzaSyDxt3JDGPT7j40EvImtUfz8anljiNLIsxM",
    authDomain: "gante-cb023.firebaseapp.com",
    projectId: "gante-cb023",
    storageBucket: "gante-cb023.firebasestorage.app",
    messagingSenderId: "388156692266",
    appId: "1:388156692266:web:810ea1d107d37613c53053"
  };

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencias globais
const db = firebase.firestore();
const storage = firebase.storage();

// Colecoes do Firestore
const gelatosCollection = db.collection('gelatos');
const chocolatesCollection = db.collection('chocolates');
const gelatoCategoriesCollection = db.collection('gelato_categories');
const chocolateCategoriesCollection = db.collection('chocolate_categories');

// Flag para indicar que Firebase esta ativo
window.FIREBASE_ENABLED = true;

console.log('Firebase inicializado com sucesso!');



// Fallback: se Firebase nao estiver ativo
if (!window.FIREBASE_ENABLED) {
  window.FIREBASE_ENABLED = false;
}
