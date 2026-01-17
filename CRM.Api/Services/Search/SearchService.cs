using CRM.Api.Data;
using CRM.Api.DTOs.Search;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CRM.Api.Services.Search
{
    public class SearchService : ISearchService
    {
        private readonly ApplicationDbContext _context;

        public SearchService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<SearchResultDto>> GlobalSearchAsync(string query, int userId)
        {
            if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            {
                return new List<SearchResultDto>();
            }

            var results = new List<SearchResultDto>();
            query = query.ToLower();

            // 1. Search Contacts
            var contacts = await _context.Contacts
                .Where(c => 
                           (c.FirstName.Contains(query) || 
                            c.LastName.Contains(query) || 
                            c.Email.Contains(query) ||
                            (c.Phone != null && c.Phone.Contains(query))))
                .Take(5)
                .Select(c => new SearchResultDto
                {
                    Id = c.Id,
                    Title = c.FirstName + " " + c.LastName,
                    Subtitle = c.Company != null ? c.Company.Name : (c.Email ?? c.Phone ?? "Contact"),
                    Type = "Contact",
                    Url = $"/contacts/{c.Id}",
                    Icon = "User"
                })
                .ToListAsync();
            results.AddRange(contacts);

            // 2. Search Companies
            var companies = await _context.Companies
                .Where(c => 
                           (c.Name.Contains(query) || 
                            (c.Phone != null && c.Phone.Contains(query)) ||
                            (c.Website != null && c.Website.Contains(query))))
                .Take(5)
                .Select(c => new SearchResultDto
                {
                    Id = c.Id,
                    Title = c.Name,
                    Subtitle = c.Industry ?? c.City ?? "Company",
                    Type = "Company",
                    Url = $"/companies/{c.Id}",
                    Icon = "Building"
                })
                .ToListAsync();
            results.AddRange(companies);

            // 3. Search Opportunities
            var opportunities = await _context.Opportunities
                .Where(o => 
                           (o.Name.Contains(query) || 
                            (o.Description != null && o.Description.Contains(query))))
                .Take(5)
                .Select(o => new SearchResultDto
                {
                    Id = o.Id,
                    Title = o.Name,
                    Subtitle = $"{o.Stage} - {o.Amount:C0}", // Assuming current culture currency formatting work mostly on server, but typically handled on frontend. Just simple string here.
                    Type = "Opportunity",
                    Url = $"/opportunities/{o.Id}",
                    Icon = "TrendingUp"
                })
                .ToListAsync();
            results.AddRange(opportunities);

            return results;
        }
    }
}
