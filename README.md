# 🍕 Cardápio Online — Backend

> **API REST** para um sistema completo de cardápio online de pizzaria, com painel administrativo, gestão de pedidos, mesas e muito mais.

---

## 🚀 Tecnologias

| Tecnologia | Descrição |
|---|---|
| ![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white) | Framework Node.js com arquitetura MVC |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) | Tipagem estática |
| ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white) | ORM moderno para acesso ao banco |
| ![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white) | Banco de dados leve e embutido |
| ![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white) | Autenticação stateless para admins |

---

## 📁 Estrutura do Projeto

```
src/
├── 📄 main.ts                    # Bootstrap da aplicação
├── 📄 app.module.ts              # Módulo raiz
├── 📄 app.service.ts             # Seed automático do banco
│
├── 🔧 filters/
│   └── http-exception.filter.ts  # Tratamento global de erros
│
├── 🗄️  prisma/                   # Módulo global do Prisma
│   ├── prisma.module.ts
│   └── prisma.service.ts
│
├── 🔐 auth/                      # Autenticação JWT
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   └── jwt-auth.guard.ts
│
├── 📂 categorias/                # Categorias do cardápio
├── 🍕 itens/                     # Itens do cardápio
├── 📋 pedidos/                   # Gestão de pedidos
├── 🚚 entrega/                   # Taxa de entrega
├── 🕐 horarios/                  # Horários de funcionamento
├── 🥖 bordas/                    # Bordas de pizza
├── 🫓 tipos-massa/               # Tipos de massa
├── 🪑 mesas/                     # Sessões de mesa (dine-in)
└── ⚙️  configuracao/             # Configurações da loja
```

---

## ⚙️ Configuração e Execução

### Pré-requisitos

- Node.js 18+
- npm

### Instalação

```bash
# 1. Clone o repositório
git clone <url-do-repo>
cd Cardapio-Online-Backend

# 2. Instale as dependências
npm install

# 3. Aplique as migrações do banco de dados
npx prisma migrate deploy

# 4. Gere o Prisma Client
npx prisma generate
```

### Rodando a aplicação

```bash
# Desenvolvimento (hot-reload)
npm run start:dev

# Produção
npm run build
npm run start
```

O servidor sobe na porta **3000** por padrão.
Defina a variável de ambiente `PORT` para mudar.

### 🔑 Credenciais padrão do Admin

Na primeira execução, o sistema cria automaticamente:

```
Email: admin@pizzaria.com
Senha: admin123
```

> ⚠️ **Troque a senha após o primeiro acesso!**

---

## 📡 Rotas da API

### 🌐 Rotas Públicas (sem autenticação)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/categorias` | Lista todas as categorias |
| `GET` | `/categorias/:id/itens` | Lista itens de uma categoria |
| `POST` | `/pedido` | Cria um novo pedido |
| `GET` | `/pedidos/cliente/:telefone` | Consulta pedidos por telefone |
| `GET` | `/entrega` | Retorna a taxa de entrega |
| `GET` | `/horarios` | Retorna os horários de funcionamento |
| `GET` | `/bordas` | Lista bordas disponíveis |
| `GET` | `/tipos-massa` | Lista tipos de massa disponíveis |

---

### 🔐 Rotas Administrativas (requer token JWT)

#### 🔑 Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/admin/login` | Realiza login e retorna o token |

#### 📂 Categorias
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/admin/categoria` | Cria uma categoria |
| `PUT` | `/admin/categoria/:id` | Edita uma categoria |
| `DELETE` | `/admin/categoria/:id` | Remove uma categoria |

#### 🍕 Itens
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/admin/items` | Lista todos os itens |
| `POST` | `/admin/item` | Cria um item |
| `PUT` | `/admin/item/:id` | Edita um item |
| `DELETE` | `/admin/item/:id` | Remove um item |
| `PATCH` | `/admin/item/:id/move` | Reordena um item (`up` ou `down`) |

#### 📋 Pedidos
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/admin/pedidos` | Lista pedidos ativos (status 1, 2 ou 3) |
| `GET` | `/admin/pedidos/historico` | Lista pedidos finalizados |
| `PUT` | `/admin/pedidos/:id/status` | Atualiza o status de um pedido |

#### 🚚 Entrega
| Método | Rota | Descrição |
|--------|------|-----------|
| `PUT` | `/admin/entrega/:id` | Atualiza a taxa de entrega |

#### 🕐 Horários
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/admin/horarios` | Salva os horários de funcionamento (7 dias) |

#### 🥖 Bordas
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/admin/bordas` | Lista todas as bordas |
| `POST` | `/admin/borda` | Cria uma borda |
| `PUT` | `/admin/borda/:id` | Edita uma borda |
| `DELETE` | `/admin/borda/:id` | Remove uma borda |

#### 🫓 Tipos de Massa
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/admin/tipos-massa` | Lista todos os tipos de massa |
| `POST` | `/admin/tipo-massa` | Cria um tipo de massa |
| `PUT` | `/admin/tipo-massa/:id` | Edita um tipo de massa |
| `DELETE` | `/admin/tipo-massa/:id` | Remove um tipo de massa |

#### 🪑 Mesas
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/admin/mesas` | Lista sessões de mesa abertas |
| `POST` | `/admin/sessao/:id/fechar` | Fecha a conta de uma mesa |

#### ⚙️ Configuração
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/admin/configuracao` | Retorna a configuração da loja |
| `PUT` | `/admin/configuracao/:id` | Atualiza o número de mesas |

---

## 🔒 Autenticação

As rotas administrativas exigem um **Bearer Token JWT** no header:

```http
Authorization: Bearer <seu_token>
```

O token é obtido via `POST /admin/login` e expira em **8 horas**.

---

## 📦 Status dos Pedidos

| Código | Status |
|--------|--------|
| `1` | 🔍 Em análise |
| `2` | ⏳ Na fila |
| `3` | ✅ Pronto para entrega |
| `4` | 🏁 Finalizado |
| `5` | ❌ Cancelado |

---

## 🪑 Sistema de Mesas (Dine-in)

Ao criar um pedido com o endereço no formato `Mesa: X`, o sistema detecta automaticamente que é um pedido de mesa e cria (ou reutiliza) uma sessão aberta para aquela mesa. Todos os pedidos da mesma sessão são agrupados até que a conta seja fechada pelo admin via `POST /admin/sessao/:id/fechar`.

```json
{
  "endereco": "Mesa: 5",
  "nomeCliente": "João",
  ...
}
```

---

## 🗄️ Banco de Dados

O banco é um arquivo SQLite local em `prisma/dev.db`. Para visualizar e editar os dados diretamente:

```bash
npx prisma studio
```

---

## 🔧 Dados Padrão (auto-criados)

Na primeira execução, os seguintes dados são inseridos automaticamente:

- 👤 **Admin:** `admin@pizzaria.com` / `admin123`
- 🕐 **Horários:** Seg fechado, demais dias 18h–22h/23h
- 🚚 **Taxa de entrega:** R$ 5,00
- 🥖 **Bordas:** Catupiry e Cheddar
- 🫓 **Tipos de massa:** Fina, Média e Grossa
- 🪑 **Mesas:** 10 mesas configuradas
