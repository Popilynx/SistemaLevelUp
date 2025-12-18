# Sistema Level Up - PWA
## 🎮 Aplicação de Evolução Pessoal Gamificada

Um PWA (Progressive Web App) que funciona completamente offline usando localStorage, inspirado em *Solo Leveling*.

---

## ✨ Características

- ✅ **Funciona 100% Offline** - localStorage para persistência de dados
- ✅ **Instalável** - Pode ser instalado como app nativo em celulares
- ✅ **Sem Backend** - Nenhuma dependência de servidor externo
- ✅ **Tema Dark** - Estilo cyberpunk moderno
- ✅ **Responsive** - Otimizado para mobile
- ✅ **PWA Completo** - Service Worker + Web App Manifest

---

## 📋 Funcionalidades

### 👤 Personagem
- Nome e imagem de perfil
- Pontos de EXP e Nível
- Ouro (moeda do sistema)
- Pontos de vida

### 💪 Bons Hábitos
- Criar e gerenciar hábitos positivos
- Sistema de streak (série)
- Recompensa EXP e ouro

### 🚫 Maus Hábitos
- Rastrear hábitos ruins
- Penalidades de saúde
- Dias "limpos" (sem cair)

### 🎯 Objetivos
- Definir metas pessoais
- Acompanhar progresso
- Recompensas ao completar

### 📚 Habilidades
- Desenvolver skills em diferentes categorias
- Sistema de leveling por skill
- Vinculadas a objetivos

### 🛍️ Mercado
- Comprar recompensas com ouro
- Boosts de EXP
- Itens especiais

### 📊 Log de Atividades
- Histórico de todas as ações
- Rastreamento de ganhos

---

## 🚀 Como Fazer Deploy

### Pré-requisitos
- Node.js 18+ instalado
- Git instalado
- Conta no GitHub
- Conta no Vercel (gratuita)

### Passo 1: Instalar Dependências

```bash
npm install
```

### Passo 2: Testar Localmente

```bash
npm run dev
```

Acesse `http://localhost:5173` no navegador.

### Passo 3: Build para Produção

```bash
npm run build
```

Isso cria a pasta `dist/` com os arquivos otimizados.

### Passo 4: Fazer Deploy no Vercel

#### Opção A: Via CLI Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

Siga as instruções na tela.

#### Opção B: Via GitHub + Vercel Dashboard

1. Envie o código para GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Sistema Level Up PWA"
   git remote add origin https://github.com/seu-usuario/sistema-level-up.git
   git push -u origin main
   ```

2. Acesse https://vercel.com
3. Clique em "New Project"
4. Selecione seu repositório
5. Clique em "Deploy"

### Passo 5: Criar Ícones PWA (IMPORTANTE!)

Você precisa criar 3 imagens PNG para o app funcionar corretamente:

**Opção 1: Usar Gerador Online**
- https://www.pwabuilder.com/imageGenerator
- Upload uma imagem 512x512px
- Baixe os ícones gerados

**Opção 2: Criar Manualmente com Canva**
- Crie designs 512x512, 192x192 e 180x180
- Fundo: Gradiente azul (#0f172a para #06b6d4)
- Texto: "LEVEL UP" em branco bold
- Ícone: Espada/raio opcional

**Tamanhos necessários:**
- `public/icon-192.png` (192×192px)
- `public/icon-512.png` (512×512px)
- `public/apple-touch-icon.png` (180×180px)

### Passo 6: Adicionar Ícones ao Vercel

Após fazer deploy:
1. Acesse o painel do Vercel
2. Vá em "Settings" → "Environment Variables"
3. Faça upload dos ícones em `public/`
4. Redeploye (clique em "Redeploy")

---

## 📱 Como Instalar no iPhone

1. Abra o **Safari**
2. Acesse a URL do seu app (ex: `https://seu-app.vercel.app`)
3. Toque no botão **Compartilhar** (quadrado com seta)
4. Role para baixo
5. Toque em **"Adicionar à Tela Inicial"**
6. Toque em **"Adicionar"**

O app aparecerá na tela inicial como qualquer outro app!

---

## 🔒 Privacidade de Dados

- **Todos os dados são salvos localmente no seu celular**
- Nenhuma informação é enviada para servidores
- Dados persistem mesmo offline
- Sincronização entre abas do mesmo navegador

---

## 📁 Estrutura do Projeto

```
src/
  ├── App.tsx              # Componente principal
  ├── Layout.ts            # Layout do app
  ├── main.tsx             # Entrada do React
  ├── index.css            # Estilos globais
  ├── utils.ts             # Utilitários
  ├── Pages/               # Páginas
  │   ├── Home.tsx
  │   ├── GoodHabits.tsx
  │   ├── BadHabits.tsx
  │   ├── Objectives.tsx
  │   ├── Skills.tsx
  │   ├── market.tsx
  │   ├── CharacterSettings.tsx
  │   └── ActivityLog.tsx
  ├── Componentes/
  │   ├── storage/LocalStorage.tsx  # Sistema de storage
  │   ├── habits/
  │   ├── character/
  │   ├── skills/
  │   ├── objectives/
  │   ├── market/
  │   ├── activity/
  │   └── ui/
  └── Entities/            # JSONs com estruturas

public/
  ├── manifest.json        # Configuração PWA
  ├── service-worker.js    # Service worker
  ├── icon-192.png         # Ícone 192×192
  ├── icon-512.png         # Ícone 512×512
  └── apple-touch-icon.png # Ícone iPhone

├── package.json           # Dependências
├── tsconfig.json          # Config TypeScript
├── vite.config.ts         # Config Vite
├── tailwind.config.js     # Config Tailwind
└── vercel.json            # Config Vercel
```

---

## 🛠️ Tecnologias Utilizadas

- **React 18** - UI Library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animações
- **React Router** - Navegação
- **date-fns** - Utilitários de data
- **Lucide React** - Ícones
- **Sonner** - Notificações

---

## 📝 Scripts Disponíveis

```bash
npm run dev       # Rodar em desenvolvimento
npm run build     # Build para produção
npm run preview   # Preview do build
npm run lint      # Verificar código
```

---

## 🐛 Troubleshooting

### "Ícones não aparecem no app"
- Certifique-se de que os 3 ícones PNG estão em `public/`
- Os nomes devem ser exatos: `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`
- Ícones devem ser PNG válidos

### "Service worker não funciona"
- Verifique se `public/service-worker.js` existe
- Veja o console do navegador para erros
- Tente limpar cache: DevTools → Application → Storage → Clear site data

### "App não instala no iPhone"
- Safari é obrigatório (Chrome não permite)
- App deve estar em HTTPS
- Verifique `manifest.json`

### "Dados desaparecem após atualizar"
- Isso pode ser normal se usar modo privado
- localStorage não persiste em modo privado
- Use modo normal para manter dados

---

## 📞 Suporte

Para problemas:
1. Verifique o console do navegador (F12)
2. Limpe o cache: Ctrl+Shift+Delete
3. Tente em outro navegador
4. Veja a aba "Application" no DevTools

---

## 📄 Licença

MIT License - sinta-se livre para usar e modificar!

---

## 🎯 Próximas Melhorias

- [ ] Sincronização com cloud (opcional)
- [ ] Compartilhar conquistas
- [ ] Notificações push
- [ ] Temas customizáveis
- [ ] Dados de backup/restore
- [ ] Leaderboards locais

---

**Feito com ❤️ para leveling up na vida real! 🚀**
