# PaintShop (Monorepo)

This repository contains:
- **PaintShopBackEnd** — ASP.NET Core Web API (.NET 8, EF Core, PostgreSQL/Supabase)
- **PaintShopFrontEnd** — Angular app

## Prerequisites
- .NET SDK 8
- Node.js + npm
- PostgreSQL connection (Supabase/Postgres)

## Project structure
- `PaintShopBackEnd/` — API
- `PaintShopFrontEnd/` — Frontend

---

## Backend (PaintShopBackEnd)

### 1) Restore dependencies
```bash
cd PaintShopBackEnd
dotnet restore
```

### 2) Configure local secrets (recommended)
Secrets must NOT be committed to git.

```bash
dotnet user-secrets set "ConnectionStrings:Postgres" "<YOUR_POSTGRES_CONNECTION_STRING>"
dotnet user-secrets set "Supabase:ProjectId" "<YOUR_SUPABASE_PROJECT_ID>"
dotnet user-secrets set "Supabase:JwtSecret" "<YOUR_SUPABASE_JWT_SECRET>"
```

Verify:
```bash
dotnet user-secrets list
```

### 3) Apply EF Core migrations (Supabase)
`dotnet ef` may not pick up `launchSettings.json`, so set the environment explicitly.

Linux/macOS:
```bash
ASPNETCORE_ENVIRONMENT=Development dotnet ef database update
```

Windows PowerShell:
```powershell
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet ef database update
```

### 4) Run the API
```bash
dotnet run --launch-profile http
```

- Swagger: http://localhost:5027/swagger

---

## Frontend (PaintShopFrontEnd)

### 1) Install dependencies
```bash
cd PaintShopFrontEnd
npm install
```

### 2) Run dev server
Option A (recommended):
```bash
npm start
```

Option B (equivalent):
```bash
ng serve
```

- Frontend: http://localhost:4200

Note: Backend CORS is configured for http://localhost:4200.
