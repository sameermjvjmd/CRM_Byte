using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;
using CRM.Api.Models.Marketing;
using System.Text.Json;

namespace CRM.Api.Services.Marketing
{
    public class LeadAssignmentService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<LeadAssignmentService> _logger;

        public LeadAssignmentService(ApplicationDbContext context, ILogger<LeadAssignmentService> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Automatically assign a contact (lead) to a user based on active assignment rules
        /// </summary>
        public async Task<int?> AssignLeadAsync(int contactId)
        {
            try
            {
                var contact = await _context.Contacts.FindAsync(contactId);
                if (contact == null)
                {
                    _logger.LogWarning($"Contact {contactId} not found for assignment");
                    return null;
                }

                // Get active rules ordered by priority
                var rules = await _context.LeadAssignmentRules
                    .Where(r => r.IsActive)
                    .OrderBy(r => r.Priority)
                    .ToListAsync();

                if (!rules.Any())
                {
                    _logger.LogInformation("No active assignment rules found");
                    return null;
                }

                // Try each rule in priority order
                foreach (var rule in rules)
                {
                    var assignedUserId = await TryAssignWithRule(contact, rule);
                    if (assignedUserId.HasValue)
                    {
                        // Update contact owner
                        contact.OwnerId = assignedUserId.Value;
                        await _context.SaveChangesAsync();

                        _logger.LogInformation($"Contact {contactId} assigned to user {assignedUserId} via rule '{rule.Name}'");
                        return assignedUserId.Value;
                    }
                }

                _logger.LogInformation($"No matching rule found for contact {contactId}");
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error assigning contact {contactId}");
                return null;
            }
        }

        private async Task<int?> TryAssignWithRule(Contact contact, LeadAssignmentRule rule)
        {
            // Parse user IDs
            var userIds = JsonSerializer.Deserialize<List<int>>(rule.AssignToUserIds);
            if (userIds == null || !userIds.Any())
            {
                return null;
            }

            // Check if contact matches rule criteria
            if (!MatchesCriteria(contact, rule))
            {
                return null;
            }

            // Assign based on type
            return rule.AssignmentType switch
            {
                "RoundRobin" => await AssignRoundRobin(rule, userIds),
                "Territory" => AssignByTerritory(contact, userIds),
                "ScoreBased" => AssignByScore(contact, userIds),
                "Workload" => await AssignByWorkload(userIds),
                _ => null
            };
        }

        private bool MatchesCriteria(Contact contact, LeadAssignmentRule rule)
        {
            if (string.IsNullOrEmpty(rule.Criteria) || rule.Criteria == "{}")
            {
                return true; // No criteria = match all
            }

            try
            {
                var criteria = JsonSerializer.Deserialize<Dictionary<string, object>>(rule.Criteria);
                if (criteria == null) return true;

                // Check min/max score
                if (criteria.ContainsKey("minScore") && contact.LeadScore < Convert.ToInt32(criteria["minScore"]))
                    return false;
                if (criteria.ContainsKey("maxScore") && contact.LeadScore > Convert.ToInt32(criteria["maxScore"]))
                    return false;

                // Check territory (mapped to State)
                if (criteria.ContainsKey("territory") && contact.State != criteria["territory"].ToString())
                    return false;

                // Check source
                if (criteria.ContainsKey("source") && contact.LeadSource != criteria["source"].ToString())
                    return false;

                return true;
            }
            catch
            {
                return true; // If criteria parsing fails, match all
            }
        }

        private async Task<int?> AssignRoundRobin(LeadAssignmentRule rule, List<int> userIds)
        {
            // Get current index
            var currentIndex = rule.LastAssignedIndex ?? 0;

            // Get next user
            var nextIndex = (currentIndex + 1) % userIds.Count;
            var assignedUserId = userIds[nextIndex];

            // Update rule's last assigned index
            rule.LastAssignedIndex = nextIndex;
            rule.LastModifiedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return assignedUserId;
        }

        private int? AssignByTerritory(Contact contact, List<int> userIds)
        {
            // For now, just return first user
            // TODO: Implement territory matching logic
            return userIds.FirstOrDefault();
        }

        private int? AssignByScore(Contact contact, List<int> userIds)
        {
            // Assign high-score leads to first user (senior rep)
            // Low-score leads to last user (junior rep)
            if (contact.LeadScore >= 70)
            {
                return userIds.FirstOrDefault();
            }
            else if (contact.LeadScore >= 40)
            {
                return userIds.Count > 1 ? userIds[userIds.Count / 2] : userIds.FirstOrDefault();
            }
            else
            {
                return userIds.LastOrDefault();
            }
        }

        private async Task<int?> AssignByWorkload(List<int> userIds)
        {
            // Count active contacts per user
            var workloads = new Dictionary<int, int>();
            foreach (var userId in userIds)
            {
                var count = await _context.Contacts
                    .CountAsync(c => c.OwnerId == userId && c.Status != "Closed");
                workloads[userId] = count;
            }

            // Assign to user with least workload
            return workloads.OrderBy(w => w.Value).FirstOrDefault().Key;
        }
    }
}
