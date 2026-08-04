# Design Pattern - Enterprise ERP Platform

## 1. Clean Architecture
- Memisahkan code menjadi layer:
  - Presentation: controller, middleware, routes
  - Application: service, use case
  - Domain: model, entity, interface
  - Infrastructure: repository, database, provider adapter
- Dependensi hanya mengarah ke dalam, bukan keluar.
- Setiap layer berkomunikasi lewat kontrak/interface.

## 2. SOLID
- Single Responsibility: setiap class/service hanya satu alasan untuk berubah.
- Open/Closed: fitur baru ditambahkan lewat modul dan adapter tanpa mengubah core.
- Liskov Substitution: interface provider dapat diganti tanpa memecahkan code.
- Interface Segregation: interface kecil untuk WhatsApp, AI, payment.
- Dependency Inversion: controller bergantung pada abstraksi, bukan implementasi.

## 3. Repository Pattern
- `IRepository<T>` mendefinisikan operasi data standar.
- `BaseRepository` menyediakan kontrak umum untuk implementasi repository Prisma.
- Repositori hanya bertanggung jawab terhadap persisten data.

## 4. Service Layer
- Service menangani logika bisnis dan orchestration.
- Controller bertugas menerima request, validasi, dan memanggil service.
- Service memanggil repository, provider adapter, dan util business lain.

## 5. Dependency Injection
- `tsyringe` akan dipakai untuk injeksi service/repository/provider.
- Singleton `prismaService` digunakan untuk koneksi DB.
- Controller dan service dibuat lebih mudah diuji melalui injeksi dependensi.

## 6. Adapter Pattern
- Provider WhatsApp, AI, dan payment di-abstraksi lewat interface.
- Implementasi provider dikemas dalam adapter yang bisa diganti.
- Core business logic memanggil adapter melalui interface umum.

## 7. Factory Pattern
- Factory digunakan untuk memilih provider berdasarkan `type` atau konfigurasi.
- Contoh: `AIProviderFactory`, `PaymentProviderFactory`, `WhatsAppProviderFactory`.

## 8. Strategy Pattern
- Command bot dibangun dengan strategi untuk setiap command.
- `CommandHandler` memilih strategi dari registry berdasarkan nama command.
- Pola ini mendukung `menu`, `order`, `payment`, `ticket`, `broadcast`, `laporan`, `omzet`, dan lain-lain.

## 9. Feature-Based Architecture
- Folder `apps/` menyimpan domain feature utama.
- Folder `modules/` menyimpan plugin/extension module.
- Setiap modul memiliki controller, service, repository, routes, validator, dto, interfaces, types.

## 10. Domain-Driven Design
- Entitas `Business`, `Customer`, `Order`, `Transaction`, `Group`, `Provider` menjadi fondasi domain.
- Kontrak modul dan provider dikembangkan berdasarkan batasan domain.
- Logika domain dipisah dari detail teknis seperti Express atau provider SDK.

## 11. Modular Activation
- `Command` dan `GroupSetting` di database mengendalikan fitur aktif/non-aktif.
- Module loader memuat modul yang aktif berdasarkan metadata dan konfigurasi DB.
- Tidak ada hardcode untuk nama grup atau modul.
