# PaintShop

ASP.NET Core Web API (.NET 10), Angular 22, PostgreSQL 18. Local development with Docker Compose.

## ENV

```bash
cp .env.example .env
```

Set `POSTGRES_PASSWORD` in `.env`.

## Docker

```bash
docker compose up -d --build
```

## Database migrations

```bash
docker compose exec backend dotnet ef database update
```

## Admin

```bash
docker compose run --rm backend dotnet run --no-launch-profile -- create-admin
```

## Categories seed

```bash
docker compose run --rm backend dotnet run --no-launch-profile -- seed
```

## Development seed data (optional)

```bash
docker compose run --rm backend dotnet run --no-launch-profile -- seed-demo
```

## Check backend:

http://localhost:5027/swagger

## Check frontend:

http://localhost:4200/