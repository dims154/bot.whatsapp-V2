# Flow Diagram - Enterprise ERP Platform

## 1. User Login / Auth Flow
1. Client mengirim `POST /api/v1/auth/login`.
2. Auth controller memvalidasi kredensial.
3. Auth service mengeluarkan JWT dan refresh token.
4. Response berisi token dan context tenant/business.

## 2. API Request Flow
1. Request masuk ke Express.
2. Auth middleware memvalidasi JWT.
3. Tenant middleware mengekstrak `x-tenant-id` atau tenant claim.
4. Authorization middleware memeriksa role/permission.
5. Controller memanggil service layer.
6. Service memanggil repository layer.
7. Repository menggunakan Prisma untuk query DB.
8. Response dikembalikan ke client.

## 3. Bot WhatsApp Command Flow
1. Provider WhatsApp meneruskan pesan ke webhook `POST /api/v1/bot/webhook/whatsapp`.
2. Bot controller men-decode payload dan memanggil adapter provider.
3. Bot orchestrator memuat konfigurasi grup dari `GroupSetting`.
4. Perintah command dicocokkan dengan `Command` aktif.
5. Bot service menjalankan command handler jika aktif.
6. Command handler memanggil domain service / repository.
7. Hasil response dikirim kembali melalui adapter WhatsApp.

## 4. AI Prompt Flow
1. Client atau bot mengirim `POST /api/v1/ai/prompt`.
2. AI controller memvalidasi request.
3. AI service memilih provider melalui adapter factory.
4. Provider mengirim prompt ke API eksternal.
5. Provider menerima response dan menyimpan `AIEvent`.
6. Controller mengembalikan hasil ke client.

## 5. Payment Flow
1. Client memanggil `POST /api/v1/payments`.
2. Payment controller memvalidasi request.
3. Payment service memilih provider dan memproses pembayaran.
4. Provider mengembalikan `PaymentResponse`.
5. Payment log tersimpan di `PaymentLog`.
6. Status payment dikembalikan ke client.

## 6. Reporting / Periodic Calculation Flow
1. Scheduler atau cron job memicu kalkulasi laporan.
2. Reporting service mengambil transaksi, expense, payment, dan cash flow.
3. Service menghitung omzet, laba, pengeluaran, cash flow, dan KPI.
4. Hasil disimpan ke `DailyReport`, `MonthlyReport`, `YearlyReport`, dan `FinancialReport`.
5. Laporan dapat diakses oleh endpoint dashboard.

## 7. Module Activation Flow
1. Admin mengubah status module/command di dashboard.
2. Endpoint API mem-update field `active` di tabel `Command` atau `GroupSetting`.
3. Bot/orchestrator memuat ulang konfigurasi dari DB.
4. Hanya modul/command aktif yang dijalankan.

## 8. Multi-Tenant / Multi-Business Flow
1. Semua request membawa `tenantId` dan `businessId` dalam claims atau header.
2. Middleware memastikan resource berada di tenant/business yang benar.
3. Query repository menyaring berdasarkan `tenantId`/`businessId`.
4. Data isolasi tenant dipertahankan di semua layer.
