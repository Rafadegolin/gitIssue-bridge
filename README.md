📝 Criar README.md Profissional
Vamos substituir por um README completo e atraente!

📍 PASSO 1: Substituir README.md
Abra o arquivo:
powershell
code README.md
Substitua TODO o conteúdo por:
text

# 🌉 GitIssue Bridge

<p align="center">
  <strong>Bridge between GitHub Issues/Milestones and VS Code development</strong>
</p>

<p align="center">
  <a href="https://github.com/Rafadegolin/gitIssue-bridge/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/Rafadegolin/gitIssue-bridge?style=flat-square" alt="License">
  </a>
  <a href="https://github.com/Rafadegolin/gitIssue-bridge/issues">
    <img src="https://img.shields.io/github/issues/Rafadegolin/gitIssue-bridge?style=flat-square" alt="Issues">
  </a>
  <a href="https://github.com/Rafadegolin/gitIssue-bridge">
    <img src="https://img.shields.io/github/stars/Rafadegolin/gitIssue-bridge?style=flat-square" alt="Stars">
  </a>
</p>

---

## ✨ Sobre o Projeto

**GitIssue Bridge** é uma extensão VS Code que cria uma ponte inteligente entre GitHub Issues/Milestones e seu desenvolvimento local. Automatize workflows repetitivos e forneça contexto rico para o GitHub Copilot, melhorando drasticamente sua produtividade.

### 🎯 Objetivos Principais

1. **Sincronização Inteligente** - Selecione milestones e navegue issues diretamente no VS Code
2. **Automação de Branch** - Crie branches automaticamente baseadas em issues com nomenclatura padronizada
3. **Contexto para Copilot** - Gere arquivos `.vscode/issue-context.json` que o Copilot usa para entender objetivos
4. **IA Generativa** - Analise código atual e sugira novas issues/milestones estruturadas
5. **Chat Integration** - Implemente Chat Participant `@issues` para interação natural com Copilot

### 🔥 Diferenciais

- ✅ Zero configuração manual de tokens (usa VS Code Authentication API)
- ✅ Dupla confirmação em todas as operações destrutivas
- ✅ Interface nativa do VS Code (TreeView, Status Bar, Command Palette)
- ✅ Segurança por design (nunca expõe credenciais)

---

## 🚀 Status do Projeto

### ✅ Milestone 1: Fundação do Projeto (v0.1.0) - COMPLETO

- [x] Setup completo do projeto (TypeScript + esbuild)
- [x] Sistema de testes (Jest com coverage 60%+)
- [x] Code quality (ESLint + Prettier)
- [x] Estrutura modular (auth, api, git, views, chat, context, utils)
- [x] Extensão funcional no VS Code

### 🚧 Próximas Milestones

- [ ] **Milestone 2**: Sistema de Logging e Error Handling
- [ ] **Milestone 3**: Autenticação GitHub OAuth
- [ ] **Milestone 4**: Cliente GitHub API
- [ ] **Milestone 5**: Interface (TreeView, Status Bar)
- [ ] **Milestone 6**: Automação Git e Branch Management
- [ ] **Milestone 7**: Copilot Integration (Chat Participant)
- [ ] **Milestone 8**: Publicação no Marketplace (v1.0.0)

---

## 🛠️ Stack Tecnológico

**Core:**

- TypeScript 5.x
- Node.js 18+
- VS Code Extension API 1.85+

**Integrações:**

- @octokit/rest - GitHub REST API client
- VS Code Authentication API - OAuth GitHub
- VS Code Chat Participants API - Copilot integration
- VS Code Git Extension API - Operações Git
- Language Model API (vscode.lm)

**DevOps:**

- ESLint + Prettier
- Jest (testes unitários)
- esbuild (bundler)

---

## 🏁 Quick Start (Para Desenvolvedores)

### Pré-requisitos

- Node.js 18.x ou superior
- VS Code 1.85.0 ou superior
- Git

