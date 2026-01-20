using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using CRM.Api.Data;
using CRM.Api.Models;
using CRM.Api.Models.Marketing;

namespace CRM.Api.Services.Marketing
{
    public interface IDynamicListService
    {
        Task ProcessDynamicListsAsync();
    }

    public class DynamicListService : IDynamicListService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DynamicListService> _logger;

        public DynamicListService(ApplicationDbContext context, ILogger<DynamicListService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task ProcessDynamicListsAsync()
        {
            try
            {
                var dynamicLists = await _context.MarketingLists
                    .Where(l => l.Type == "Dynamic" && l.Status == "Active")
                    .ToListAsync();

                if (!dynamicLists.Any()) return;

                // Pre-fetch Data for performance (MVP style: load all contacts/values)
                // PROD NOTICE: Should be batched or optimized with IQueryable expression trees.
                
                var contacts = await _context.Contacts.Where(c => c.Status != "Deleted").ToListAsync();
                
                var fieldDefs = await _context.CustomFieldDefinitions
                    .Where(d => d.EntityType == "Contact" && d.IsActive)
                    .ToListAsync();
                    
                var fieldMap = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
                foreach(var def in fieldDefs) 
                {
                    if (!fieldMap.ContainsKey(def.FieldKey)) fieldMap[def.FieldKey] = def.Id;
                    if (!fieldMap.ContainsKey(def.FieldName)) fieldMap[def.FieldName] = def.Id;
                }

                var customValues = await _context.CustomFieldValues
                    .Where(v => v.EntityType == "Contact")
                    .ToListAsync();
                
                var valuesLookup = customValues
                    .GroupBy(v => v.EntityId)
                    .ToDictionary(g => g.Key, g => g.ToList());

                foreach (var list in dynamicLists)
                {
                    if (string.IsNullOrWhiteSpace(list.DynamicCriteria)) continue;
                    await UpdateListMembers(list, contacts, fieldMap, valuesLookup);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing dynamic lists");
            }
        }

        private async Task UpdateListMembers(
            MarketingList list, 
            List<Contact> allContacts, 
            Dictionary<string, int> fieldMap, 
            Dictionary<int, List<CustomFieldValue>> valuesLookup)
        {
            try
            {
                var criteria = JsonSerializer.Deserialize<List<DynamicRule>>(list.DynamicCriteria);
                if (criteria == null || !criteria.Any()) return;

                var matchingContactIds = new HashSet<int>();

                foreach (var contact in allContacts)
                {
                    if (string.IsNullOrWhiteSpace(contact.Email)) continue; // Can't add without email

                    if (EvaluateCriteria(contact, criteria, fieldMap, valuesLookup))
                    {
                        matchingContactIds.Add(contact.Id);
                    }
                }

                // Sync Members
                var existingMembers = await _context.MarketingListMembers
                    .Where(m => m.MarketingListId == list.Id)
                    .ToListAsync();

                var existingContactIds = existingMembers
                    .Where(m => m.ContactId.HasValue)
                    .Select(m => m.ContactId.Value)
                    .ToHashSet();

                var toAddIdList = matchingContactIds.Where(id => !existingContactIds.Contains(id)).ToList();
                var toRemoveList = existingMembers.Where(m => m.ContactId.HasValue && !matchingContactIds.Contains(m.ContactId.Value)).ToList();

                if (toAddIdList.Any())
                {
                    foreach (var contactId in toAddIdList)
                    {
                        var contact = allContacts.First(c => c.Id == contactId);
                        _context.MarketingListMembers.Add(new MarketingListMember
                        {
                            MarketingListId = list.Id,
                            ContactId = contact.Id,
                            Email = contact.Email!,
                            FirstName = contact.FirstName,
                            LastName = contact.LastName,
                            Source = "Dynamic Rule",
                            Status = "Subscribed", 
                            SubscribedAt = DateTime.UtcNow
                        });
                    }
                    list.MemberCount += toAddIdList.Count;
                }

                if (toRemoveList.Any())
                {
                    _context.MarketingListMembers.RemoveRange(toRemoveList);
                    list.MemberCount -= toRemoveList.Count;
                }

                if (toAddIdList.Any() || toRemoveList.Any())
                {
                    list.LastSyncedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Updated Dynamic List {ListName}: +{Added}, -{Removed}", list.Name, toAddIdList.Count, toRemoveList.Count);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update dynamic list {ListId}", list.Id);
            }
        }

        private bool EvaluateCriteria(
            Contact contact, 
            List<DynamicRule> criteria, 
            Dictionary<string, int> fieldMap, 
            Dictionary<int, List<CustomFieldValue>> valuesLookup)
        {
            foreach (var rule in criteria)
            {
                if (!EvaluateRule(contact, rule, fieldMap, valuesLookup)) return false;
            }
            return true;
        }

        private bool EvaluateRule(
            Contact contact, 
            DynamicRule rule, 
            Dictionary<string, int> fieldMap, 
            Dictionary<int, List<CustomFieldValue>> valuesLookup)
        {
            string? contactValue = GetValue(contact, rule.Field, fieldMap, valuesLookup);
            var ruleValue = rule.Value ?? "";

            return rule.Operator switch
            {
                "Equals" => string.Equals(contactValue, ruleValue, StringComparison.OrdinalIgnoreCase),
                "Contains" => contactValue?.IndexOf(ruleValue, StringComparison.OrdinalIgnoreCase) >= 0,
                "StartsWith" => contactValue?.StartsWith(ruleValue, StringComparison.OrdinalIgnoreCase) ?? false,
                "EndsWith" => contactValue?.EndsWith(ruleValue, StringComparison.OrdinalIgnoreCase) ?? false,
                "NotEquals" => !string.Equals(contactValue, ruleValue, StringComparison.OrdinalIgnoreCase),
                "IsEmpty" => string.IsNullOrWhiteSpace(contactValue),
                "IsNotEmpty" => !string.IsNullOrWhiteSpace(contactValue),
                _ => false
            };
        }

        private string? GetValue(
            Contact contact, 
            string field, 
            Dictionary<string, int> fieldMap, 
            Dictionary<int, List<CustomFieldValue>> valuesLookup)
        {
            // 1. Standard Properties
            var prop = typeof(Contact).GetProperty(field);
            if (prop != null)
            {
                 return prop.GetValue(contact)?.ToString();
            }

            // 2. Custom Fields
            if (fieldMap.TryGetValue(field, out int defId))
            {
                if (valuesLookup.TryGetValue(contact.Id, out var contactValues))
                {
                    var val = contactValues.FirstOrDefault(v => v.CustomFieldDefinitionId == defId);
                    return val?.Value;
                }
            }

            return null; 
        }
    }

    public class DynamicRule
    {
        public string Field { get; set; } = string.Empty;
        public string Operator { get; set; } = "Equals";
        public string? Value { get; set; } = string.Empty;
    }
}
