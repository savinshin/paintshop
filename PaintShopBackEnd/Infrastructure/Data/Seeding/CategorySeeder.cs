using Microsoft.EntityFrameworkCore;
using PaintShopBackEnd.Domain.Entities;

namespace PaintShopBackEnd.Infrastructure.Data.Seeding;

public static class CategorySeeder
{
    private static readonly (string Name, string Slug, string? ParentSlug, int SortOrder)[] Categories =
    [
        ("Автозапчасти", "avtozapchasti", null, 1),
        ("Материалы", "materialy", null, 2),

        ("Фильтры масляные", "filtry-maslyanye", "avtozapchasti", 1),
        ("Тормозные жидкости", "tormoznye-zhidkosti", "avtozapchasti", 2),
        ("Щётки стеклоочистителя (дворники)", "shchetki-stekloochistitelya", "avtozapchasti", 3),
        ("Моторные масла", "motornye-masla", "avtozapchasti", 4),
        ("Антифризы", "antifrizy", "avtozapchasti", 5),
        ("Свечи автомобильные", "svechi-avtomobilnye", "avtozapchasti", 6),
        ("Тормозные диски", "tormoznye-diski", "avtozapchasti", 7),
        ("Стеклоомыватели", "stekloomyvateli", "avtozapchasti", 8),
        ("Автолампы", "avtolampy", "avtozapchasti", 9),
        ("Тормозные колодки дисковые", "tormoznye-kolodki-diskovye", "avtozapchasti", 10),

        ("Абразивные материалы", "abrazivnye-materialy", "materialy", 1),
        ("Автоэмали", "avtoemali", "materialy", 2),
        ("Герметики и клеи", "germetiki-i-klei", "materialy", 3),
        ("Грунты", "grunty", "materialy", 4),
        ("Лаки", "laki", "materialy", 5),

        ("Абразивная губка", "abrazivnaya-gubka", "abrazivnye-materialy", 1),
        ("Абразивная полоска", "abrazivnaya-poloska", "abrazivnye-materialy", 2),
        ("Абразивный круг", "abrazivnyj-krug", "abrazivnye-materialy", 3),
        ("Держатель для караллов", "derzhatel-dlya-karallov", "abrazivnye-materialy", 4),
        ("Зачистной круг", "zachistnoj-krug", "abrazivnye-materialy", 5),
        ("Корщетка", "korshchetka", "abrazivnye-materialy", 6),
        ("Лепестковый круг", "lepestkovyj-krug", "abrazivnye-materialy", 7),
        ("Наждачная бумага", "nazhdachnaya-bumaga", "abrazivnye-materialy", 8),
        ("Отрезной круг", "otreznoj-krug", "abrazivnye-materialy", 9),
        ("Шарошека", "sharosheka", "abrazivnye-materialy", 10),
        ("Шлифовальная лента", "shlifovalnaya-lenta", "abrazivnye-materialy", 11),
        ("Шлифовальный войлок (Скотч брайт)", "shlifovalnyj-vojlok-skotch-brait", "abrazivnye-materialy", 12),

        ("Алкидная эмаль", "alkidnaya-emal", "avtoemali", 1),
        ("Биндер", "binder", "avtoemali", 2),
        ("Краска для винила и кожи", "kraska-dlya-vinila-i-kozhi", "avtoemali", 3),
        ("Отвердитель", "otverditel", "avtoemali", 4),
        ("Подборная эмаль", "podbornaya-emal", "avtoemali", 5),
        ("С эффектами", "s-effektami", "avtoemali", 6),
        ("Термостойкая краска", "termostojkaya-kraska", "avtoemali", 7),
        ("Эмаль для дисков", "emal-dlya-diskov", "avtoemali", 8),
        ("Акриловая эмаль", "akrilovaya-emal", "avtoemali", 9),
        ("Базовая эмаль", "bazovaya-emal", "avtoemali", 10),
        ("Грунт-эмаль", "grunt-emal", "avtoemali", 11),
        ("Краска для суппортов", "kraska-dlya-supportov", "avtoemali", 12),
        ("Пигмент для подбора", "pigment-dlya-podbora", "avtoemali", 13),
        ("Полупродукт", "poluprodukt", "avtoemali", 14),
        ("Структурная краска", "strukturnaya-kraska", "avtoemali", 15),
        ("Цветовой веер", "cvetovoy-veer", "avtoemali", 16),

        ("Клей аэрозольный", "kley-aerozolnyj", "germetiki-i-klei", 1),
        ("Клей для пластика", "kley-dlya-plastika", "germetiki-i-klei", 2),
        ("Ленточный герметик", "lentochnyj-germetik", "germetiki-i-klei", 3),
        ("Насадка для герметика", "nasadka-dlya-germetika", "germetiki-i-klei", 4),
        ("Праймер для стекол", "prajmer-dlya-stekol", "germetiki-i-klei", 5),
        ("Стекольный клей", "stekolnyj-kley", "germetiki-i-klei", 6),
        ("Аппликатор праймера", "applikator-prajmera", "germetiki-i-klei", 7),
        ("Клей для зеркал", "kley-dlya-zerkal", "germetiki-i-klei", 8),
        ("Клей супербыстрый", "kley-superbystryj", "germetiki-i-klei", 9),
        ("Набор для ремонта стекол", "nabor-dlya-remonta-stekol", "germetiki-i-klei", 10),
        ("Невысыхающий герметик", "nevysyhayushchij-germetik", "germetiki-i-klei", 11),
        ("Распыляемый герметик", "raspylyaemyj-germetik", "germetiki-i-klei", 12),
        ("Шовный герметик", "shovnyj-germetik", "germetiki-i-klei", 13),

        ("Акриловый грунт", "akrilovyj-grunt", "grunty", 1),
        ("Алкидный грунт", "alkidnyj-grunt", "grunty", 2),
        ("Грунт по пластику", "grunt-po-plastiku", "grunty", 3),
        ("Грунт-изолятор", "grunt-izolyator", "grunty", 4),
        ("Кислотный грунт", "kislotnyj-grunt", "grunty", 5),
        ("Полиэфирный грунт", "poliefirnyj-grunt", "grunty", 6),
        ("Провариваемый грунт", "provarivaemyj-grunt", "grunty", 7),
        ("Термостойкий грунт", "termostojkij-grunt", "grunty", 8),
        ("Эпоксидный грунт", "epoksidnyj-grunt", "grunty", 9),

        ("HS лак", "hs-lak", "laki", 1),
        ("MS лак", "ms-lak", "laki", 2),
        ("UHS(VHS) лак", "uhs-vhs-lak", "laki", 3),
        ("Аэрозольный лак", "aerozolnyj-lak", "laki", 4),
        ("Матовый лак", "matovyj-lak", "laki", 5),
    ];

    public static async Task SeedAsync(AppDbContext db)
    {
        await using var transaction = await db.Database.BeginTransactionAsync();
        var slugs = Categories.Select(item => item.Slug).ToArray();
        var existing = await db.Categories
            .Where(category => slugs.Contains(category.Slug))
            .ToDictionaryAsync(category => category.Slug);

        foreach (var item in Categories)
        {
            if (!existing.TryGetValue(item.Slug, out var category))
            {
                category = new Category { Slug = item.Slug };
                db.Categories.Add(category);
                existing.Add(item.Slug, category);
            }

            category.Name = item.Name;
            category.SortOrder = item.SortOrder;
            category.IsActive = true;

            if (item.ParentSlug is null)
            {
                category.Parent = null;
                category.ParentId = null;
            }
            else
            {
                category.Parent = existing[item.ParentSlug];
            }
        }

        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        Console.WriteLine("Category seed completed.");
    }
}
