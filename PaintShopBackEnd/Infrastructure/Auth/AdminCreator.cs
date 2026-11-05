using System.Text;
using Microsoft.AspNetCore.Identity;
using PaintShopBackEnd.Infrastructure.Data;

namespace PaintShopBackEnd.Infrastructure.Auth;

public static class AdminCreator
{
    public static async Task<int> RunAsync(IServiceProvider services, AppDbContext db)
    {
        if (Console.IsInputRedirected || Console.IsOutputRedirected)
        {
            Console.Error.WriteLine("create-admin requires an interactive terminal.");
            return 1;
        }

        Console.Write("Email: ");
        var email = Console.ReadLine()?.Trim();
        if (string.IsNullOrWhiteSpace(email))
        {
            Console.Error.WriteLine("Email is required.");
            return 1;
        }

        Console.Write("Password: ");
        var password = ReadPassword();
        Console.WriteLine();

        var users = services.GetRequiredService<UserManager<IdentityUser>>();
        var roles = services.GetRequiredService<RoleManager<IdentityRole>>();
        await using var transaction = await db.Database.BeginTransactionAsync();

        if (await users.FindByEmailAsync(email) is not null)
        {
            Console.Error.WriteLine("A user with this email already exists; no changes were made.");
            return 1;
        }

        if (!await roles.RoleExistsAsync("Admin"))
        {
            var roleResult = await roles.CreateAsync(new IdentityRole("Admin"));
            if (!roleResult.Succeeded)
                return ReportErrors(roleResult);
        }

        var user = new IdentityUser { UserName = email, Email = email, LockoutEnabled = true };
        var createResult = await users.CreateAsync(user, password);
        if (!createResult.Succeeded)
            return ReportErrors(createResult);

        var roleAssignment = await users.AddToRoleAsync(user, "Admin");
        if (!roleAssignment.Succeeded)
            return ReportErrors(roleAssignment);

        await transaction.CommitAsync();
        Console.WriteLine("Administrator created.");
        return 0;
    }

    private static string ReadPassword()
    {
        var password = new StringBuilder();
        while (true)
        {
            var key = Console.ReadKey(intercept: true);
            if (key.Key == ConsoleKey.Enter)
                return password.ToString();
            if (key.Key == ConsoleKey.Backspace && password.Length > 0)
                password.Length--;
            else if (!char.IsControl(key.KeyChar))
                password.Append(key.KeyChar);
        }
    }

    private static int ReportErrors(IdentityResult result)
    {
        foreach (var error in result.Errors)
            Console.Error.WriteLine(error.Description);
        return 1;
    }
}
