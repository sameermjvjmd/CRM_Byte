using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WorkflowsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public WorkflowsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/workflows
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WorkflowRule>>> GetWorkflows(
            [FromQuery] string? entityType,
            [FromQuery] string? triggerType,
            [FromQuery] bool? active)
        {
            var query = _context.WorkflowRules.AsQueryable();

            if (!string.IsNullOrWhiteSpace(entityType))
            {
                query = query.Where(w => w.EntityType == entityType);
            }

            if (!string.IsNullOrWhiteSpace(triggerType))
            {
                query = query.Where(w => w.TriggerType == triggerType);
            }

            if (active.HasValue)
            {
                query = query.Where(w => w.IsActive == active.Value);
            }

            return await query
                .OrderBy(w => w.Priority)
                .ThenBy(w => w.Name)
                .ToListAsync();
        }

        // GET: api/workflows/5
        [HttpGet("{id}")]
        public async Task<ActionResult<WorkflowRule>> GetWorkflow(int id)
        {
            var workflow = await _context.WorkflowRules.FindAsync(id);

            if (workflow == null)
            {
                return NotFound();
            }

            return workflow;
        }

        // GET: api/workflows/trigger-types
        [HttpGet("trigger-types")]
        public ActionResult<IEnumerable<string>> GetTriggerTypes()
        {
            return Ok(WorkflowTriggerTypes.All);
        }

        // GET: api/workflows/action-types
        [HttpGet("action-types")]
        public ActionResult<IEnumerable<string>> GetActionTypes()
        {
            return Ok(WorkflowActionTypes.All);
        }

        // GET: api/workflows/entity-types
        [HttpGet("entity-types")]
        public ActionResult<IEnumerable<string>> GetEntityTypes()
        {
            return Ok(WorkflowEntityTypes.All);
        }

        // POST: api/workflows
        [HttpPost]
        public async Task<ActionResult<WorkflowRule>> PostWorkflow(WorkflowRule workflow)
        {
            workflow.CreatedAt = DateTime.UtcNow;
            workflow.LastModifiedAt = DateTime.UtcNow;

            _context.WorkflowRules.Add(workflow);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetWorkflow), new { id = workflow.Id }, workflow);
        }

        // PUT: api/workflows/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutWorkflow(int id, WorkflowRule workflow)
        {
            if (id != workflow.Id)
            {
                return BadRequest("Workflow ID mismatch");
            }

            var existingWorkflow = await _context.WorkflowRules.FindAsync(id);
            if (existingWorkflow == null)
            {
                return NotFound();
            }

            existingWorkflow.Name = workflow.Name;
            existingWorkflow.Description = workflow.Description;
            existingWorkflow.IsActive = workflow.IsActive;
            existingWorkflow.TriggerType = workflow.TriggerType;
            existingWorkflow.EntityType = workflow.EntityType;
            existingWorkflow.TriggerConditions = workflow.TriggerConditions;
            existingWorkflow.ActionType = workflow.ActionType;
            existingWorkflow.ActionParameters = workflow.ActionParameters;
            existingWorkflow.Priority = workflow.Priority;
            existingWorkflow.DelayMinutes = workflow.DelayMinutes;
            existingWorkflow.StopOnError = workflow.StopOnError;
            existingWorkflow.RetryCount = workflow.RetryCount;
            existingWorkflow.LastModifiedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!WorkflowExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/workflows/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorkflow(int id)
        {
            var workflow = await _context.WorkflowRules.FindAsync(id);
            if (workflow == null)
            {
                return NotFound();
            }

            _context.WorkflowRules.Remove(workflow);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/workflows/5/toggle
        [HttpPatch("{id}/toggle")]
        public async Task<IActionResult> ToggleWorkflow(int id)
        {
            var workflow = await _context.WorkflowRules.FindAsync(id);
            if (workflow == null)
            {
                return NotFound();
            }

            workflow.IsActive = !workflow.IsActive;
            workflow.LastModifiedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { workflow.Id, workflow.IsActive });
        }

        // GET: api/workflows/5/logs
        [HttpGet("{id}/logs")]
        public async Task<ActionResult<IEnumerable<WorkflowExecutionLog>>> GetWorkflowLogs(int id, [FromQuery] int limit = 50)
        {
            var logs = await _context.WorkflowExecutionLogs
                .Where(l => l.WorkflowRuleId == id)
                .OrderByDescending(l => l.StartedAt)
                .Take(limit)
                .ToListAsync();

            return Ok(logs);
        }

        // POST: api/workflows/5/test
        [HttpPost("{id}/test")]
        public async Task<ActionResult> TestWorkflow(int id)
        {
            var workflow = await _context.WorkflowRules.FindAsync(id);
            if (workflow == null)
            {
                return NotFound();
            }

            // Create a test execution log
            var log = new WorkflowExecutionLog
            {
                WorkflowRuleId = id,
                Status = "Success",
                StartedAt = DateTime.UtcNow,
                CompletedAt = DateTime.UtcNow,
                InputData = "{\"test\": true}",
                OutputData = "{\"message\": \"Test execution completed successfully\"}"
            };

            _context.WorkflowExecutionLogs.Add(log);

            // Update stats
            workflow.ExecutionCount++;
            workflow.SuccessCount++;
            workflow.LastExecutedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Test execution completed", logId = log.Id });
        }

        // GET: api/workflows/stats
        [HttpGet("stats")]
        public async Task<ActionResult> GetStats()
        {
            var total = await _context.WorkflowRules.CountAsync();
            var active = await _context.WorkflowRules.CountAsync(w => w.IsActive);
            var totalExecutions = await _context.WorkflowRules.SumAsync(w => w.ExecutionCount);
            var totalSuccess = await _context.WorkflowRules.SumAsync(w => w.SuccessCount);
            var totalFailures = await _context.WorkflowRules.SumAsync(w => w.FailureCount);

            return Ok(new
            {
                totalRules = total,
                activeRules = active,
                inactiveRules = total - active,
                totalExecutions,
                successfulExecutions = totalSuccess,
                failedExecutions = totalFailures,
                successRate = totalExecutions > 0 ? (double)totalSuccess / totalExecutions * 100 : 0
            });
        }

        private bool WorkflowExists(int id)
        {
            return _context.WorkflowRules.Any(e => e.Id == id);
        }
    }
}
