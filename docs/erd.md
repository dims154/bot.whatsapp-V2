# ERD Database - Enterprise ERP Platform

## 1. Overview
Platform ini dirancang sebagai multi-tenant ERP ringan dengan domain bisnis, bot WhatsApp, AI, payment, reporting, dan modul plug-in.
Database model menekankan:
- multi-tenant dan multi-business
- pemisahan tenant, business, user, dan role/permission
- hubungan channel/provider untuk WhatsApp dan messaging
- pencatatan transaksi, orders, payments, tickets, broadcast, inventory, dan laporan
- audit, aktivitas, dan AI event logging

## 2. Multi-Tenant Core
- Tenant
  - `Tenant` menyimpan master tenant/organisasi.
  - `Business` adalah unit bisnis di dalam tenant.
  - `User` terkait ke `Tenant`. Satu user bisa memiliki beberapa role/permission.
  - `Setting` menyimpan konfigurasi yang dapat di-scope berdasarkan tenant.

Relasi:
- Tenant 1..* Business
- Tenant 1..* User
- Tenant 1..* Setting

## 3. User, Role, Permission, dan Admin
- `User` menyimpan kredensial dan profil.
- `Role` dan `Permission` dipakai untuk otorisasi.
- Relasi many-to-many antara User-Role dan User-Permission.
- `Admin` mengaitkan user dengan business sebagai administrator khusus.

## 4. Group, Channel, Provider, dan Command
- `Group` milik Business dan punya `GroupSetting`, `Channel`, `Command`.
- `GroupSetting` menyimpan konfigurasi grup secara key/value, sehingga tidak ada hardcode `if(group == 'A')`.
- `Channel` terhubung ke `Provider` dan menyimpan konfigurasi provider messaging.
- `Provider` umum untuk WhatsApp/Ai/Payment, memudahkan adapter pattern.
- `Session` dan `Message` menyimpan history komunikasi per channel.

Relasi kunci:
- Business 1..* Group
- Business 1..* Channel
- Channel 1..* Session
- Session 1..* Message
- Business 1..* Command

## 5. Produk, Order, Transaction, dan Inventory
- `Category` mengelompokkan `Product`.
- `Order` memiliki `OrderItem` dan dapat berhubungan ke `Payment`.
- `Transaction` memiliki `TransactionItem` untuk pencatatan kasir/per transaksi.
- `Inventory` berkaitan dengan `Product` dan mencatat `InventoryLog`.

Relasi kunci:
- Business 1..* Product
- Product 1..* OrderItem
- Product 1..* TransactionItem
- Order 1..* OrderItem
- Order 1..* Payment
- Transaction 1..* TransactionItem
- Business 1..* Inventory
- Inventory 1..* InventoryLog

## 6. Finance, Expense, Cash Flow, dan Reporting
- `Payment`, `Expense`, `CashFlow` menyimpan data finansial operasional.
- `Expense` dikategorikan oleh `ExpenseCategory`.
- `DailyReport`, `MonthlyReport`, `YearlyReport`, dan `FinancialReport` menampung output laporan dalam bentuk JSON.

## 7. CRM dan Service
- `Customer` milik Business dan dapat berhubungan ke `Group`.
- `Vehicle` milik Customer dan cocok untuk kasus bot kasir steam motor.
- `Service` menyimpan layanan yang dapat dipakai sebagai produk atau paket.
- `Ticket` terkait ke Customer untuk modul customer service.

## 8. SDM dan Operasional
- `Employee` mengaitkan user internal ke bisnis.
- `Attendance` dan `Salary` menyimpan absensi serta gaji.

## 9. Audit dan Aktivitas
- `ActivityLog` mencatat aksi user.
- `AuditLog` menyimpan perubahan dan target objek.
- `AIEvent` menangkap interaksi AI yang dipanggil platform.

## 10. Keterangan Relasi Utama
- `Business` adalah entitas pusat untuk hampir semua domain dan mendukung `Multi Business`.
- `Tenant` adalah entitas super untuk mendukung SaaS multi-tenant.
- Semua konfigurasi grup dan modul dapat disimpan dalam `GroupSetting`, `Provider`, `Setting`, dan `Command`.
- Komando (`Command`) bersifat modul dan dapat diaktifkan/dinonaktifkan dari database.

## 11. Catatan Desain ERD
- Model menggunakan UUID untuk primary key.
- `Json` field dipakai untuk metadata fleksibel dan konfigurasi dinamis.
- Relasi banyak-ke-banyak di Role/Permission dan Customer-Group dirancang untuk fleksibilitas modul.
- `Provider` terpisah memungkinkan adapter provider diganti tanpa mengubah domain business.
