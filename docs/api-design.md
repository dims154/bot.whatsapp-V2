# API Design - Enterprise ERP Platform

## 1. Prinsip Desain API
- RESTful, versioned, dan resource-oriented.
- Semua endpoint berada di bawah `/api/v1/`.
- Autentikasi menggunakan JWT dan refresh token.
- Otorisasi berbasis role/permission dan tenant-aware.
- Semua konfigurasi modul, provider, dan group disimpan di database.
- Provider WhatsApp, AI, dan payment diabstraksi melalui adapter; endpoint core tidak bergantung pada provider spesifik.
- Validasi request menggunakan Zod atau schema validator serupa.
- Respon API konsisten:
  - `200 OK` untuk sukses
  - `201 Created` untuk pembuatan resource
  - `400 Bad Request` untuk validasi input
  - `401 Unauthorized` untuk autentikasi gagal
  - `403 Forbidden` untuk otorisasi gagal
  - `404 Not Found` untuk resource tidak ada
  - `500 Internal Server Error` untuk kesalahan server

## 2. Header dan Multi-Tenancy
- `Authorization: Bearer <jwt>`
- `x-tenant-id: <tenantId>` untuk request multi-tenant eksplisit.
- Tenant dan business dikaitkan dalam token claims jika user bersifat cross-tenant.
- Service layer selalu memeriksa `tenantId` dan `businessId` terhadap resource.

## 3. Struktur Endpoint Utama

### 3.1. Auth
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/register` (opsional, jika self-signup diizinkan)

### 3.2. Tenant & Business
- `GET /api/v1/tenants`
- `GET /api/v1/tenants/:id`
- `POST /api/v1/tenants`
- `PATCH /api/v1/tenants/:id`
- `DELETE /api/v1/tenants/:id`

- `GET /api/v1/businesses`
- `GET /api/v1/businesses/:id`
- `POST /api/v1/businesses`
- `PATCH /api/v1/businesses/:id`
- `DELETE /api/v1/businesses/:id`

### 3.3. User, Role, Permission
- `GET /api/v1/users`
- `GET /api/v1/users/:id`
- `POST /api/v1/users`
- `PATCH /api/v1/users/:id`
- `DELETE /api/v1/users/:id`
- `PATCH /api/v1/users/:id/roles`
- `PATCH /api/v1/users/:id/permissions`

- `GET /api/v1/roles`
- `POST /api/v1/roles`
- `PATCH /api/v1/roles/:id`
- `DELETE /api/v1/roles/:id`

- `GET /api/v1/permissions`
- `POST /api/v1/permissions`
- `PATCH /api/v1/permissions/:id`
- `DELETE /api/v1/permissions/:id`

### 3.4. Provider & Channel
- `GET /api/v1/providers`
- `POST /api/v1/providers`
- `PATCH /api/v1/providers/:id`
- `DELETE /api/v1/providers/:id`

- `GET /api/v1/channels`
- `POST /api/v1/channels`
- `PATCH /api/v1/channels/:id`
- `DELETE /api/v1/channels/:id`

### 3.5. Group & Group Configuration
- `GET /api/v1/groups`
- `GET /api/v1/groups/:id`
- `POST /api/v1/groups`
- `PATCH /api/v1/groups/:id`
- `DELETE /api/v1/groups/:id`

- `GET /api/v1/groups/:id/settings`
- `PATCH /api/v1/groups/:id/settings`

- `GET /api/v1/groups/:id/commands`
- `POST /api/v1/groups/:id/commands`
- `PATCH /api/v1/commands/:id`
- `DELETE /api/v1/commands/:id`

### 3.6. Customer Relationship Management (CRM)
- `GET /api/v1/customers`
- `GET /api/v1/customers/:id`
- `POST /api/v1/customers`
- `PATCH /api/v1/customers/:id`
- `DELETE /api/v1/customers/:id`

- `GET /api/v1/customers/:id/vehicles`
- `POST /api/v1/customers/:id/vehicles`
- `PATCH /api/v1/vehicles/:id`
- `DELETE /api/v1/vehicles/:id`

### 3.7. Product & Inventory
- `GET /api/v1/categories`
- `POST /api/v1/categories`
- `PATCH /api/v1/categories/:id`
- `DELETE /api/v1/categories/:id`

- `GET /api/v1/products`
- `GET /api/v1/products/:id`
- `POST /api/v1/products`
- `PATCH /api/v1/products/:id`
- `DELETE /api/v1/products/:id`

- `GET /api/v1/inventory`
- `GET /api/v1/inventory/:id`
- `POST /api/v1/inventory`
- `PATCH /api/v1/inventory/:id`
- `DELETE /api/v1/inventory/:id`

- `POST /api/v1/inventory/:id/logs`
- `GET /api/v1/inventory/:id/logs`

### 3.8. Orders & Transactions
- `GET /api/v1/orders`
- `GET /api/v1/orders/:id`
- `POST /api/v1/orders`
- `PATCH /api/v1/orders/:id`
- `DELETE /api/v1/orders/:id`

- `GET /api/v1/transactions`
- `GET /api/v1/transactions/:id`
- `POST /api/v1/transactions`
- `PATCH /api/v1/transactions/:id`

- `GET /api/v1/orders/:id/items`
- `POST /api/v1/orders/:id/items`
- `PATCH /api/v1/order-items/:id`
- `DELETE /api/v1/order-items/:id`

- `GET /api/v1/transactions/:id/items`
- `POST /api/v1/transactions/:id/items`
- `PATCH /api/v1/transaction-items/:id`
- `DELETE /api/v1/transaction-items/:id`

### 3.9. Payment
- `GET /api/v1/payments`
- `GET /api/v1/payments/:id`
- `POST /api/v1/payments`
- `PATCH /api/v1/payments/:id`
- `DELETE /api/v1/payments/:id`
- `GET /api/v1/payments/:id/logs`

### 3.10. Ticketing & Broadcast
- `GET /api/v1/tickets`
- `GET /api/v1/tickets/:id`
- `POST /api/v1/tickets`
- `PATCH /api/v1/tickets/:id`
- `DELETE /api/v1/tickets/:id`

- `GET /api/v1/broadcasts`
- `GET /api/v1/broadcasts/:id`
- `POST /api/v1/broadcasts`
- `PATCH /api/v1/broadcasts/:id`
- `DELETE /api/v1/broadcasts/:id`

### 3.11. Expense & Financial Reporting
- `GET /api/v1/expense-categories`
- `POST /api/v1/expense-categories`
- `PATCH /api/v1/expense-categories/:id`
- `DELETE /api/v1/expense-categories/:id`

- `GET /api/v1/expenses`
- `POST /api/v1/expenses`
- `PATCH /api/v1/expenses/:id`
- `DELETE /api/v1/expenses/:id`

- `GET /api/v1/cash-flow`
- `POST /api/v1/cash-flow`
- `PATCH /api/v1/cash-flow/:id`
- `DELETE /api/v1/cash-flow/:id`

- `GET /api/v1/reports/daily`
- `GET /api/v1/reports/monthly`
- `GET /api/v1/reports/yearly`
- `GET /api/v1/reports/financial`
- `GET /api/v1/reports/summary`

### 3.12. AI & Assistant
- `POST /api/v1/ai/prompt`
- `GET /api/v1/ai/providers`
- `POST /api/v1/ai/providers/:id/test`
- `GET /api/v1/ai/logs`

### 3.13. Bot & Command
- `POST /api/v1/bot/commands/execute`
- `GET /api/v1/bot/commands`
- `GET /api/v1/bot/commands/:id`
- `GET /api/v1/bot/groups/:groupId/settings`
- `POST /api/v1/bot/webhook/whatsapp`
- `POST /api/v1/bot/webhook/ai`

### 3.14. Dashboard / Admin Data
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/omzet`
- `GET /api/v1/dashboard/finance`
- `GET /api/v1/dashboard/inventory`
- `GET /api/v1/dashboard/tickets`

