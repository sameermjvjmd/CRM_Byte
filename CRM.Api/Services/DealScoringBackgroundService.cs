using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;

namespace CRM.Api.Services
{
    public class DealScoringBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<DealScoringBackgroundService> _logger;
        private readonly TimeSpan _interval = TimeSpan.FromHours(1); // Run every hour

        public DealScoringBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<DealScoringBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Deal Scoring Background Service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessDealScoring(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in Deal Scoring Background Service");
                }

                await Task.Delay(_interval, stoppingToken);
            }
        }

        private async Task ProcessDealScoring(CancellationToken cancellationToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Get all open opportunities (not Closed Won or Closed Lost)
            var openOpportunities = await context.Opportunities
                .Where(o => o.Stage != "Closed Won" && o.Stage != "Closed Lost")
                .ToListAsync(cancellationToken);

            _logger.LogInformation($"Processing deal scoring for {openOpportunities.Count} opportunities");

            foreach (var opportunity in openOpportunities)
            {
                try
                {
                    // Calculate deal score
                    var score = CalculateDealScore(opportunity);
                    opportunity.DealScore = score;

                    // Determine deal health based on score and other factors
                    var health = DetermineDealHealth(opportunity, score);
                    opportunity.DealHealth = health;

                    // Identify risk factors
                    var riskFactors = IdentifyRiskFactors(opportunity);
                    opportunity.RiskFactors = string.Join(", ", riskFactors);

                    // Calculate days in current stage
                    if (opportunity.StageChangedAt.HasValue)
                    {
                        opportunity.DaysInCurrentStage = (int)(DateTime.UtcNow - opportunity.StageChangedAt.Value).TotalDays;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error scoring opportunity {opportunity.Id}");
                }
            }

            await context.SaveChangesAsync(cancellationToken);
            _logger.LogInformation($"Deal scoring completed for {openOpportunities.Count} opportunities");
        }

        private int CalculateDealScore(Opportunity opportunity)
        {
            int score = 50; // Base score

            // Factor 1: Stage progression (0-20 points)
            score += GetStageScore(opportunity.Stage);

            // Factor 2: Amount/Budget fit (0-15 points)
            if (opportunity.Amount >= 100000) score += 15;
            else if (opportunity.Amount >= 50000) score += 10;
            else if (opportunity.Amount >= 10000) score += 5;

            // Factor 3: Engagement/Activity (0-15 points)
            // If last activity is recent, add points
            if (opportunity.LastActivityDate.HasValue)
            {
                var daysSinceActivity = (DateTime.UtcNow - opportunity.LastActivityDate.Value).TotalDays;
                if (daysSinceActivity <= 3) score += 15;
                else if (daysSinceActivity <= 7) score += 10;
                else if (daysSinceActivity <= 14) score += 5;
                else if (daysSinceActivity > 30) score -= 10; // Penalty for inactivity
            }

            // Factor 4: Next action defined (0-10 points)
            if (!string.IsNullOrEmpty(opportunity.NextAction))
            {
                score += 10;
                
                // Bonus if next action is not overdue
                if (opportunity.NextActionDate.HasValue && opportunity.NextActionDate.Value >= DateTime.UtcNow)
                {
                    score += 5;
                }
                // Penalty if overdue
                else if (opportunity.NextActionDate.HasValue && opportunity.NextActionDate.Value < DateTime.UtcNow)
                {
                    var daysOverdue = (DateTime.UtcNow - opportunity.NextActionDate.Value).TotalDays;
                    if (daysOverdue > 7) score -= 15;
                    else if (daysOverdue > 3) score -= 10;
                    else score -= 5;
                }
            }

            // Factor 5: Time in current stage (0-10 points or penalty)
            if (opportunity.DaysInCurrentStage.HasValue)
            {
                // Penalty for being stuck too long
                if (opportunity.DaysInCurrentStage > 60) score -= 15;
                else if (opportunity.DaysInCurrentStage > 30) score -= 10;
                else if (opportunity.DaysInCurrentStage > 14) score -= 5;
            }

            // Factor 6: Expected close date (0-10 points)
            if (opportunity.ExpectedCloseDate.HasValue)
            {
                var daysToClose = (opportunity.ExpectedCloseDate.Value - DateTime.UtcNow).TotalDays;
                if (daysToClose > 0 && daysToClose <= 30) score += 10; // Closing soon
                else if (daysToClose > 30 && daysToClose <= 60) score += 5;
                else if (daysToClose < 0) score -= 10; // Past expected close date
            }

            // Factor 7: Probability (0-10 points)
            if (opportunity.Probability.HasValue)
            {
                if (opportunity.Probability >= 75) score += 10;
                else if (opportunity.Probability >= 50) score += 5;
                else if (opportunity.Probability < 25) score -= 5;
            }

            // Ensure score is between 0 and 100
            return Math.Clamp(score, 0, 100);
        }

        private int GetStageScore(string stage)
        {
            return stage switch
            {
                "Qualification" => 5,
                "Needs Analysis" => 8,
                "Proposal" => 12,
                "Negotiation" => 16,
                "Closed Won" => 20,
                "Prospecting" => 3,
                _ => 0
            };
        }

        private string DetermineDealHealth(Opportunity opportunity, int score)
        {
            // Check for critical risk factors first
            var riskFactors = IdentifyRiskFactors(opportunity);
            
            if (riskFactors.Contains("Overdue next action (7+ days)") || 
                riskFactors.Contains("No activity in 30+ days"))
            {
                return "At Risk";
            }

            if (riskFactors.Contains("Stuck in stage (60+ days)"))
            {
                return "Stalled";
            }

            // Score-based health
            if (score >= 80) return "Hot";
            if (score >= 60) return "Healthy";
            if (score >= 40) return "At Risk";
            return "Stalled";
        }

        private List<string> IdentifyRiskFactors(Opportunity opportunity)
        {
            var risks = new List<string>();

            // Risk: No next action defined
            if (string.IsNullOrEmpty(opportunity.NextAction))
            {
                risks.Add("No next action defined");
            }

            // Risk: Overdue next action
            if (opportunity.NextActionDate.HasValue && opportunity.NextActionDate.Value < DateTime.UtcNow)
            {
                var daysOverdue = (DateTime.UtcNow - opportunity.NextActionDate.Value).TotalDays;
                if (daysOverdue > 7)
                {
                    risks.Add($"Overdue next action ({(int)daysOverdue}+ days)");
                }
                else if (daysOverdue > 3)
                {
                    risks.Add($"Overdue next action ({(int)daysOverdue} days)");
                }
            }

            // Risk: No recent activity
            if (opportunity.LastActivityDate.HasValue)
            {
                var daysSinceActivity = (DateTime.UtcNow - opportunity.LastActivityDate.Value).TotalDays;
                if (daysSinceActivity > 30)
                {
                    risks.Add("No activity in 30+ days");
                }
                else if (daysSinceActivity > 14)
                {
                    risks.Add("No activity in 14+ days");
                }
            }

            // Risk: Stuck in current stage
            if (opportunity.DaysInCurrentStage.HasValue)
            {
                if (opportunity.DaysInCurrentStage > 60)
                {
                    risks.Add("Stuck in stage (60+ days)");
                }
                else if (opportunity.DaysInCurrentStage > 30)
                {
                    risks.Add("Stuck in stage (30+ days)");
                }
            }

            // Risk: Past expected close date
            if (opportunity.ExpectedCloseDate.HasValue && opportunity.ExpectedCloseDate.Value < DateTime.UtcNow)
            {
                var daysPastDue = (DateTime.UtcNow - opportunity.ExpectedCloseDate.Value).TotalDays;
                risks.Add($"Past expected close date ({(int)daysPastDue} days)");
            }

            // Risk: Low probability
            if (opportunity.Probability.HasValue && opportunity.Probability < 25)
            {
                risks.Add($"Low probability ({opportunity.Probability}%)");
            }

            // Risk: High competition
            if (!string.IsNullOrEmpty(opportunity.Competitors))
            {
                var competitorCount = opportunity.Competitors.Split(',').Length;
                if (competitorCount >= 3)
                {
                    risks.Add($"High competition ({competitorCount} competitors)");
                }
            }

            return risks;
        }
    }
}
