# Capone

# 🧠 API de Gestão (Users, Customers, Products, Orders)

API RESTful desenvolvida com **Node.js + Express + TypeORM**, conectada a um banco de dados relacional (ex: PostgreSQL, MySQL ou SQLite).  
O projeto inclui autenticação com **JWT**, controle de acesso por **papéis (roles)** e operações completas de **CRUD**.

---

## 🚀 Tecnologias Utilizadas

- **Node.js**
- **Express**
- **TypeORM**
- **TypeScript**
- **JWT (jsonwebtoken)**
- **Bcrypt** (hash de senha)
- **Postgres**
- **Dotenv**

---

## 📦 Estrutura do Projeto

```
src/
 ├─ database/
 │   └─ data-source.ts
 ├─ entities/
 │   ├─ User.ts
 │   ├─ Customer.ts
 │   ├─ Product.ts
 │   └─ Order.ts
 ├─ middlewares/
 │   └─ auth.middleware.ts
 ├─ routes/
 │   ├─ auth.routes.ts
 │   ├─ user.routes.ts
 │   ├─ customer.routes.ts
 │   ├─ product.routes.ts
 │   └─ order.routes.ts
 ├─ app.ts
 └─ server.ts
```

---

## ⚙️ Configuração

1. Clone o repositório:
   ```bash
   git clone https://https://github.com/LuisFernando029/Capone.git
   cd seu-repo
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente no arquivo `.env`:
   ```env
   JWT_SECRET=sua_chave_secreta
   ```

4. Execute as migrations (se houver):
   ```bash
   npm run typeorm migration:run
   ```

5. Inicie o servidor:
   ```bash
   npm run dev
   ```
   O servidor iniciará em **http://localhost:4000**

---

## 🔐 Rotas Principais

### Autenticação
| Método | Rota | Descrição |
|--------|-------|-----------|
| `POST` | `/auth/register` | Cria um novo usuário |
| `POST` | `/auth/login` | Faz login e retorna o token JWT |

### Usuários
| Método | Rota | Descrição |
|--------|-------|-----------|
| `GET` | `/users/me` | Retorna o usuário logado |
| `GET` | `/users/:id` | Retorna usuário por ID (apenas admin ou o próprio) |
| `GET` | `/users` | Lista todos os usuários (somente admin) |
| `PATCH` | `/users/:id` | Atualiza usuário |
| `DELETE` | `/users/:id` | Remove usuário (somente admin) |

> ⚠️ Todas as rotas (exceto `/auth`) exigem token JWT no header:
> ```
> Authorization: Bearer <seu_token>
> ```

---

## 🧪 Teste rápido (via cURL ou Postman)

1. **Registrar usuário**
   ```bash
   POST http://localhost:4000/auth/register
   {
     "name": "Admin",
     "email": "admin@teste.com",
     "role": "admin",
     "password": "123456"
   }
   ```

2. **Login**
   ```bash
   POST http://localhost:4000/auth/login
   {
     "email": "admin@teste.com",
     "password": "123456"
   }
   ```

3. **Usar token**
   ```bash
   GET http://localhost:4000/users/me
   Header: Authorization: Bearer <token>
   ```

---


