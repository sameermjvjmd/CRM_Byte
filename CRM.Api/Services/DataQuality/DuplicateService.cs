using CRM.Api.Data;
using CRM.Api.DTOs.DataQuality;
using CRM.Api.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CRM.Api.Services.DataQuality
{
    public class DuplicateService : IDuplicateService
    {
        private readonly ApplicationDbContext _context;

        public DuplicateService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<DuplicateGroupDto>> ScanForDuplicatesAsync(DuplicateScanRequest request)
        {
            var results = new List<DuplicateGroupDto>();

            if (request.EntityType == "Contact")
            {
                var contacts = await _context.Contacts.ToListAsync();
                
                // Naive implementation for High Sensitivity (Exact Match)
                // In a real generic system, this would be dynamic.
                // For now, let's look for exact matches on Email or Name+Phone
                
                var groups = new List<List<Contact>>();

                if (request.Fields.Contains("Email"))
                {
                    var emailGroups = contacts
                        .Where(c => !string.IsNullOrEmpty(c.Email))
                        .GroupBy(c => c.Email!.ToLower().Trim())
                        .Where(g => g.Count() > 1)
                        .Select(g => g.ToList())
                        .ToList();
                    groups.AddRange(emailGroups);
                }

                if (request.Fields.Contains("Name"))
                {
                    var nameGroups = contacts
                        .GroupBy(c => (c.FirstName + c.LastName).ToLower().Replace(" ", ""))
                        .Where(g => g.Count() > 1)
                        .Select(g => g.ToList())
                        .ToList();
                    
                    // Filter out already found groups (partially) or just add everything and dedupe later
                    // For simplicity, just adding them now
                     groups.AddRange(nameGroups);
                }

                int groupId = 1;
                foreach (var dbGroup in groups)
                {
                    // Avoid displaying duplicates that are already same set
                    // Ideally we'd have a more complex ID tracking
                    
                    var dto = new DuplicateGroupDto
                    {
                        GroupId = groupId++,
                        MatchScore = 100, // High sensitivity = 100% exact match on field
                        Records = dbGroup.Select(c => new DuplicateRecordDto
                        {
                            Id = c.Id,
                            Name = $"{c.FirstName} {c.LastName}",
                            CreatedAt = c.CreatedAt,
                            Attributes = new Dictionary<string, string>
                            {
                                { "Email", c.Email ?? "" },
                                { "Phone", c.Phone ?? "" },
                                { "Company", c.Company?.Name ?? "" }
                            }
                        }).ToList()
                    };
                    results.Add(dto);
                }
            }

            return results;
        }

        public async Task MergeRecordsAsync(MergeRequest request)
        {
            if (request.EntityType == "Contact")
            {
                var master = await _context.Contacts
                    .Include(c => c.Groups)
                    .FirstOrDefaultAsync(c => c.Id == request.MasterRecordId);

                if (master == null) throw new ArgumentException("Master record not found");

                var duplicates = await _context.Contacts
                    .Include(c => c.Groups)
                    .Where(c => request.DuplicateRecordIds.Contains(c.Id))
                    .ToListAsync();

                foreach (var duplicate in duplicates)
                {
                    // 1. Move related entities
                    // Opportunities (Assume ContactId foreign key)
                    var opps = await _context.Opportunities.Where(o => o.ContactId == duplicate.Id).ToListAsync();
                    foreach(var o in opps) o.ContactId = master.Id;

                    var activities = await _context.Activities.Where(a => a.ContactId == duplicate.Id).ToListAsync();
                    foreach (var a in activities) a.ContactId = master.Id;

                    var histories = await _context.HistoryItems.Where(h => h.ContactId == duplicate.Id).ToListAsync();
                    foreach (var h in histories) h.ContactId = master.Id;
                    
                    // 2. Merge data if master is empty (simple strategy)
                    if (string.IsNullOrEmpty(master.Phone) && !string.IsNullOrEmpty(duplicate.Phone))
                        master.Phone = duplicate.Phone;
                    if (string.IsNullOrEmpty(master.JobTitle) && !string.IsNullOrEmpty(duplicate.JobTitle))
                        master.JobTitle = duplicate.JobTitle;
                     // ... add more fields as needed

                    // 3. Mark duplicate as deleted or hard delete?
                    // For now, hard delete
                    _context.Contacts.Remove(duplicate);
                }

                await _context.SaveChangesAsync();
            }
        }
    }
}
