using Microsoft.EntityFrameworkCore;
using PaintShopBackEnd.Infrastructure.Data;
using PaintShopBackEnd.Domain.Interfaces;
using PaintShopBackEnd.Infrastructure.Data.Repositories;
using AutoMapper;
using PaintShopBackEnd.Application.Mappings;
using PaintShopBackEnd.Application.Interfaces;
using PaintShopBackEnd.Application.Services;
using PaintShopBackEnd.WebApi.Mappings;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Controllers + Validation + Swagger
builder.Services.AddControllers();

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DB
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Postgres")));

builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IProductService, ProductService>();


builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICategoryService, CategoryService>();

builder.Services.AddAutoMapper(cfg => { },
    typeof(ProductApiMappingProfile).Assembly,
    typeof(CategoryMappingProfile).Assembly
);

// CORS для фронта (Angular dev)
builder.Services.AddCors(o =>
{
    o.AddPolicy("frontend", p => p
        .WithOrigins(
            "http://localhost:4200",
            "https://paintshopfrontend-production.up.railway.app"
        )
        .AllowAnyHeader()
        .AllowAnyMethod());
});

// === Supabase JWT ===
var projectRef = builder.Configuration["Supabase:ProjectId"];
var jwtSecret  = builder.Configuration["Supabase:JwtSecret"]; // добавим в user-secrets

if (string.IsNullOrWhiteSpace(projectRef))
    Console.WriteLine("WARN: Supabase:ProjectId not set. Auth issuer will not validate correctly.");

if (string.IsNullOrWhiteSpace(jwtSecret))
    Console.WriteLine("WARN: Supabase:JwtSecret not set. JWT signature validation will fail.");

var authority = $"https://{projectRef}.supabase.co/auth/v1";

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = authority,

            ValidateAudience = false,

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSecret ?? string.Empty))
        };
    });

builder.Services.AddAuthorization(opt =>
{
    // AdminOnly: app_metadata.role == "admin"
    opt.AddPolicy("AdminOnly", policy =>
        policy.RequireAssertion(ctx =>
        {
            var meta = ctx.User.FindFirst("app_metadata");
            if (meta is null) return false;

            // простая проверка JSON-строки
            return meta.Value.Contains("\"role\":\"admin\"", StringComparison.OrdinalIgnoreCase);
        }));
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();
app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
// app.MapGet("/health", () => "ok");

app.Run();