## 4. DTO & Schema Validation
Untuk setiap resource, dianjurkan membuat DTO berikut:
- `CreateXDto`
- `UpdateXDto`
- `QueryXDto` untuk filtering/pagination
- `ResponseXDto` untuk output standar

Contoh struktur `CreateTransactionDto`:
- `businessId`
- `customerId?`
- `channelId?`
- `type`
- `status`
- `totalAmount`
- `paymentMethod?`
- `items: [{ productId, quantity, unitPrice, metadata? }]`

## 5. Response Standard
Semua response mengikuti pola:
```json
{
  "status": "success",
  "data": { ... }
}
```
atau
```json
{
  "status": "error",
  "message": "Deskripsi kesalahan",
  "errors": [ ... ]
}
```

## 6. Module Activation dan Dynamic Commands
- `Command` dan `GroupSetting` tersimpan di DB.
- Endpoint API dapat mengaktifkan/menonaktifkan module dan command melalui field `active`.
- Bot hanya mengeksekusi command yang aktif pada business/group sesuai konfigurasi.

## 7. Swagger dan Dokumentasi
- Dokumentasi API akan tersedia di `/api/docs`.
- Endpoint disusun untuk memudahkan file OpenAPI auto-generated dari definisi route/DTO.

## 8. Notes untuk Implementasi
- Authentication middleware validasi JWT dan tenant context.
- Authorization middleware memeriksa role/permission pada route.
- Provider adapter injection untuk WhatsApp, AI, dan payment melalui service layer.
- Scheduler atau worker terpisah dapat menjalankan perhitungan laporan harian/bulanan.
- Bot webhook endpoint hanya meneruskan payload ke orchestrator domain tanpa provider-specific logic.

## 9. Route Structure yang Direkomendasikan
```
src/apps/api/
  api.router.ts
  auth.router.ts
  tenant.router.ts
  business.router.ts
  users.router.ts
  roles.router.ts
  permissions.router.ts
  providers.router.ts
  channels.router.ts
  groups.router.ts
  customers.router.ts
  products.router.ts
  inventory.router.ts
  orders.router.ts
  transactions.router.ts
  payments.router.ts
  tickets.router.ts
  broadcasts.router.ts
  expenses.router.ts
  reports.router.ts
  ai.router.ts
  bot.router.ts
  dashboard.router.ts
```

Setiap router akan mengimport controller dan validator untuk menegakkan clean architecture.