### Instalação

Clone o repositório
git clone https://github.com/Rafadegolin/gitIssue-bridge.git
cd gitIssue-bridge

Instale as dependências
npm install

Compile o projeto
npm run compile

text

### Desenvolvimento

Watch mode (auto-rebuild)
npm run watch

Pressione F5 no VS Code para abrir Extension Development Host
Rodar testes
npm test

Lint
npm run lint

Formatar código
npm run format

text

### Testar a Extensão

1. Abra o projeto no VS Code
2. Pressione **F5** para abrir Extension Development Host
3. Na nova janela, pressione **Ctrl+Shift+P**
4. Digite: `GitIssue Bridge: Test Command`
5. Deve aparecer: "✅ GitIssue Bridge is active! Setup complete."

---

## 📁 Estrutura do Projeto

gitissue-bridge/
├── src/
│ ├── auth/ # Autenticação GitHub (futuro)
│ ├── api/ # Cliente GitHub API (futuro)
│ ├── git/ # Operações Git (futuro)
│ ├── views/ # UI Components (futuro)
│ ├── chat/ # Copilot Integration (futuro)
│ ├── context/ # Context Generation (futuro)
│ ├── utils/ # Utilitários (futuro)
│ └── extension.ts # Entry point
├── test/
│ └── unit/
│ └── extension.test.ts
├── .vscode/
│ ├── launch.json # Debug config
│ └── tasks.json # Build tasks
├── package.json # Manifest da extensão
├── tsconfig.json # TypeScript config
├── jest.config.js # Jest config
└── README.md

text

---

## 🔒 Princípios de Segurança

### Práticas Implementadas

1. **Zero-Trust Authentication** - Sempre usa `vscode.authentication.getSession()`
2. **Dupla Confirmação** - Modal antes de criar/deletar branches, commits, modificar issues
3. **Princípio do Menor Privilégio** - Solicita apenas scopes: `['repo', 'read:org']`
4. **Secret Storage API** - Usa `context.secrets` para dados persistentes sensíveis
5. **Input Validation** - Sanitiza TODOS os inputs antes de usar em comandos/API
6. **Workspace Trust** - Verifica `workspace.isTrusted` antes de operações sensíveis

---

## 🧪 Testes

Rodar todos os testes
npm test

Watch mode
npm run test:watch

Apenas unit tests
npm run test:unit

Ver coverage
npm test

Abre: coverage/lcov-report/index.html
text

### Coverage Atual

- **Statements**: 60%+
- **Branches**: 60%+
- **Functions**: 60%+
- **Lines**: 60%+

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Convenção de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `test:` - Testes
- `refactor:` - Refatoração de código
- `chore:` - Manutenção

---

## 📝 Roadmap Completo

### v0.1.0 - Fundação ✅

- Setup do projeto
- Sistema de testes
- Code quality tools

### v0.2.0 - Core (Em Desenvolvimento)

- Sistema de logging
- Autenticação GitHub
- Cliente GitHub API

### v0.3.0 - Interface

- TreeView para milestones/issues
- Status bar integration
- Quick picks e comandos

### v0.4.0 - Automação Git

- Branch management
- Context generation
- Git operations

### v0.5.0 - Copilot Integration

- Chat Participant `@issues`
- Issue analysis
- Code suggestions

### v1.0.0 - Release

- Documentação completa
- Testes E2E
- Publicação no Marketplace

---

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

## 🙏 Agradecimentos

- VS Code Extension API
- Octokit (GitHub API client)
- GitHub Copilot team

---

## 📧 Contato

**Rafael Degolin** - [@Rafadegolin](https://github.com/Rafadegolin)

**Link do Projeto**: [https://github.com/Rafadegolin/gitIssue-bridge](https://github.com/Rafadegolin/gitIssue-bridge)

---

<p align="center">
  Made with ❤️ and ☕ by <a href="https://github.com/Rafadegolin">Rafael Degolin</a>
</p>
