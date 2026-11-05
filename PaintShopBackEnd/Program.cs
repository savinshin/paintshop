using Microsoft.EntityFrameworkCore;
using PaintShopBackEnd.Infrastructure.Data;
using PaintShopBackEnd.Domain.Interfaces;
using PaintShopBackEnd.Infrastructure.Data.Repositories;
using AutoMapper;
using PaintShopBackEnd.Application.Mappings;
using PaintShopBackEnd.Application.Interfaces;
using PaintShopBackEnd.Application.Services;
using PaintShopBackEnd.WebApi.Mappings;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.DataProtection;
using System.Threading.RateLimiting;
using FluentValidation;
using PaintShopBackEnd.WebApi.Models.Categories;
using PaintShopBackEnd.WebApi.Models.Products;
using PaintShopBackEnd.WebApi.Validation.Categories;
using PaintShopBackEnd.WebApi.Validation.Products;
using PaintShopBackEnd.Infrastructure.Data.Seeding;
using PaintShopBackEnd.Infrastructure.Auth;

var seedCommand = args.Length > 0 && (args[0] is "seed" or "seed-demo" or "create-admin") ? args[0] : null;
var builder = WebApplication.CreateBuilder(seedCommand is null ? args : args[1..]);

if (seedCommand == "seed-demo")
{
    var dotnetEnvironment = Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT");
    var aspnetEnvironment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
    var launchProfile = Environment.GetEnvironmentVariable("DOTNET_LAUNCH_PROFILE");

    if (!builder.Environment.IsDevelopment()
        || (!string.IsNullOrEmpty(dotnetEnvironment) && !dotnetEnvironment.Equals("Development", StringComparison.OrdinalIgnoreCase))
        || (!string.IsNullOrEmpty(aspnetEnvironment) && !aspnetEnvironment.Equals("Development", StringComparison.OrdinalIgnoreCase))
        || !string.IsNullOrEmpty(launchProfile))
    {
        Console.Error.WriteLine("seed-demo requires Development and no launch profile. Use dotnet run --no-launch-profile -- seed-demo.");
        Environment.ExitCode = 1;
        return;
    }
}

// Controllers + Validation + Swagger
builder.Services.AddControllers(options => options.Filters.Add(new AutoValidateAntiforgeryTokenAttribute()));

builder.Services.AddScoped<IValidator<CreateProductRequest>, CreateProductRequestValidator>();
builder.Services.AddScoped<IValidator<UpdateProductRequest>, UpdateProductRequestValidator>();
builder.Services.AddScoped<IValidator<CreateCategoryRequest>, CreateCategoryRequestValidator>();
builder.Services.AddScoped<IValidator<UpdateCategoryRequest>, UpdateCategoryRequestValidator>();

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
            "https://paintshop-frontend-production.up.railway.app"
        )
        .AllowAnyHeader()
        .AllowAnyMethod());
});

builder.Services.AddIdentity<IdentityUser, IdentityRole>(options =>
{
    options.User.RequireUniqueEmail = true;
    options.Password.RequiredLength = 12;
    options.Lockout.AllowedForNewUsers = true;
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
}).AddEntityFrameworkStores<AppDbContext>();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = builder.Environment.IsDevelopment() ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
    options.ExpireTimeSpan = TimeSpan.FromHours(8);
    options.SlidingExpiration = false;
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };
});

builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-XSRF-TOKEN";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = builder.Environment.IsDevelopment() ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("login", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 10, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
});

var dataProtection = builder.Services.AddDataProtection().SetApplicationName("PaintShop");
var keyPath = builder.Configuration["DataProtection:KeyPath"];
if (!string.IsNullOrWhiteSpace(keyPath))
    dataProtection.PersistKeysToFileSystem(new DirectoryInfo(keyPath));

builder.Services.AddAuthorization(opt =>
{
    opt.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
});


var app = builder.Build();

if (seedCommand is not null)
{
    await using var scope = app.Services.CreateAsyncScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    if (seedCommand == "create-admin")
        Environment.ExitCode = await AdminCreator.RunAsync(scope.ServiceProvider, db);
    else if (seedCommand == "seed")
        await CategorySeeder.SeedAsync(db);
    else
        await DemoProductSeeder.SeedAsync(db);

    return;
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("frontend");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
// app.MapGet("/health", () => "ok");

app.Run();
