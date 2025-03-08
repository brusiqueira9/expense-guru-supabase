# Expense Guru - Controle Financeiro

Um aplicativo moderno e intuitivo para gerenciamento de finanças pessoais, construído com React, TypeScript, Tailwind CSS e Supabase.

## 🚀 Funcionalidades

- **Autenticação Segura**
  - Login com email/senha
  - Registro de novos usuários
  - Recuperação de senha
  - Perfil de usuário personalizável

- **Gestão de Transações**
  - Registro de receitas e despesas
  - Categorização de transações
  - Status de pagamento (pago, pendente, agendado)
  - Filtros avançados
  - Ordenação por data e tipo

- **Análise Financeira**
  - Dashboard com visão geral
  - Gráficos interativos
  - Relatórios detalhados
  - Acompanhamento de metas
  - Balanço de receitas e despesas

- **Organização**
  - Gerenciamento de categorias
  - Controle de contas bancárias
  - Gestão de carteiras de investimento
  - Sistema de metas financeiras

## 🛠️ Tecnologias

- **Frontend**
  - React
  - TypeScript
  - Tailwind CSS
  - Shadcn/ui
  - Lucide Icons
  - React Router DOM
  - Framer Motion

- **Backend/Banco de Dados**
  - Supabase (Autenticação e Armazenamento)

## 📦 Instalação

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd expense-guru
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## 📁 Estrutura do Projeto

```
src/
├── assets/           # Recursos estáticos (imagens, etc)
├── components/       # Componentes React reutilizáveis
│   ├── layout/      # Componentes de layout (Sidebar, etc)
│   └── ui/          # Componentes de UI (botões, inputs, etc)
├── context/         # Contextos React (TransactionContext, etc)
├── hooks/           # Hooks personalizados
├── lib/            # Utilitários e configurações
├── pages/          # Componentes de página
└── types/          # Definições de tipos TypeScript
```

## 🗺️ Mapa de Navegação

- **/** - Dashboard (visão geral)
- **/auth** - Página de login
- **/register** - Página de registro
- **/transactions** - Gerenciamento de transações
- **/categories** - Gerenciamento de categorias
- **/accounts** - Gerenciamento de contas
- **/wallets** - Gerenciamento de carteiras
- **/charts** - Visualização de gráficos
- **/reports** - Geração de relatórios
- **/goals** - Definição e acompanhamento de metas
- **/settings** - Configurações do usuário

## 🔒 Segurança

- Autenticação gerenciada pelo Supabase
- Dados armazenados de forma segura
- Proteção de rotas para usuários autenticados
- Isolamento de dados por usuário

## 🎨 Design

- Interface moderna e minimalista
- Tema claro/escuro
- Design responsivo
- Animações suaves
- Feedback visual para ações do usuário

## 📱 Responsividade

O aplicativo é totalmente responsivo e se adapta a diferentes tamanhos de tela:
- Desktop (> 1024px)
- Tablet (768px - 1024px)
- Mobile (< 768px)

## 🤝 Contribuição

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autores

- Bruno Siqueira - Desenvolvedor Principal

## 📞 Suporte

Para suporte, envie um email para contato@brunosiqueira.tec.br
