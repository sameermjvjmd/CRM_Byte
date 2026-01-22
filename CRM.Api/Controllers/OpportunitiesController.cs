using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;
using CRM.Api.DTOs;
using CRM.Api.DTOs.Search;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OpportunitiesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly Services.WorkflowExecutionService _workflowService;

        public OpportunitiesController(ApplicationDbContext context, Services.WorkflowExecutionService workflowService)
        {
            _context = context;
            _workflowService = workflowService;
        }

        // =============================================
        // GET: api/Opportunities
        // =============================================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Opportunity>>> GetOpportunities(
            [FromQuery] string? stage,
            [FromQuery] string? owner,
            [FromQuery] string? forecastCategory,
            [FromQuery] DateTime? expectedCloseFrom,
            [FromQuery] DateTime? expectedCloseTo,
            [FromQuery] decimal? minAmount,
            [FromQuery] decimal? maxAmount)
        {
            var query = _context.Opportunities
                .Include(o => o.Contact)
                .Include(o => o.Company)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(stage))
                query = query.Where(o => o.Stage == stage);

            if (!string.IsNullOrWhiteSpace(owner))
                query = query.Where(o => o.Owner == owner);

            if (!string.IsNullOrWhiteSpace(forecastCategory))
                query = query.Where(o => o.ForecastCategory == forecastCategory);

            if (expectedCloseFrom.HasValue)
                query = query.Where(o => o.ExpectedCloseDate >= expectedCloseFrom.Value);

            if (expectedCloseTo.HasValue)
                query = query.Where(o => o.ExpectedCloseDate <= expectedCloseTo.Value);

            if (minAmount.HasValue)
                query = query.Where(o => o.Amount >= minAmount.Value);

            if (maxAmount.HasValue)
                query = query.Where(o => o.Amount <= maxAmount.Value);

            return await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
        }

        // =============================================
        // GET: api/Opportunities/5
        // =============================================
        [HttpGet("{id}")]
        public async Task<ActionResult<Opportunity>> GetOpportunity(int id)
        {
            var opportunity = await _context.Opportunities
                .Include(o => o.Contact)
                .Include(o => o.Company)
                .Include(o => o.StageHistory)
                .Include(o => o.Products)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (opportunity == null) return NotFound();

            // Calculate days in current stage
            // Calculate days in current stage
            if (opportunity.LastStageChangeDate.HasValue)
            {
                opportunity.DaysInCurrentStage = (DateTime.UtcNow - opportunity.LastStageChangeDate.Value).Days;
            }

            // Populate Custom Fields
            opportunity.CustomValues = await _context.CustomFieldValues
                .Include(v => v.CustomFieldDefinition)
                .Where(v => v.EntityId == id && v.EntityType == "Opportunity")
                .ToListAsync();

            return opportunity;
        }

        // =============================================
        // GET: api/Opportunities/pipeline
        // =============================================
        [HttpGet("pipeline")]
        public async Task<ActionResult<IEnumerable<object>>> GetPipeline()
        {
            var opportunities = await _context.Opportunities
                .Include(o => o.Contact)
                .Where(o => o.Stage != "Closed Won" && o.Stage != "Closed Lost")
                .OrderBy(o => o.ExpectedCloseDate)
                .Select(o => new
                {
                    o.Id,
                    o.Name,
                    o.Amount,
                    o.Stage,
                    o.Probability,
                    o.WeightedValue,
                    o.ExpectedCloseDate,
                    o.DealScore,
                    o.DealHealth,
                    o.NextAction,
                    o.NextActionDate,
                    o.Owner,
                    o.PrimaryCompetitor,
                    ContactName = o.Contact != null ? $"{o.Contact.FirstName} {o.Contact.LastName}" : null,
                    o.ContactId,
                    Color = GetStageColor(o.Stage)
                })
                .ToListAsync();

            return Ok(opportunities);
        }

        // =============================================
        // GET: api/Opportunities/kanban
        // =============================================
        [HttpGet("kanban")]
        public async Task<ActionResult<object>> GetKanbanView()
        {
            var opportunities = await _context.Opportunities
                .Include(o => o.Contact)
                .Include(o => o.Company)
                .OrderBy(o => o.ExpectedCloseDate)
                .ToListAsync();

            var kanban = OpportunityStages.All.ToDictionary(
                stage => stage,
                stage => opportunities
                    .Where(o => o.Stage == stage)
                    .Select(o => new
                    {
                        o.Id,
                        o.Name,
                        o.Amount,
                        o.WeightedValue,
                        o.Probability,
                        o.ExpectedCloseDate,
                        o.DealScore,
                        o.DealHealth,
                        o.NextAction,
                        o.Owner,
                        ContactName = o.Contact != null ? $"{o.Contact.FirstName} {o.Contact.LastName}" : null,
                        CompanyName = o.Company?.Name,
                        DaysInStage = o.LastStageChangeDate.HasValue 
                            ? (DateTime.UtcNow - o.LastStageChangeDate.Value).Days 
                            : 0
                    })
                    .ToList()
            );

            var stageTotals = OpportunityStages.All.ToDictionary(
                stage => stage,
                stage => new
                {
                    Count = opportunities.Count(o => o.Stage == stage),
                    TotalValue = opportunities.Where(o => o.Stage == stage).Sum(o => o.Amount),
                    WeightedValue = opportunities.Where(o => o.Stage == stage).Sum(o => o.WeightedValue)
                }
            );

            return Ok(new { stages = kanban, totals = stageTotals });
        }

        // =============================================
        // POST: api/Opportunities
        // =============================================
        [HttpPost]
        public async Task<ActionResult<Opportunity>> PostOpportunity(Opportunity opportunity)
        {
            opportunity.CreatedAt = DateTime.UtcNow;
            opportunity.LastModifiedAt = DateTime.UtcNow;
            opportunity.LastStageChangeDate = DateTime.UtcNow;

            // Set default probability based on stage
            if (OpportunityStages.DefaultProbabilities.TryGetValue(opportunity.Stage, out var defaultProb))
            {
                if (opportunity.Probability == 0)
                    opportunity.Probability = defaultProb;
            }

            // Calculate weighted value
            opportunity.WeightedValue = opportunity.Amount * ((decimal)opportunity.Probability / 100);

            // Calculate deal score
            opportunity.DealScore = CalculateDealScore(opportunity);
            opportunity.DealHealth = GetDealHealth(opportunity.DealScore);

            _context.Opportunities.Add(opportunity);
            await _context.SaveChangesAsync();

            // Create initial stage history
            var stageHistory = new StageHistory
            {
                OpportunityId = opportunity.Id,
                FromStage = "",
                ToStage = opportunity.Stage,
                ChangedAt = DateTime.UtcNow,
                ChangedByUserId = 1
            };
            _context.StageHistories.Add(stageHistory);
            await _context.SaveChangesAsync();

            // Handle Custom Values for Create
             if (opportunity.CustomValues != null && opportunity.CustomValues.Any())
            {
                foreach (var field in opportunity.CustomValues)
                {
                    field.EntityId = opportunity.Id;
                    field.EntityType = "Opportunity";
                    field.UpdatedAt = DateTime.UtcNow;
                    field.CustomFieldDefinition = null; 
                    _context.CustomFieldValues.Add(field);
                }
                await _context.SaveChangesAsync();
            }
            // Trigger Workflows
            await _workflowService.TriggerOnCreate("Opportunity", opportunity.Id, opportunity);

            return CreatedAtAction(nameof(GetOpportunity), new { id = opportunity.Id }, opportunity);
        }

        // =============================================
        // PUT: api/Opportunities/5
        // =============================================
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOpportunity(int id, Opportunity opportunity)
        {
            if (id != opportunity.Id) return BadRequest();

            var existingOpportunity = await _context.Opportunities.FindAsync(id);
            if (existingOpportunity == null) return NotFound();

            // Track stage change
            if (existingOpportunity.Stage != opportunity.Stage)
            {
                var stageHistory = new StageHistory
                {
                    OpportunityId = id,
                    FromStage = existingOpportunity.Stage,
                    ToStage = opportunity.Stage,
                    ChangedAt = DateTime.UtcNow,
                    ChangedByUserId = 1,
                    DaysInPreviousStage = existingOpportunity.LastStageChangeDate.HasValue
                        ? (DateTime.UtcNow - existingOpportunity.LastStageChangeDate.Value).Days
                        : 0
                };
                _context.StageHistories.Add(stageHistory);

                existingOpportunity.LastStageChangeDate = DateTime.UtcNow;
                existingOpportunity.DaysInCurrentStage = 0;

                // Handle Win/Loss
                if (opportunity.Stage == "Closed Won")
                {
                    existingOpportunity.WonDate = DateTime.UtcNow;
                    existingOpportunity.ActualCloseDate = DateTime.UtcNow;
                    existingOpportunity.TotalDaysToClose = (DateTime.UtcNow - existingOpportunity.CreatedAt).Days;
                }
                else if (opportunity.Stage == "Closed Lost")
                {
                    existingOpportunity.LostDate = DateTime.UtcNow;
                    existingOpportunity.ActualCloseDate = DateTime.UtcNow;
                    existingOpportunity.TotalDaysToClose = (DateTime.UtcNow - existingOpportunity.CreatedAt).Days;
                }
            }

            // Update fields
            existingOpportunity.Name = opportunity.Name;
            existingOpportunity.Amount = opportunity.Amount;
            existingOpportunity.Stage = opportunity.Stage;
            existingOpportunity.Probability = opportunity.Probability;
            existingOpportunity.ExpectedCloseDate = opportunity.ExpectedCloseDate;
            existingOpportunity.Description = opportunity.Description;
            existingOpportunity.ContactId = opportunity.ContactId;
            existingOpportunity.CompanyId = opportunity.CompanyId;
            existingOpportunity.LastModifiedAt = DateTime.UtcNow;

            // Update new fields
            existingOpportunity.NextAction = opportunity.NextAction;
            existingOpportunity.NextActionDate = opportunity.NextActionDate;
            existingOpportunity.NextActionOwner = opportunity.NextActionOwner;
            existingOpportunity.Tags = opportunity.Tags;
            existingOpportunity.LostReason = opportunity.LostReason;
            existingOpportunity.WinReason = opportunity.WinReason;
            existingOpportunity.WinLossNotes = opportunity.WinLossNotes;
            existingOpportunity.Owner = opportunity.Owner;
            existingOpportunity.Source = opportunity.Source;
            existingOpportunity.Type = opportunity.Type;
            existingOpportunity.ForecastCategory = opportunity.ForecastCategory;
            existingOpportunity.Competitors = opportunity.Competitors;
            existingOpportunity.PrimaryCompetitor = opportunity.PrimaryCompetitor;
            existingOpportunity.CompetitivePosition = opportunity.CompetitivePosition;
            existingOpportunity.RecurringValue = opportunity.RecurringValue;
            existingOpportunity.Currency = opportunity.Currency;

             // Handle Custom Values Update
            if (opportunity.CustomValues != null)
            {
                foreach (var val in opportunity.CustomValues)
                {
                    var existing = await _context.CustomFieldValues
                        .FirstOrDefaultAsync(v => v.EntityId == id && v.EntityType == "Opportunity" && v.CustomFieldDefinitionId == val.CustomFieldDefinitionId);
                        
                    if (existing != null)
                    {
                        existing.Value = val.Value;
                        existing.UpdatedAt = DateTime.UtcNow;
                        _context.Entry(existing).State = EntityState.Modified;
                    }
                    else
                    {
                        val.EntityId = id;
                        val.EntityType = "Opportunity";
                        val.UpdatedAt = DateTime.UtcNow;
                        val.CustomFieldDefinition = null!;
                        _context.CustomFieldValues.Add(val);
                    }
                }
            }

            // Recalculate weighted value
            existingOpportunity.WeightedValue = existingOpportunity.Amount * ((decimal)existingOpportunity.Probability / 100);

            // Recalculate deal score
            existingOpportunity.DealScore = CalculateDealScore(existingOpportunity);
            existingOpportunity.DealHealth = GetDealHealth(existingOpportunity.DealScore);

            try
            {
                await _context.SaveChangesAsync();
                
                // Trigger Workflows
                await _workflowService.TriggerOnUpdate("Opportunity", id, existingOpportunity);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OpportunityExists(id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        // =============================================
        // PUT: api/Opportunities/5/stage
        // =============================================
        [HttpPut("{id}/stage")]
        public async Task<IActionResult> UpdateStage(int id, [FromBody] StageUpdateDto dto)
        {
            var opportunity = await _context.Opportunities.FindAsync(id);
            if (opportunity == null) return NotFound();

            if (opportunity.Stage == dto.Stage) return NoContent();

            // Create stage history
            var stageHistory = new StageHistory
            {
                OpportunityId = id,
                FromStage = opportunity.Stage,
                ToStage = dto.Stage,
                ChangedAt = DateTime.UtcNow,
                ChangedByUserId = 1,
                DaysInPreviousStage = opportunity.LastStageChangeDate.HasValue
                    ? (DateTime.UtcNow - opportunity.LastStageChangeDate.Value).Days
                    : 0
            };
            _context.StageHistories.Add(stageHistory);

            opportunity.Stage = dto.Stage;
            opportunity.LastStageChangeDate = DateTime.UtcNow;
            opportunity.DaysInCurrentStage = 0;
            opportunity.LastModifiedAt = DateTime.UtcNow;

            // Update probability if provided or use default
            if (dto.Probability.HasValue)
                opportunity.Probability = dto.Probability.Value;
            else if (OpportunityStages.DefaultProbabilities.TryGetValue(dto.Stage, out var defaultProb))
                opportunity.Probability = defaultProb;

            // Handle close
            if (dto.Stage == "Closed Won")
            {
                opportunity.WonDate = DateTime.UtcNow;
                opportunity.ActualCloseDate = DateTime.UtcNow;
                opportunity.WinReason = dto.Reason;
                opportunity.TotalDaysToClose = (DateTime.UtcNow - opportunity.CreatedAt).Days;
            }
            else if (dto.Stage == "Closed Lost")
            {
                opportunity.LostDate = DateTime.UtcNow;
                opportunity.ActualCloseDate = DateTime.UtcNow;
                opportunity.LostReason = dto.Reason;
                opportunity.TotalDaysToClose = (DateTime.UtcNow - opportunity.CreatedAt).Days;
            }

            // Recalculate
            opportunity.WeightedValue = opportunity.Amount * ((decimal)opportunity.Probability / 100);
            opportunity.DealScore = CalculateDealScore(opportunity);
            opportunity.DealHealth = GetDealHealth(opportunity.DealScore);

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // =============================================
        // DELETE: api/Opportunities/5
        // =============================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOpportunity(int id)
        {
            var opportunity = await _context.Opportunities.FindAsync(id);
            if (opportunity == null) return NotFound();

            _context.Opportunities.Remove(opportunity);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // =============================================
        // GET: api/Opportunities/contact/{contactId}
        // =============================================
        [HttpGet("contact/{contactId}")]
        public async Task<ActionResult<IEnumerable<Opportunity>>> GetOpportunitiesByContact(int contactId)
        {
            return await _context.Opportunities
                .Where(o => o.ContactId == contactId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        // =============================================
        // GET: api/Opportunities/{id}/activities
        // =============================================
        [HttpGet("{id}/activities")]
        public async Task<ActionResult<IEnumerable<Activity>>> GetActivities(int id)
        {
            if (!OpportunityExists(id)) return NotFound();

            var activities = await _context.Activities
                .Where(a => a.OpportunityId == id)
                .Include(a => a.Contact)
                .OrderByDescending(a => a.StartTime)
                .ToListAsync();

            return Ok(activities);
        }

        // =============================================
        // GET: api/Opportunities/stats
        // =============================================
        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetStats()
        {
            var opportunities = await _context.Opportunities.ToListAsync();
            var open = opportunities.Where(o => o.Stage != "Closed Won" && o.Stage != "Closed Lost");
            var won = opportunities.Where(o => o.Stage == "Closed Won");
            var lost = opportunities.Where(o => o.Stage == "Closed Lost");

            return Ok(new
            {
                TotalOpportunities = opportunities.Count,
                OpenOpportunities = open.Count(),
                WonOpportunities = won.Count(),
                LostOpportunities = lost.Count(),
                
                TotalPipelineValue = open.Sum(o => o.Amount),
                WeightedPipelineValue = open.Sum(o => o.WeightedValue),
                TotalWonValue = won.Sum(o => o.Amount),
                TotalLostValue = lost.Sum(o => o.Amount),
                
                WinRate = opportunities.Any(o => o.ActualCloseDate.HasValue)
                    ? (double)won.Count() / (won.Count() + lost.Count()) * 100
                    : 0,
                    
                AvgDealSize = won.Any() ? won.Average(o => o.Amount) : 0,
                AvgDaysToClose = won.Any() && won.Any(o => o.TotalDaysToClose > 0) 
                    ? won.Where(o => o.TotalDaysToClose > 0).Average(o => o.TotalDaysToClose) 
                    : 0,
                    
                ByStage = OpportunityStages.All.Select(stage => new
                {
                    Stage = stage,
                    Count = opportunities.Count(o => o.Stage == stage),
                    TotalValue = opportunities.Where(o => o.Stage == stage).Sum(o => o.Amount),
                    WeightedValue = opportunities.Where(o => o.Stage == stage).Sum(o => o.WeightedValue),
                    Color = GetStageColor(stage)
                }),
                
                ByForecast = new[] { "Pipeline", "Best Case", "Commit", "Closed", "Omitted" }.Select(cat => new
                {
                    Category = cat,
                    Count = open.Count(o => o.ForecastCategory == cat),
                    Value = open.Where(o => o.ForecastCategory == cat).Sum(o => o.Amount)
                }),
                
                AtRiskDeals = open.Count(o => o.DealHealth == "At Risk" || o.DealHealth == "Stalled"),
                HotDeals = open.Count(o => o.DealHealth == "Hot")
            });
        }

        // =============================================
        // GET: api/Opportunities/velocity
        // =============================================
        [HttpGet("velocity")]
        public async Task<ActionResult<object>> GetVelocityMetrics()
        {
            var closed = await _context.Opportunities
                .Where(o => o.ActualCloseDate.HasValue)
                .ToListAsync();

            var won = closed.Where(o => o.Stage == "Closed Won");
            var last30Days = closed.Where(o => o.ActualCloseDate >= DateTime.UtcNow.AddDays(-30));

            var stageHistory = await _context.StageHistories
                .GroupBy(sh => sh.ToStage)
                .Select(g => new
                {
                    Stage = g.Key ?? "Unknown",
                    AvgDaysInStage = g.Select(sh => (double)sh.DaysInPreviousStage).DefaultIfEmpty(0).Average()
                })
                .ToListAsync();

            return Ok(new
            {
                AvgSalesCycle = won.Any() && won.Any(o => o.TotalDaysToClose > 0)
                    ? won.Where(o => o.TotalDaysToClose > 0).Average(o => o.TotalDaysToClose)
                    : 0,
                DealsClosed30Days = last30Days.Count(),
                RevenueClosed30Days = last30Days.Where(o => o.Stage == "Closed Won").Sum(o => o.Amount),
                WinRate30Days = last30Days.Any() 
                    ? (double)last30Days.Count(o => o.Stage == "Closed Won") / last30Days.Count() * 100 
                    : 0,
                AvgDaysByStage = stageHistory
            });
        }

        // =============================================
        // GET: api/Opportunities/leaderboard
        // =============================================
        [HttpGet("leaderboard")]
        public async Task<ActionResult<IEnumerable<object>>> GetLeaderboard()
        {
            var opportunities = await _context.Opportunities
                .Where(o => !string.IsNullOrWhiteSpace(o.Owner))
                .ToListAsync();

            var leaderboard = opportunities
                .GroupBy(o => o.Owner)
                .Select(g => new
                {
                    Owner = g.Key,
                    TotalDeals = g.Count(),
                    WonDeals = g.Count(o => o.Stage == "Closed Won"),
                    LostDeals = g.Count(o => o.Stage == "Closed Lost"),
                    OpenDeals = g.Count(o => o.Stage != "Closed Won" && o.Stage != "Closed Lost"),
                    WonValue = g.Where(o => o.Stage == "Closed Won").Sum(o => o.Amount),
                    PipelineValue = g.Where(o => o.Stage != "Closed Won" && o.Stage != "Closed Lost").Sum(o => o.Amount),
                    WinRate = g.Any(o => o.ActualCloseDate.HasValue)
                        ? (double)g.Count(o => o.Stage == "Closed Won") / 
                          (g.Count(o => o.Stage == "Closed Won") + g.Count(o => o.Stage == "Closed Lost")) * 100
                        : 0
                })
                .OrderByDescending(x => x.WonValue)
                .ToList();

            return Ok(leaderboard);
        }

        // =============================================
        // GET: api/Opportunities/winloss
        // =============================================
        [HttpGet("winloss")]
        public async Task<ActionResult<object>> GetWinLossAnalysis()
        {
            var closed = await _context.Opportunities
                .Where(o => o.ActualCloseDate.HasValue)
                .ToListAsync();

            var won = closed.Where(o => o.Stage == "Closed Won");
            var lost = closed.Where(o => o.Stage == "Closed Lost");

            return Ok(new
            {
                WinReasonBreakdown = won
                    .Where(o => !string.IsNullOrWhiteSpace(o.WinReason))
                    .GroupBy(o => o.WinReason)
                    .Select(g => new { Reason = g.Key, Count = g.Count(), Value = g.Sum(o => o.Amount) })
                    .OrderByDescending(x => x.Count),

                LossReasonBreakdown = lost
                    .Where(o => !string.IsNullOrWhiteSpace(o.LostReason))
                    .GroupBy(o => o.LostReason)
                    .Select(g => new { Reason = g.Key, Count = g.Count(), Value = g.Sum(o => o.Amount) })
                    .OrderByDescending(x => x.Count),

                WinsBySource = won
                    .Where(o => !string.IsNullOrWhiteSpace(o.Source))
                    .GroupBy(o => o.Source)
                    .Select(g => new { Source = g.Key, Count = g.Count(), Value = g.Sum(o => o.Amount) })
                    .OrderByDescending(x => x.Value),

                WinsByCompetitor = won
                    .Where(o => !string.IsNullOrWhiteSpace(o.PrimaryCompetitor))
                    .GroupBy(o => o.PrimaryCompetitor)
                    .Select(g => new { Competitor = g.Key, WonAgainst = g.Count() })
                    .OrderByDescending(x => x.WonAgainst)
            });
        }

        // =============================================
        // GET: api/Opportunities/options
        // =============================================
        [HttpGet("options")]
        public ActionResult<object> GetOptions()
        {
            return Ok(new
            {
                Stages = OpportunityStages.All,
                StageColors = OpportunityStages.Colors,
                DefaultProbabilities = OpportunityStages.DefaultProbabilities,
                WinReasons = OpportunityOptions.WinReasons,
                LossReasons = OpportunityOptions.LossReasons,
                Sources = OpportunityOptions.Sources,
                Types = OpportunityOptions.Types,
                ForecastCategories = OpportunityOptions.ForecastCategories,
                DealHealthOptions = OpportunityOptions.DealHealthOptions
            });
        }

        // =============================================
        // Products/Line Items
        // =============================================
        [HttpGet("{id}/products")]
        public async Task<ActionResult<IEnumerable<OpportunityProduct>>> GetProducts(int id)
        {
            var products = await _context.OpportunityProducts
                .Where(p => p.OpportunityId == id)
                .OrderBy(p => p.CreatedAt)
                .ToListAsync();

            return Ok(products);
        }

        [HttpPost("{id}/products")]
        public async Task<ActionResult<OpportunityProduct>> AddProduct(int id, OpportunityProduct product)
        {
            var opportunity = await _context.Opportunities.FindAsync(id);
            if (opportunity == null) return NotFound();

            product.OpportunityId = id;
            product.CreatedAt = DateTime.UtcNow;

            // Calculate total price
            var discountAmount = product.DiscountType == "Percentage"
                ? product.UnitPrice * product.Quantity * (product.Discount ?? 0) / 100
                : (product.Discount ?? 0);

            product.TotalPrice = (product.UnitPrice * product.Quantity) - discountAmount;

            _context.OpportunityProducts.Add(product);
            await _context.SaveChangesAsync();

            // Update opportunity amount
            await UpdateOpportunityAmount(id);

            return CreatedAtAction(nameof(GetProducts), new { id }, product);
        }

        [HttpDelete("{id}/products/{productId}")]
        public async Task<IActionResult> DeleteProduct(int id, int productId)
        {
            var product = await _context.OpportunityProducts.FindAsync(productId);
            if (product == null || product.OpportunityId != id) return NotFound();

            _context.OpportunityProducts.Remove(product);
            await _context.SaveChangesAsync();

            // Update opportunity amount
            await UpdateOpportunityAmount(id);

            return NoContent();
        }

        // =============================================
        // Helper Methods
        // =============================================
        private bool OpportunityExists(int id)
        {
            return _context.Opportunities.Any(e => e.Id == id);
        }

        private static string GetStageColor(string? stage)
        {
            if (string.IsNullOrEmpty(stage)) return "#6366F1";
            return OpportunityStages.Colors.TryGetValue(stage, out var color) ? color : "#6366F1";
        }

        private async Task UpdateOpportunityAmount(int opportunityId)
        {
            var products = await _context.OpportunityProducts
                .Where(p => p.OpportunityId == opportunityId)
                .ToListAsync();

            var totalAmount = products.Sum(p => p.TotalPrice);

            var opportunity = await _context.Opportunities.FindAsync(opportunityId);
            if (opportunity != null && products.Any())
            {
                opportunity.Amount = totalAmount;
                opportunity.WeightedValue = totalAmount * ((decimal)opportunity.Probability / 100);
                opportunity.LastModifiedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        private int CalculateDealScore(Opportunity opp)
        {
            int score = 50; // Base score

            // Probability factor (max +30)
            score += (int)(opp.Probability * 0.3);

            // Has next action (+10)
            if (!string.IsNullOrWhiteSpace(opp.NextAction)) score += 10;

            // Next action is upcoming (+5)
            if (opp.NextActionDate.HasValue && opp.NextActionDate.Value > DateTime.UtcNow 
                && opp.NextActionDate.Value <= DateTime.UtcNow.AddDays(7)) score += 5;

            // Has contact (-10 if missing)
            if (!opp.ContactId.HasValue) score -= 10;

            // Close date is near (+10)
            if (opp.ExpectedCloseDate <= DateTime.UtcNow.AddDays(30)) score += 10;

            // Overdue (-20)
            if (opp.ExpectedCloseDate < DateTime.UtcNow) score -= 20;

            // Too long in stage (-10)
            if (opp.DaysInCurrentStage > 30) score -= 10;
            if (opp.DaysInCurrentStage > 60) score -= 10;

            return Math.Clamp(score, 0, 100);
        }

        private string GetDealHealth(int score)
        {
            return score switch
            {
                >= 80 => "Hot",
                >= 50 => "Healthy",
                >= 30 => "At Risk",
                _ => "Stalled"
            };
        }
        // POST: api/opportunities/search
        [HttpPost("search")]
        public async Task<ActionResult<IEnumerable<Opportunity>>> SearchOpportunities(AdvancedSearchRequestDto request)
        {
            var query = _context.Opportunities
                .Include(o => o.Contact)
                .Include(o => o.Company)
                .AsQueryable();

            if (request.Criteria == null || !request.Criteria.Any())
            {
                return await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
            }

            if (request.MatchType == "Any")
            {
                var combinedResults = new List<Opportunity>();
                foreach (var criteria in request.Criteria)
                {
                    var fieldQuery = _context.Opportunities
                        .Include(o => o.Contact)
                        .Include(o => o.Company)
                        .AsQueryable();
                    fieldQuery = ApplyCriteria(fieldQuery, criteria);
                    combinedResults.AddRange(await fieldQuery.ToListAsync());
                }
                return combinedResults.DistinctBy(o => o.Id).OrderByDescending(o => o.CreatedAt).ToList();
            }
            else
            {
                foreach (var criteria in request.Criteria)
                {
                    query = ApplyCriteria(query, criteria);
                }
                return await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
            }
        }

        private IQueryable<Opportunity> ApplyCriteria(IQueryable<Opportunity> query, SearchCriteriaDto criteria)
        {
            var field = criteria.Field.ToLower();
            var op = criteria.Operator;
            var val = criteria.Value; // Case sensitive for parsing, lower for string match

            if (string.IsNullOrEmpty(val)) return query;

            switch (field)
            {
                case "name":
                case "opportunity":
                    if (op == "Contains") return query.Where(o => o.Name.ToLower().Contains(val.ToLower()));
                    else if (op == "Equals") return query.Where(o => o.Name.ToLower() == val.ToLower());
                    break;
                case "stage":
                    if (op == "Contains") return query.Where(o => o.Stage.ToLower().Contains(val.ToLower()));
                    else if (op == "Equals") return query.Where(o => o.Stage == val);
                    break;
                case "amount":
                    if (decimal.TryParse(val, out var amountVal))
                    {
                        if (op == "Greater Than" || op == ">") return query.Where(o => o.Amount > amountVal);
                        else if (op == "Less Than" || op == "<") return query.Where(o => o.Amount < amountVal);
                        else if (op == "Equals" || op == "=") return query.Where(o => o.Amount == amountVal);
                    }
                    else
                    {
                        // Fallback to string match if not a number? Or ignore.
                    }
                    break;
                case "probability":
                    if (double.TryParse(val, out var probVal))
                    {
                        if (op == "Greater Than" || op == ">") return query.Where(o => o.Probability > probVal);
                        else if (op == "Less Than" || op == "<") return query.Where(o => o.Probability < probVal);
                        else if (op == "Equals" || op == "=") return query.Where(o => o.Probability == probVal);
                    }
                    break;
                case "contact":
                    if (op == "Contains") return query.Where(o => o.Contact != null && (o.Contact.FirstName.ToLower().Contains(val.ToLower()) || o.Contact.LastName.ToLower().Contains(val.ToLower())));
                    break;
                case "company":
                    if (op == "Contains") return query.Where(o => o.Company != null && o.Company.Name.ToLower().Contains(val.ToLower()));
                    break;
            }
            return query;
        }

        // =============================================
        // GET: api/Opportunities/win-loss-analysis
        // =============================================
        [HttpGet("win-loss-analysis")]
        public async Task<ActionResult<object>> GetWinLossAnalysis([FromQuery] string timeRange = "all")
        {
            var query = _context.Opportunities
                .Where(o => o.ActualCloseDate.HasValue);

            // Apply time range filter
            if (timeRange == "30days")
                query = query.Where(o => o.ActualCloseDate >= DateTime.UtcNow.AddDays(-30));
            else if (timeRange == "90days")
                query = query.Where(o => o.ActualCloseDate >= DateTime.UtcNow.AddDays(-90));
            else if (timeRange == "year")
                query = query.Where(o => o.ActualCloseDate >= DateTime.UtcNow.AddYears(-1));

            var closedOpps = await query.ToListAsync();
            var won = closedOpps.Where(o => o.Stage == "Closed Won").ToList();
            var lost = closedOpps.Where(o => o.Stage == "Closed Lost").ToList();

            var totalClosed = won.Count + lost.Count;

            // Stats
            var stats = new
            {
                TotalOpportunities = totalClosed,
                WonCount = won.Count,
                LostCount = lost.Count,
                WinRate = totalClosed > 0 ? (double)won.Count / totalClosed * 100 : 0,
                TotalWonValue = won.Sum(o => o.Amount),
                TotalLostValue = lost.Sum(o => o.Amount),
                AvgWonValue = won.Any() ? won.Average(o => o.Amount) : 0,
                AvgLostValue = lost.Any() ? lost.Average(o => o.Amount) : 0,
                AvgDaysToWin = won.Any() && won.Any(o => o.TotalDaysToClose > 0)
                    ? won.Where(o => o.TotalDaysToClose > 0).Average(o => o.TotalDaysToClose)
                    : 0,
                AvgDaysToLose = lost.Any() && lost.Any(o => o.TotalDaysToClose > 0)
                    ? lost.Where(o => o.TotalDaysToClose > 0).Average(o => o.TotalDaysToClose)
                    : 0
            };

            // Win Reasons
            var winReasons = won
                .Where(o => !string.IsNullOrWhiteSpace(o.WinReason))
                .GroupBy(o => o.WinReason)
                .Select(g => new
                {
                    Reason = g.Key,
                    Count = g.Count(),
                    Percentage = totalClosed > 0 ? (double)g.Count() / won.Count * 100 : 0,
                    TotalValue = g.Sum(o => o.Amount)
                })
                .OrderByDescending(x => x.Count)
                .ToList();

            // Loss Reasons
            var lossReasons = lost
                .Where(o => !string.IsNullOrWhiteSpace(o.LostReason))
                .GroupBy(o => o.LostReason)
                .Select(g => new
                {
                    Reason = g.Key,
                    Count = g.Count(),
                    Percentage = totalClosed > 0 ? (double)g.Count() / lost.Count * 100 : 0,
                    TotalValue = g.Sum(o => o.Amount)
                })
                .OrderByDescending(x => x.Count)
                .ToList();

            // Competitor Analysis
            var allCompetitors = closedOpps
                .Where(o => !string.IsNullOrWhiteSpace(o.PrimaryCompetitor))
                .Select(o => o.PrimaryCompetitor!)
                .Distinct()
                .ToList();

            var competitorAnalysis = allCompetitors.Select(comp =>
            {
                var wonAgainst = won.Count(o => o.PrimaryCompetitor == comp);
                var lostAgainst = lost.Count(o => o.PrimaryCompetitor == comp);
                var total = wonAgainst + lostAgainst;

                return new
                {
                    Competitor = comp,
                    WonAgainst = wonAgainst,
                    LostAgainst = lostAgainst,
                    WinRate = total > 0 ? (double)wonAgainst / total * 100 : 0
                };
            })
            .OrderByDescending(x => x.WonAgainst + x.LostAgainst)
            .ToList();

            // Stage Analysis
            var stageHistory = await _context.StageHistories
                .Where(sh => sh.ToStage == "Closed Won" || sh.ToStage == "Closed Lost")
                .ToListAsync();

            var stageAnalysis = stageHistory
                .GroupBy(sh => sh.FromStage)
                .Select(g =>
                {
                    var wonFromStage = g.Count(sh => sh.ToStage == "Closed Won");
                    var lostFromStage = g.Count(sh => sh.ToStage == "Closed Lost");
                    var total = wonFromStage + lostFromStage;

                    return new
                    {
                        Stage = g.Key,
                        WonFromStage = wonFromStage,
                        LostFromStage = lostFromStage,
                        ConversionRate = total > 0 ? (double)wonFromStage / total * 100 : 0
                    };
                })
                .Where(x => !string.IsNullOrEmpty(x.Stage))
                .OrderByDescending(x => x.WonFromStage + x.LostFromStage)
                .ToList();

            return Ok(new
            {
                Stats = stats,
                WinReasons = winReasons,
                LossReasons = lossReasons,
                CompetitorAnalysis = competitorAnalysis,
                StageAnalysis = stageAnalysis
            });
        }

        // =============================================
        // GET: api/Opportunities/stage-velocity
        // =============================================
        [HttpGet("stage-velocity")]
        public async Task<ActionResult<object>> GetStageVelocity()
        {
            var stageHistory = await _context.StageHistories
                .Where(sh => sh.DaysInPreviousStage > 0)
                .ToListAsync();

            var stageVelocity = stageHistory
                .GroupBy(sh => sh.FromStage)
                .Select(g => new
                {
                    Stage = g.Key,
                    AvgDaysInStage = g.Average(sh => sh.DaysInPreviousStage),
                    Count = g.Count(),
                    MinDays = g.Min(sh => sh.DaysInPreviousStage),
                    MaxDays = g.Max(sh => sh.DaysInPreviousStage)
                })
                .Where(x => !string.IsNullOrEmpty(x.Stage))
                .OrderBy(x => OpportunityStages.All.IndexOf(x.Stage))
                .ToList();

            return Ok(stageVelocity);
        }

        // =============================================
        // GET: api/Opportunities/velocity-trends
        // =============================================
        [HttpGet("velocity-trends")]
        public async Task<ActionResult<object>> GetVelocityTrends()
        {
            var closedOpps = await _context.Opportunities
                .Where(o => o.ActualCloseDate.HasValue && o.TotalDaysToClose > 0)
                .OrderByDescending(o => o.ActualCloseDate)
                .ToListAsync();

            // Group by month for trends
            var trends = closedOpps
                .GroupBy(o => new
                {
                    Year = o.ActualCloseDate!.Value.Year,
                    Month = o.ActualCloseDate!.Value.Month
                })
                .Select(g => new
                {
                    Period = $"{g.Key.Month:D2}/{g.Key.Year}",
                    AvgDays = g.Average(o => o.TotalDaysToClose),
                    DealsCount = g.Count()
                })
                .OrderByDescending(x => x.Period)
                .Take(6)
                .Reverse()
                .ToList();

            return Ok(trends);
        }
    }

    // =============================================
    // DTOs
    // =============================================
    public class StageUpdateDto
    {
        public string Stage { get; set; } = string.Empty;
        public double? Probability { get; set; }
        public string? Reason { get; set; }
    }
}

