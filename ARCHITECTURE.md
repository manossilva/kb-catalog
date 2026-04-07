# KB Supreme — Catálogo Digital

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 18 + Vite |
| Estilo | CSS Modules (1 arquivo por componente) |
| Backend | Supabase (Auth + PostgreSQL + RLS) |
| Imagens | Google Drive (link público) |
| Deploy | Vercel / Netlify |

## Estrutura de Pastas

```
kb-catalog/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/              # Imagens estáticas, SVGs, fontes
│   ├── components/          # Componentes reutilizáveis
│   │   ├── Header.jsx
│   │   ├── Header.module.css
│   │   ├── Tabs.jsx
│   │   ├── Tabs.module.css
│   │   ├── ProductCard.jsx
│   │   ├── ProductCard.module.css
│   │   ├── ColorDot.jsx
│   │   ├── ColorDot.module.css
│   │   ├── ProductModal.jsx
│   │   ├── ProductModal.module.css
│   │   ├── LoginModal.jsx
│   │   ├── LoginModal.module.css
│   │   ├── ConfirmDialog.jsx
│   │   └── ConfirmDialog.module.css
│   ├── hooks/               # Custom hooks
│   │   ├── useProducts.js   # CRUD de produtos
│   │   ├── useSections.js   # Leitura de seções
│   │   └── useAuth.js       # Login/logout
│   ├── lib/                 # Utilitários e configuração
│   │   └── supabase.js      # Cliente Supabase
│   ├── pages/               # Páginas/rotas
│   │   └── Catalog.jsx      # Página principal
│   ├── styles/              # Estilos globais
│   │   └── global.css
│   ├── App.jsx              # Root com AuthProvider
│   └── main.jsx             # Entry point
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── catalog_schema.sql
└── ARCHITECTURE.md
```

## Banco de Dados (Supabase)

### Tabelas

**sections** — Categorias do catálogo
- `id` UUID PK
- `name` TEXT
- `slug` TEXT
- `sort_order` INT

**products** — Produto principal
- `id` UUID PK
- `section_id` UUID FK → sections
- `title` TEXT
- `image_url` TEXT
- `video_url` TEXT
- `composition` TEXT
- `created_at`, `updated_at` TIMESTAMPTZ

**product_sizes** — Tamanhos/referências por produto
- `id` UUID PK
- `product_id` UUID FK → products (CASCADE)
- `size_type` TEXT (Solteiro, Casal, Queen, King, 2 Lugares, 3 Lugares)
- `reference` TEXT (ex: "6970")
- `quantity` INT
- `dimensions` JSONB (ex: `{"altura":"2,30","largura":"1,00","braco":"0,80x0,40"}`)

**product_colors** — Cores por produto
- `id` UUID PK
- `product_id` UUID FK → products (CASCADE)
- `code` TEXT (ex: "02")
- `name` TEXT (ex: "Marfim")
- `hex_color` TEXT (ex: "#F5F0E1")

### RLS (Row Level Security)
- **SELECT**: público (catálogo aberto sem login)
- **INSERT/UPDATE/DELETE**: somente `authenticated`

## Fluxo de Dados

```
Visitante                        Admin (logado)
    │                                │
    ├─ GET sections ────────────────►│
    ├─ GET products ────────────────►│
    ├─ GET product_sizes ───────────►│
    ├─ GET product_colors ──────────►│
    │                                │
    │  (somente leitura)             ├─ POST/PATCH/DELETE products
    │                                ├─ POST/DELETE product_sizes
    │                                └─ POST/DELETE product_colors
```

## Comandos

```bash
# Instalar
npm install

# Dev
npm run dev

# Build
npm run build

# Preview build
npm run preview
```

## Setup Supabase

1. Crie um projeto em https://supabase.com
2. Vá em SQL Editor → cole e execute `catalog_schema.sql`
3. Vá em Authentication → Users → crie o usuário admin (email/senha)
4. Vá em Settings → API → copie a URL e a `anon key`
5. Crie `.env` a partir de `.env.example` e cole os valores

## Google Drive — URL de Imagem

O link padrão do Drive não funciona como `<img src>`. Use:

```
https://drive.google.com/uc?export=view&id=FILE_ID
```

Para pegar o `FILE_ID`: abra o arquivo no Drive → "Compartilhar" → copie o link → extraia o ID entre `/d/` e `/view`.
