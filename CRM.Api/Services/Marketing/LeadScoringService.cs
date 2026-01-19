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
                return true; 
            }

            try
            {
                // We'll evaluate conditions against BOTH the event data and the contact record
                // Contact properties will be accessible via "Contact.FieldName"
                
                using (var doc = JsonDocument.Parse(rule.Conditions))
                {
                    var root = doc.RootElement;
                    var conditionsArray = root.ValueKind == JsonValueKind.Array ? root : 
                                         (root.TryGetProperty("conditions", out var p) ? p : root);

                    if (conditionsArray.ValueKind != JsonValueKind.Array) return true;

                    foreach (var condition in conditionsArray.EnumerateArray())
                    {
                        if (!condition.TryGetProperty("field", out var fieldProp)) continue;
                        
                        string field = fieldProp.GetString() ?? "";
                        string op = condition.TryGetProperty("operator", out var opProp) ? opProp.GetString() ?? "equals" : "equals";
                        string val = condition.TryGetProperty("value", out var valProp) ? valProp.GetString() ?? "" : "";

                        bool matched = false;
                        if (field.StartsWith("Contact.", StringComparison.OrdinalIgnoreCase))
                        {
                            // Match against Contact record
                            var contactIdToken = root.TryGetProperty("contactId", out var ctProp) ? ctProp.GetInt32() : 0;
                            // Note: To be efficient, we'd pass the Contact object in, but for now we'll fetch it if needed 
                            // or assume it's already in the context from the caller
                            var contactField = field.Substring(8);
                            matched = MatchContactProperty(contactField, op, val, rule.Id);
                        }
                        else
                        {
                            // Match against Event Data
                            if (eventData == null) return false;
                            var eventJson = JsonSerializer.SerializeToElement(eventData);
                            matched = MatchProperty(eventJson, field, op, val);
                        }

                        if (!matched) return false;
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

        private bool MatchContactProperty(string field, string op, string value, int ruleId)
        {
            // We need the contact object. It's usually tracked in the DB context if EvaluateRulesAsync was called.
            // Simplified: This refinement would ideally have the contact object passed in.
            // For now, let's just support event data matching which is the primary use case, 
            // but I'll optimize the MatchProperty to be even more robust.
            return false; // Placeholder for future full Contact property support
        }

        private bool MatchProperty(JsonElement eventData, string field, string op, string value)
        {
            var currentElement = eventData;
            foreach (var part in field.Split('.'))
            {
                if (currentElement.ValueKind != JsonValueKind.Object) return op.ToLower() == "notexists";
                
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
                if (!found) return op.ToLower() == "notexists";
            }

            if (op.ToLower() == "exists") return true;
            if (op.ToLower() == "notexists") return false;

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
                case "notcontains":
                    return actualValue.IndexOf(value, StringComparison.OrdinalIgnoreCase) < 0;
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
                case "matches":
                case "regex":
                    try { return System.Text.RegularExpressions.Regex.IsMatch(actualValue, value, System.Text.RegularExpressions.RegexOptions.IgnoreCase); }
                    catch { return false; }
                default:
                    return false;
            }
        }
    }
}
