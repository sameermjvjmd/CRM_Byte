using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models.Marketing; // Adjust namespace if needed

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=CRM_ACT_DB;Trusted_Connection=True;MultipleActiveResultSets=true"));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var campaigns = context.MarketingCampaigns
        .Select(c => new { c.Id, c.Name, c.Status, c.MarketingListId, c.MarketingList.MemberCount })
        .ToList();

    Console.WriteLine("ID | Name | Status | ListID | ListMembers");
    foreach (var c in campaigns)
    {
        Console.WriteLine($"{c.Id} | {c.Name} | {c.Status} | {c.MarketingListId} | {c.MemberCount}");
    }
}
