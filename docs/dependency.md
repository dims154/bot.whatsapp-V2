# Dependency Architecture - Enterprise ERP Platform

## 1. Package Dependencies
- `express`: web server minimal dan stabil.
- `cors`: keamanan cross-origin.
- `helmet`: header keamanan HTTP.
- `dotenv`: environment configuration.
- `@prisma/client`: ORM MySQL.
- `bcrypt`: hashing password.
- `jsonwebtoken`: JWT auth.
- `socket.io`: realtime / notifikasi / dashboard event.
- `swagger-ui-express`: dokumentasi API.
- `tsyringe`: dependency injection layer.
- `uuid`: UUID generation.
- `winston`: logging dan audit.
- `zod`: schema validation.
- `multer`: file upload.

## 2. Dev Dependencies
- `typescript`: static typing.
- `ts-node-dev`: development runner.
- `ts-node`: runtime transpiler.
- `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-plugin-import`: linting.
- `prettier`, `eslint-config-prettier`: formatting.
- `prisma`: schema management.
- `@types/*`: type declarations.

## 3. Arsitektur Dependency
- Layer external dependencies: Express, Prisma, provider SDKs.
- Layer infrastructure: database service, provider adapters, logger.
- Layer domain: services, repositories, entities.
- Layer interface: controller, router, middleware.
- Dependency direction: controller -> service -> repository -> database/provider.
- Module loader / adapter factory menangani dependency injection top-down.

## 4. Dependency Pattern
- Gunakan `tsyringe` untuk dependency injection otomatis.
- Service dan repository di-inject ke controller.
- Provider adapter di-inject ke bot dan AI orchestration layer.
- Database service `prismaService` dipakai sebagai singleton.

## 5. Future Dependencies
- Provider SDKs: Meta WA Cloud, WAHA, Baileys, Telegram, Discord
- AI SDKs: OpenAI, Gemini, Claude, DeepSeek, OpenRouter
- Payment SDKs: Midtrans, Xendit, Tripay, Ipaymu
- Queue/Worker: BullMQ atau RabbitMQ
- Caching: Redis
- Observability: Prometheus, Grafana, OpenTelemetry

## 6. Notes
- Hindari dependensi langsung provider di business logic.
- Abstraksi provider harus minimal agar mudah mengganti tanpa memodifikasi domain core.
- Tambah `@prisma/client` hanya setelah `prisma generate` dan `prisma migrate`.
