# Relasi Database - Enterprise ERP Platform

## 1. Tenant dan Business
- Tenant 1..* Business
- Business memiliki `tenantId`
- Tenant menampung organisasi SaaS multi-tenant

## 2. Business dan Domain Bisnis
- Business 1..* Group
- Business 1..* Customer
- Business 1..* Product
- Business 1..* Order
- Business 1..* Transaction
- Business 1..* Channel
- Business 1..* Ticket
- Business 1..* Broadcast
- Business 1..* Expense
- Business 1..* Inventory
- Business 1..* CashFlow
- Business 1..* DailyReport
- Business 1..* MonthlyReport
- Business 1..* YearlyReport
- Business 1..* FinancialReport
- Business 1..* AIEvent

## 3. User, Role, Permission, Admin
- User 1..* Session
- User 1..* ActivityLog
- User N..M Role via relation `UserRoles`
- User N..M Permission via relation `UserPermissions`
- Role N..M Permission via relation `RolePermissions`
- Admin 1..1 User
- Admin 1..1 Business

## 4. Group dan Konfigurasi
- Group 1..* GroupSetting
- Group 1..* Channel
- Group 1..* Command
- Group memiliki `businessId`

## 5. Channel dan Session
- Channel 1..* Session
- Channel 1..* Message
- Channel memiliki `providerId`
- Provider 1..* Channel

## 6. Message dan Komunikasi
- Session 1..* Message
- Message memiliki `sessionId`

## 7. Produk, Kategori, Order, Transaction
- Category 1..* Product
- Product 1..* OrderItem
- Product 1..* TransactionItem
- Order 1..* OrderItem
- Order 1..* Payment
- Transaction 1..* TransactionItem
- TransactionItem memiliki `productId`
- Product 1..* Inventory

## 8. Pembayaran
- Payment 1..* PaymentLog
- Payment optional terkait `Order`
- Payment memiliki `providerId`

## 9. CRM dan Layanan
- Customer 1..* Ticket
- Customer 1..* Vehicle
- Customer N..M Group via relation `CustomerGroups`
- Customer optional pada `Order`
- Service milik Business

## 10. Expense dan Finance
- ExpenseCategory 1..* Expense
- Expense milik Business
- CashFlow milik Business

## 11. SDM dan Operasional
- Employee 1..* Attendance
- Employee 1..* Salary
- Employee 1..1 User

## 12. Pelaporan
- DailyReport, MonthlyReport, YearlyReport, FinancialReport milik Business

## 13. Audit dan Aktivitas
- ActivityLog 1..1 User
- AuditLog optional 1..1 User
- AIEvent 1..1 Business dan 1..1 Provider

## 14. Keterangan Spesifik
- `GroupSetting` dan `Setting` menyimpan konfigurasi dinamis, sehingga fitur modul aktif/dinonaktif dan pengaturan grup dapat ditarik dari database.
- `Provider` abstrak memungkinkan adapter WhatsApp/Ai/Payment dibangun tanpa mengubah domain.
- `CustomerGroups` many-to-many berguna untuk skenario CRM dan segmentasi pelanggan.
