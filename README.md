# Task Tracker

> **Not:** Bu proje hâlâ geliştirme aşamasındadır.

**ASP.NET Core Web API (.NET 10)** ile **Clean Architecture** prensiplerine uygun olarak geliştirilmiş, **React + Vite** frontend'e sahip bir Görev/Proje Yönetim Sistemi.

## Tech Stack

- **ASP.NET Core Web API** - RESTful API
- **Entity Framework Core** - ORM (PostgreSQL)
- **JWT Authentication** - Token tabanlı kimlik doğrulama
- **AutoMapper** - DTO dönüşümleri
- **FluentValidation** - Input validasyonu
- **Swagger / OpenAPI** - API dokümantasyonu
- **SignalR** - Gerçek zamanlı bildirimler
- **Docker** - Containerize dağıtım
- **React + Vite + TypeScript** - Modern SPA frontend

## Mimari (Clean Architecture)

```
TaskTracker.API           → Controller'lar, Program.cs, SignalR Hub
TaskTracker.Application    → DTO'lar, Interface'ler, Validator'lar, AutoMapper Profilleri
TaskTracker.Domain         → Entity'ler, Enum'lar
TaskTracker.Infrastructure → DbContext, Entity Konfigürasyonları, Servis Implementasyonları
client                    → React + Vite + TypeScript frontend
```

### Bağımlılık Akışı

```
API → Application → Domain
API → Infrastructure → Application → Domain
Frontend (React) → API (REST + SignalR)
```

## Özellikler

### Kimlik Doğrulama
- JWT ile kullanıcı kayıt & giriş
- BCrypt ile şifre hashleme

### Projeler
- Proje oluşturma, listeleme, detay görüntüleme, silme
- Rol tabanlı üye ekleme/çıkarma (Admin/Member)
- Sayfalama, arama ve sıralama

### Görevler
- Görev oluşturma, güncelleme, silme (To Do / In Progress / Done)
- Proje üyelerine görev atama
- Öncelik seviyeleri (Low / Medium / High)
- Filtreleme, sayfalama ve sıralama

### Yorumlar
- Görevlere yorum ekleme
- Kendi yorumlarını silme

### Gerçek Zamanlı (SignalR)
- Görev oluşturma/güncelleme/silme anında bildirim
- Yorum eklendiğinde anlık uyarı

### Frontend (React)
- Kayıt / Giriş ekranı
- Proje listesi (dashboard) ve istatistikler
- Kanban tarzı görev panosu (duruma göre kolonlar)
- Görev detayı: durum/öncelik/atanan kişi değiştirme
- Üye yönetimi (ekleme/çıkarma)
- Görev yorumları
- SignalR ile gerçek zamanlı güncellemeler
- Modern koyu tema, tamamen Türkçe arayüz

## Proje Yapısı

```
├── TaskTracker.slnx
├── Dockerfile
├── docker-compose.yml
├── TaskTracker.API/
│   ├── Controllers/
│   ├── Hubs/
│   ├── Program.cs
│   └── appsettings.json
├── TaskTracker.Application/
│   ├── DTOs/
│   ├── Interfaces/
│   ├── Mappings/
│   ├── Validators/
│   └── DependencyInjection.cs
├── TaskTracker.Domain/
│   ├── Entities/
│   └── Enums/
├── TaskTracker.Infrastructure/
│   ├── Data/
│   │   ├── Configurations/
│   │   └── ApplicationDbContext.cs
│   ├── Services/
│   └── DependencyInjection.cs
└── client/
    ├── src/
    │   ├── api/        → REST istemcisi
    │   ├── components/ → UI bileşenleri (Layout, Modal, TaskDetailModal)
    │   ├── context/    → Auth & Toast context
    │   ├── hooks/      → SignalR hook
    │   ├── pages/      → Login, Register, Dashboard, ProjectPage
    │   └── types.ts    → TypeScript tip tanımları
    ├── index.html
    └── vite.config.ts
```

## Çalıştırma

### API + Veritabanı (Docker ile)

```bash
docker-compose up
```

API varsayılan olarak `http://localhost:8080` üzerinde çalışır, Swagger UI: `http://localhost:8080/swagger`

### API (Lokal, Docker olmadan)

PostgreSQL'in çalışıyor olduğundan emin ol, ardından:

```bash
cd TaskTracker.API
dotnet run --urls http://localhost:8080
```

### Frontend

API çalışırken (8080 portunda), ayrı bir terminalde:

```bash
cd client
npm install
npm run dev
```

Frontend varsayılan olarak `http://localhost:5173` üzerinde çalışır. `/api` ve `/hubs` istekleri Vite dev server üzerinden `http://localhost:8080` adresine yönlendirilir (proxy).

> **Not:** Veritabanı tabloları `EnsureCreated` ile uygulama ilk açılışta otomatik oluşturulur.
