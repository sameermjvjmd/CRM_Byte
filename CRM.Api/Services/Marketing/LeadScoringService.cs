using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;
using CRM.Api.Models.Marketing;
using System.Text.Json;

namespace CRM.Api.Services.Marketing
{
    public interface ILeadScoringService
    {
        Task EvaluateRulesAsync(string triggerType, int contactId, object? eventData = null);
    }

    public class LeadScoringService : ILeadScoringService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<LeadScoringService> _logger;

        public LeadScoringService(ApplicationDbContext context, ILogger<LeadScoringService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task EvaluateRulesAsync(string triggerType, int contactId, object? eventData = null)
        {
            try
            {
                var contact = await _context.Contacts.FindAsync(contactId);
                if (contact == null) return;

                // Fetch active rules for this trigger
                var rules = await _context.LeadScoringRules
                    .Where(r => r.IsActive && r.TriggerType == triggerType)
                    .ToListAsync();

                if (!rules.Any()) return;

                int totalPointsToAdd = 0;
                var matchedRules = new List<string>();

                foreach (var rule in rules)
                {
                    if (MatchesConditions(rule, eventData))
                    {
                        totalPointsToAdd += rule.PointsValue;
                        matchedRules.Add(rule.Name);
                    }
                }

                if (totalPointsToAdd != 0)
                {
                    contact.LeadScore += totalPointsToAdd;
                    contact.LastModifiedAt = DateTime.UtcNow;
                    
                    // Log the scoring event (optional: create a LeadScoreLog table if needed)
                    _logger.LogInformation("Lead Score updated for Contact {ContactId}: +{Points} points (Rules: {Rules}). New Score: {Score}", 
                        contactId, totalPointsToAdd, string.Join(", ", matchedRules), contact.LeadScore);

                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error evaluating lead scoring rules for Contact {ContactId}", contactId);
            }
        }

        private bool MatchesConditions(LeadScoringRule rule, object? eventData)
        {
            if (string.IsNullOrWhiteSpace(rule.Conditions) || rule.Conditions == "[]" || rule.Conditions == "{}")
            {
                return true; // No conditions = apply Rule
            }

            try
            {
                // Expected format: { "conditions": [ { "field": "...", "operator": "...", "value": "..." } ] }
                // OR simple key-value for specific event data
                
                // If eventData is null, we can't evaluate dynamic conditions against it
                if (eventData == null) return false;

                // Serialize eventData to JSON element to query it
                var eventJson = JsonSerializer.SerializeToElement(eventData);

                using (var doc = JsonDocument.Parse(rule.Conditions))
                {
                    var root = doc.RootElement;
                    
                    // Allow for both array of conditions or a wrapping object
                    JsonElement conditionsArray;
                    if (root.ValueKind == JsonValueKind.Array)
                    {
                        conditionsArray = root;
                    }
                    else if (root.TryGetProperty("conditions", out var prop) && prop.ValueKind == JsonValueKind.Array)
                    {
                        conditionsArray = prop;
                    }
                    else
                    {
                        // Assume it's a simple key-value map to match against event properties
                        foreach (var property in root.EnumerateObject())
                        {
                            if (!MatchProperty(eventJson, property.Name, "equals", property.Value.ToString()))
                            {
                                return false;
                            }
                        }
                        return true;
                    }

                    foreach (var condition in conditionsArray.EnumerateArray())
                    {
                        string field = condition.GetProperty("field").GetString() ?? "";
                        string op = condition.GetProperty("operator").GetString() ?? "equals";
                        string val = condition.GetProperty("value").GetString() ?? "";

                        if (!MatchProperty(eventJson, field, op, val))
                        {
                            return false;
                        }
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to evaluate conditions for rule {RuleId}", rule.Id);
                return false;
            }
        }

        private bool MatchProperty(JsonElement eventData, string field, string op, string value)
        {
            // Simple case-insensitive property lookup
            // Supports nested properties via dot notation e.g. "Form.Id"
            var currentElement = eventData;
            foreach (var part in field.Split('.'))
            {
                if (currentElement.ValueKind != JsonValueKind.Object) return false;
                
                // Case-insensitive property search
                bool found = false;
                foreach (var prop in currentElement.EnumerateObject())
                {
                    if (prop.Name.Equals(part, StringComparison.OrdinalIgnoreCase))
                    {
                        currentElement = prop.Value;
                        found = true;
                        break;
                    }
                }
                if (!found) return false;
            }

            string actualValue = currentElement.ValueKind == JsonValueKind.String 
                ? currentElement.GetString() ?? "" 
                : currentElement.ToString() ?? "";

            switch (op.ToLower())
            {
                case "equals":
                case "==":
                    return actualValue.Equals(value, StringComparison.OrdinalIgnoreCase);
                case "notequals":
                case "!=":
                    return !actualValue.Equals(value, StringComparison.OrdinalIgnoreCase);
                case "contains":
                    return actualValue.IndexOf(value, StringComparison.OrdinalIgnoreCase) >= 0;
                case "startswith":
                    return actualValue.StartsWith(value, StringComparison.OrdinalIgnoreCase);
                case "endswith":
                    return actualValue.EndsWith(value, StringComparison.OrdinalIgnoreCase);
                case "greaterthan":
                case ">":
                    return double.TryParse(actualValue, out double v1) && double.TryParse(value, out double v2) && v1 > v2;
                case "lessthan":
                case "<":
                    return double.TryParse(actualValue, out double v3) && double.TryParse(value, out double v4) && v3 < v4;
                default:
                    return false;
            }
        }
    }
}
