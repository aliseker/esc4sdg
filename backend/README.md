# ESC4SDG Backend (.NET)

Backend API **bu klasörde** çalışır. Admin girişi ve JWT auth hazır.

## Proje yapısı

- `ESC4SDG.Api/` – ASP.NET Core Web API (.NET 10)
  - **Auth:** `POST /api/auth/login` (admin), `GET /api/auth/me` (JWT gerekli)
  - **Admin:** `GET /api/admin/dashboard` (JWT + Admin rolü gerekli)
  - JWT ayarları: `appsettings.json` → `Jwt`, admin kullanıcı: `Admin:Email`, `Admin:Password`

## Çalıştırma

```bash
cd backend/ESC4SDG.Api
dotnet run
```

Varsayılan: **http://localhost:5137**

## Admin giriş (varsayılan)

- **Email:** `admin@esc4sdg.local`
- **Şifre:** `Admin123!`

(Bunları `appsettings.json` veya `appsettings.Development.json` içinde değiştirebilirsin.)

## Frontend bağlantısı

Frontend (Next.js) admin paneli bu API’yi kullanır. Geliştirme ortamında:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5137`

Frontend’de `NEXT_PUBLIC_API_URL=http://localhost:5137` (isteğe bağlı, varsayılan zaten bu).

## Sonraki adımlar (plan)

- Authentication: JWT + refresh token
- Users / Profiles
- Courses / Modules / Lessons (CRUD)
- Quizzes / Attempts / Progress
- Certificates (tamamlama + doğrulama)

Frontend: `../frontend`
