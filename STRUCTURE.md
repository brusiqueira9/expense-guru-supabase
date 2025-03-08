# Estrutura Detalhada do Projeto

## 📁 Estrutura de Diretórios

```
expense-guru/
├── src/
│   ├── assets/                 # Recursos estáticos
│   │   └── money.png          # Logo do aplicativo
│   │
│   ├── components/            # Componentes React
│   │   ├── layout/           # Componentes de layout
│   │   │   ├── RootLayout.tsx
│   │   │   └── Sidebar.tsx
│   │   │
│   │   ├── ui/              # Componentes de UI (shadcn)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   │
│   │   ├── Auth.tsx         # Componente de autenticação
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionList.tsx
│   │   └── ...
│   │
│   ├── context/             # Contextos React
│   │   ├── TransactionContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── hooks/              # Hooks personalizados
│   │   ├── useAuth.ts
│   │   ├── useTransactions.ts
│   │   └── ...
│   │
│   ├── lib/               # Utilitários e configurações
│   │   ├── supabase.ts   # Configuração do Supabase
│   │   ├── storage.ts    # Gerenciamento de armazenamento local
│   │   ├── utils.ts      # Funções utilitárias
│   │   └── formatters.ts # Formatadores (moeda, data, etc)
│   │
│   ├── pages/            # Páginas da aplicação
│   │   ├── Dashboard.tsx
│   │   ├── Transactions.tsx
│   │   ├── Categories.tsx
│   │   ├── Accounts.tsx
│   │   ├── Wallets.tsx
│   │   ├── Charts.tsx
│   │   ├── Reports.tsx
│   │   ├── Goals.tsx
│   │   └── Settings.tsx
│   │
│   ├── types/           # Definições de tipos
│   │   └── index.ts
│   │
│   ├── App.tsx         # Componente principal
│   └── main.tsx        # Ponto de entrada
│
├── public/            # Arquivos públicos
│   └── ...
│
├── .env              # Variáveis de ambiente
├── package.json      # Dependências e scripts
├── tsconfig.json     # Configuração do TypeScript
├── tailwind.config.js # Configuração do Tailwind
└── vite.config.ts    # Configuração do Vite
```

## 🔄 Fluxo de Dados

1. **Autenticação**
   - Login/Registro via Supabase
   - Armazenamento do token de sessão
   - Gerenciamento de estado do usuário

2. **Transações**
   - Criação/Edição/Exclusão
   - Armazenamento local com sincronização
   - Filtros e ordenação
   - Cálculos de totais e resumos

3. **Categorias**
   - Gerenciamento de categorias personalizadas
   - Associação com transações
   - Organização por tipo (receita/despesa)

4. **Contas e Carteiras**
   - Gerenciamento de contas bancárias
   - Controle de carteiras de investimento
   - Saldos e movimentações

## 🎯 Funcionalidades por Página

### Dashboard (/)
- Resumo financeiro
- Gráficos de visão geral
- Últimas transações
- Alertas e notificações

### Transações (/transactions)
- Lista de transações
- Formulário de nova transação
- Filtros avançados
- Edição rápida
- Status de pagamento

### Categorias (/categories)
- Lista de categorias
- Criação/edição de categorias
- Estatísticas por categoria
- Organização hierárquica

### Contas (/accounts)
- Lista de contas bancárias
- Saldos e extratos
- Transferências entre contas
- Conciliação bancária

### Carteiras (/wallets)
- Carteiras de investimento
- Composição da carteira
- Rentabilidade
- Histórico de operações

### Gráficos (/charts)
- Gráficos interativos
- Análises temporais
- Comparativos
- Projeções

### Relatórios (/reports)
- Relatórios personalizados
- Exportação em PDF
- Análises detalhadas
- Histórico consolidado

### Metas (/goals)
- Definição de metas financeiras
- Acompanhamento de progresso
- Alertas e lembretes
- Projeções de atingimento

### Configurações (/settings)
- Perfil do usuário
- Preferências do sistema
- Configurações de notificação
- Personalização da interface

## 🔐 Segurança e Privacidade

1. **Autenticação**
   - Login seguro via Supabase
   - Proteção de rotas
   - Tokens JWT
   - Refresh tokens

2. **Dados**
   - Isolamento por usuário
   - Criptografia em trânsito
   - Backup automático
   - Validação de dados

3. **Privacidade**
   - Dados sensíveis mascarados
   - Opção de exclusão de conta
   - Exportação de dados
   - Logs de atividade

## 🎨 Componentes de UI

1. **Layout**
   - Sidebar responsiva
   - Headers consistentes
   - Cards informativos
   - Grids adaptáveis

2. **Formulários**
   - Inputs com validação
   - Selects customizados
   - Máscaras de entrada
   - Feedback visual

3. **Feedback**
   - Toasts informativos
   - Modais de confirmação
   - Indicadores de loading
   - Mensagens de erro/sucesso

4. **Visualização**
   - Tabelas responsivas
   - Gráficos interativos
   - Cards expansíveis
   - Listas virtualizadas 