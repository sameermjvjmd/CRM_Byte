using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ActivitiesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ActivitiesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/activities
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Activity>>> GetActivities(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] string? type,
            [FromQuery] bool? completed,
            [FromQuery] int? contactId)
        {
            var query = _context.Activities
                .Include(a => a.Contact)
                .Include(a => a.Company)
                .AsQueryable();

            // Date range filter (for calendar views)
            if (startDate.HasValue)
                query = query.Where(a => a.EndTime >= startDate.Value);
            if (endDate.HasValue)
                query = query.Where(a => a.StartTime <= endDate.Value);

            // Type filter
            if (!string.IsNullOrWhiteSpace(type))
                query = query.Where(a => a.Type == type);

            // Completion filter
            if (completed.HasValue)
                query = query.Where(a => a.IsCompleted == completed.Value);

            // Contact filter
            if (contactId.HasValue)
                query = query.Where(a => a.ContactId == contactId.Value);

            return await query.OrderByDescending(a => a.StartTime).ToListAsync();
        }

        // GET: api/activities/calendar?start=2026-01-01&end=2026-01-31
        [HttpGet("calendar")]
        public async Task<ActionResult<IEnumerable<object>>> GetCalendarActivities(
            [FromQuery] DateTime start,
            [FromQuery] DateTime end)
        {
            var activities = await _context.Activities
                .Include(a => a.Contact)
                .Where(a => a.StartTime <= end && a.EndTime >= start)
                .OrderBy(a => a.StartTime)
                .Select(a => new
                {
                    a.Id,
                    a.Subject,
                    a.Type,
                    Start = a.StartTime,
                    End = a.EndTime,
                    a.IsAllDay,
                    a.IsCompleted,
                    a.Priority,
                    a.IsRecurring,
                    Color = a.Color ?? GetActivityColor(a.Type),
                    ContactName = a.Contact != null ? $"{a.Contact.FirstName} {a.Contact.LastName}" : null,
                    a.ContactId,
                    a.Location
                })
                .ToListAsync();

            return Ok(activities);
        }

        // GET: api/activities/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Activity>> GetActivity(int id)
        {
            var activity = await _context.Activities
                .Include(a => a.Contact)
                .Include(a => a.Company)
                .Include(a => a.Opportunity)
                .Include(a => a.Series)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (activity == null) return NotFound();

            return activity;
        }

        // POST: api/activities
        [HttpPost]
        public async Task<ActionResult<Activity>> PostActivity(Activity activity)
        {
            activity.CreatedAt = DateTime.UtcNow;
            activity.LastModifiedAt = DateTime.UtcNow;

            // If this is a recurring activity, generate instances
            if (activity.IsRecurring && !string.IsNullOrWhiteSpace(activity.RecurrencePattern))
            {
                // Save the master/series activity first
                _context.Activities.Add(activity);
                await _context.SaveChangesAsync();

                // Generate recurring instances
                var instances = GenerateRecurringInstances(activity);
                if (instances.Any())
                {
                    _context.Activities.AddRange(instances);
                    await _context.SaveChangesAsync();
                }
            }
            else
            {
                _context.Activities.Add(activity);
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetActivity), new { id = activity.Id }, activity);
        }

        // PUT: api/activities/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutActivity(int id, Activity activity)
        {
            if (id != activity.Id) return BadRequest();

            var oldActivity = await _context.Activities.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id);
            
            activity.LastModifiedAt = DateTime.UtcNow;
            _context.Entry(activity).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();

                // If activity was just completed, create a History record
                if (activity.IsCompleted && (oldActivity == null || !oldActivity.IsCompleted))
                {
                    activity.CompletedAt = DateTime.UtcNow;
                    
                    var history = new HistoryItem
                    {
                        Type = activity.Type,
                        Regarding = activity.Subject,
                        Result = activity.Result ?? "Completed",
                        Date = DateTime.UtcNow,
                        ContactId = activity.ContactId,
                        CompanyId = activity.CompanyId,
                        OpportunityId = activity.OpportunityId,
                        Details = activity.Outcome ?? activity.Notes ?? "Activity completed.",
                        DurationMinutes = activity.DurationMinutes
                    };
                    _context.HistoryItems.Add(history);
                    await _context.SaveChangesAsync();
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ActivityExists(id)) return NotFound();
                throw;
            }

            return NoContent();
        }

        // PUT: api/activities/5/complete
        [HttpPut("{id}/complete")]
        public async Task<IActionResult> CompleteActivity(int id, [FromBody] CompleteActivityRequest request)
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null) return NotFound();

            activity.IsCompleted = true;
            activity.CompletedAt = DateTime.UtcNow;
            activity.Result = request.Result ?? "Completed";
            activity.Outcome = request.Outcome;
            activity.LastModifiedAt = DateTime.UtcNow;

            // Create history record
            var history = new HistoryItem
            {
                Type = activity.Type,
                Regarding = activity.Subject,
                Result = activity.Result,
                Date = DateTime.UtcNow,
                ContactId = activity.ContactId,
                CompanyId = activity.CompanyId,
                OpportunityId = activity.OpportunityId,
                Details = activity.Outcome ?? activity.Notes ?? "Activity completed.",
                DurationMinutes = activity.DurationMinutes
            };
            _context.HistoryItems.Add(history);

            await _context.SaveChangesAsync();

            return Ok(activity);
        }

        // DELETE: api/activities/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteActivity(int id, [FromQuery] bool deleteSeries = false)
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null) return NotFound();

            if (deleteSeries && activity.SeriesId.HasValue)
            {
                // Delete all activities in the series
                var seriesActivities = await _context.Activities
                    .Where(a => a.SeriesId == activity.SeriesId || a.Id == activity.SeriesId)
                    .ToListAsync();
                _context.Activities.RemoveRange(seriesActivities);
            }
            else
            {
                _context.Activities.Remove(activity);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // GET: api/activities/contact/5
        [HttpGet("contact/{contactId}")]
        public async Task<ActionResult<IEnumerable<Activity>>> GetActivitiesByContact(int contactId)
        {
            return await _context.Activities
                .Where(a => a.ContactId == contactId)
                .OrderByDescending(a => a.StartTime)
                .ToListAsync();
        }

        // GET: api/activities/upcoming
        [HttpGet("upcoming")]
        public async Task<ActionResult<IEnumerable<Activity>>> GetUpcomingActivities([FromQuery] int days = 7)
        {
            var now = DateTime.UtcNow;
            var endDate = now.AddDays(days);

            return await _context.Activities
                .Include(a => a.Contact)
                .Where(a => !a.IsCompleted && a.StartTime >= now && a.StartTime <= endDate)
                .OrderBy(a => a.StartTime)
                .Take(50)
                .ToListAsync();
        }

        // GET: api/activities/overdue
        [HttpGet("overdue")]
        public async Task<ActionResult<IEnumerable<Activity>>> GetOverdueActivities()
        {
            var now = DateTime.UtcNow;

            return await _context.Activities
                .Include(a => a.Contact)
                .Where(a => !a.IsCompleted && a.EndTime < now)
                .OrderBy(a => a.EndTime)
                .Take(50)
                .ToListAsync();
        }

        // GET: api/activities/reminders
        [HttpGet("reminders")]
        public async Task<ActionResult<IEnumerable<Activity>>> GetPendingReminders()
        {
            var now = DateTime.UtcNow;
            var reminderWindow = now.AddMinutes(30); // Check reminders due in next 30 minutes

            return await _context.Activities
                .Include(a => a.Contact)
                .Where(a => a.HasReminder && !a.ReminderSent && !a.IsCompleted &&
                            a.StartTime.AddMinutes(-a.ReminderMinutesBefore) <= reminderWindow &&
                            a.StartTime > now)
                .OrderBy(a => a.StartTime)
                .ToListAsync();
        }

        // PUT: api/activities/5/reminder-sent
        [HttpPut("{id}/reminder-sent")]
        public async Task<IActionResult> MarkReminderSent(int id)
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null) return NotFound();

            activity.ReminderSent = true;
            activity.LastModifiedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/activities/stats
        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetActivityStats([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var now = DateTime.UtcNow;
            var query = _context.Activities.AsQueryable();

            if (startDate.HasValue)
                query = query.Where(a => a.StartTime >= startDate.Value);
            if (endDate.HasValue)
                query = query.Where(a => a.StartTime <= endDate.Value);

            var activities = await query.ToListAsync();

            var stats = new
            {
                TotalActivities = activities.Count,
                CompletedActivities = activities.Count(a => a.IsCompleted),
                PendingActivities = activities.Count(a => !a.IsCompleted && a.StartTime >= now),
                OverdueActivities = activities.Count(a => !a.IsCompleted && a.EndTime < now),
                RecurringActivities = activities.Count(a => a.IsRecurring),
                AllDayEvents = activities.Count(a => a.IsAllDay),
                CountsByType = activities.GroupBy(a => a.Type)
                    .ToDictionary(g => g.Key, g => g.Count()),
                CountsByPriority = activities.GroupBy(a => a.Priority ?? "Normal")
                    .ToDictionary(g => g.Key, g => g.Count()),
                CompletionRate = activities.Count > 0 
                    ? Math.Round((double)activities.Count(a => a.IsCompleted) / activities.Count * 100, 1) 
                    : 0
            };

            return Ok(stats);
        }

        // GET: api/activities/stats/contact/5
        [HttpGet("stats/contact/{contactId}")]
        public async Task<ActionResult<object>> GetContactActivityStats(int contactId)
        {
            var activities = await _context.Activities
                .Where(a => a.ContactId == contactId)
                .ToListAsync();

            var stats = new
            {
                ContactId = contactId,
                TotalActivities = activities.Count,
                EmailCount = activities.Count(a => a.Type == ActivityTypes.Email),
                CallAttemptCount = activities.Count(a => a.Type == ActivityTypes.CallAttempt || (a.Type == ActivityTypes.Call && a.Result == ActivityResults.Attempted)),
                CallReachedCount = activities.Count(a => a.Type == ActivityTypes.CallReached || (a.Type == ActivityTypes.Call && a.IsCompleted && a.Result == ActivityResults.Completed)),
                MeetingCount = activities.Count(a => a.Type == ActivityTypes.Meeting || a.Type == ActivityTypes.Appointment),
                LetterSentCount = activities.Count(a => a.Type == ActivityTypes.Letter),
                LastActivityDate = activities.OrderByDescending(a => a.StartTime).FirstOrDefault()?.StartTime
            };

            return Ok(stats);
        }

        // GET: api/activities/types
        [HttpGet("types")]
        public ActionResult<object> GetActivityTypes()
        {
            return Ok(new
            {
                Types = ActivityTypes.All,
                Colors = ActivityTypes.Colors,
                Results = ActivityResults.All,
                RecurrencePatterns = RecurrencePatterns.All
            });
        }

        // Helper: Generate recurring activity instances
        private List<Activity> GenerateRecurringInstances(Activity master)
        {
            var instances = new List<Activity>();
            var currentDate = master.StartTime;
            var duration = master.EndTime - master.StartTime;
            var count = 0;
            var maxInstances = master.RecurrenceCount ?? 52; // Default max 52 instances (1 year of weekly)

            while (count < maxInstances)
            {
                currentDate = GetNextOccurrence(currentDate, master.RecurrencePattern!, master.RecurrenceInterval, master.RecurrenceDays);
                
                if (master.RecurrenceEndDate.HasValue && currentDate > master.RecurrenceEndDate.Value)
                    break;

                if (currentDate > master.StartTime.AddYears(2)) // Hard limit: 2 years
                    break;

                var instance = new Activity
                {
                    Subject = master.Subject,
                    Type = master.Type,
                    Category = master.Category,
                    StartTime = currentDate,
                    EndTime = currentDate + duration,
                    IsAllDay = master.IsAllDay,
                    Priority = master.Priority,
                    ContactId = master.ContactId,
                    CompanyId = master.CompanyId,
                    OpportunityId = master.OpportunityId,
                    Location = master.Location,
                    Notes = master.Notes,
                    HasReminder = master.HasReminder,
                    ReminderMinutesBefore = master.ReminderMinutesBefore,
                    IsRecurring = true,
                    SeriesId = master.Id,
                    CreatedAt = DateTime.UtcNow
                };

                instances.Add(instance);
                count++;
            }

            return instances;
        }

        private DateTime GetNextOccurrence(DateTime current, string pattern, int interval, string? days)
        {
            return pattern switch
            {
                RecurrencePatterns.Daily => current.AddDays(interval),
                RecurrencePatterns.Weekly => current.AddDays(7 * interval),
                RecurrencePatterns.BiWeekly => current.AddDays(14 * interval),
                RecurrencePatterns.Monthly => current.AddMonths(interval),
                RecurrencePatterns.Yearly => current.AddYears(interval),
                _ => current.AddDays(interval)
            };
        }

        private static string GetActivityColor(string type)
        {
            return ActivityTypes.Colors.TryGetValue(type, out var color) ? color : "#6366F1";
        }

        private bool ActivityExists(int id) => _context.Activities.Any(e => e.Id == id);
    }

    // DTOs
    public class CompleteActivityRequest
    {
        public string? Result { get; set; }
        public string? Outcome { get; set; }
    }
}
