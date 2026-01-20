using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;
using CRM.Api.Services;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuotesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly WorkflowExecutionService _workflowService;

        public QuotesController(ApplicationDbContext context, WorkflowExecutionService workflowService)
        {
            _context = context;
            _workflowService = workflowService;
        }

        // GET: api/quotes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Quote>>> GetQuotes(
            [FromQuery] string? status,
            [FromQuery] int? contactId,
            [FromQuery] int? opportunityId,
            [FromQuery] string? search)
        {
            var query = _context.Quotes
                .Include(q => q.Contact)
                .Include(q => q.Company)
                .Include(q => q.Opportunity)
                .Include(q => q.LineItems)
                .AsQueryable();

            // Filter by status
            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(q => q.Status == status);
            }

            // Filter by contact
            if (contactId.HasValue)
            {
                query = query.Where(q => q.ContactId == contactId);
            }

            // Filter by opportunity
            if (opportunityId.HasValue)
            {
                query = query.Where(q => q.OpportunityId == opportunityId);
            }

            // Search
            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.ToLower();
                query = query.Where(q =>
                    q.Subject.ToLower().Contains(term) ||
                    q.QuoteNumber.ToLower().Contains(term) ||
                    (q.RecipientName != null && q.RecipientName.ToLower().Contains(term))
                );
            }

            return await query
                .OrderByDescending(q => q.CreatedAt)
                .ToListAsync();
        }

        // GET: api/quotes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Quote>> GetQuote(int id)
        {
            var quote = await _context.Quotes
                .Include(q => q.Contact)
                .Include(q => q.Company)
                .Include(q => q.Opportunity)
                .Include(q => q.LineItems.OrderBy(li => li.SortOrder))
                    .ThenInclude(li => li.Product)
                .Include(q => q.QuoteTemplate)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (quote == null)
            {
                return NotFound();
            }

            return quote;
        }

        // GET: api/quotes/statuses
        [HttpGet("statuses")]
        public ActionResult<IEnumerable<string>> GetStatuses()
        {
            return Ok(QuoteStatus.All);
        }

        // GET: api/quotes/payment-terms
        [HttpGet("payment-terms")]
        public ActionResult<IEnumerable<string>> GetPaymentTerms()
        {
            return Ok(PaymentTerms.All);
        }

        // GET: api/quotes/units
        [HttpGet("units")]
        public ActionResult<IEnumerable<string>> GetUnits()
        {
            return Ok(UnitOfMeasure.All);
        }

        // POST: api/quotes
        [HttpPost]
        public async Task<ActionResult<Quote>> PostQuote(Quote quote)
        {
            // Generate quote number
            var year = DateTime.UtcNow.Year;
            var count = await _context.Quotes.CountAsync(q => q.CreatedAt.Year == year) + 1;
            quote.QuoteNumber = $"Q-{year}-{count:D5}";

            quote.CreatedAt = DateTime.UtcNow;
            quote.LastModifiedAt = DateTime.UtcNow;

            // Assign default template if not specified
            if (quote.QuoteTemplateId == null)
            {
                var defaultTemplate = await _context.QuoteTemplates.FirstOrDefaultAsync(t => t.IsDefault);
                if (defaultTemplate != null)
                {
                    quote.QuoteTemplateId = defaultTemplate.Id;
                }
            }

            // Calculate totals
            CalculateQuoteTotals(quote);

            _context.Quotes.Add(quote);
            await _context.SaveChangesAsync();

            // Trigger workflows for Quote create
            await _workflowService.TriggerOnCreate("Quote", quote.Id, new
            {
                quote.Id,
                quote.QuoteNumber,
                quote.Subject,
                quote.Status,
                quote.Total,
                quote.CreatedAt
            });

            return CreatedAtAction(nameof(GetQuote), new { id = quote.Id }, quote);
        }

        // PUT: api/quotes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutQuote(int id, Quote quote)
        {
            if (id != quote.Id)
            {
                return BadRequest("Quote ID mismatch");
            }

            var existingQuote = await _context.Quotes
                .Include(q => q.LineItems)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (existingQuote == null)
            {
                return NotFound();
            }

            // Update quote properties
            existingQuote.Subject = quote.Subject;
            existingQuote.Status = quote.Status;
            existingQuote.ContactId = quote.ContactId;
            existingQuote.CompanyId = quote.CompanyId;
            existingQuote.OpportunityId = quote.OpportunityId;
            existingQuote.ExpirationDate = quote.ExpirationDate;
            existingQuote.DiscountPercent = quote.DiscountPercent;
            existingQuote.DiscountAmount = quote.DiscountAmount;
            existingQuote.ShippingAmount = quote.ShippingAmount;
            existingQuote.Currency = quote.Currency;
            existingQuote.PaymentTerms = quote.PaymentTerms;
            existingQuote.TermsAndConditions = quote.TermsAndConditions;
            existingQuote.Notes = quote.Notes;
            existingQuote.RecipientName = quote.RecipientName;
            existingQuote.RecipientEmail = quote.RecipientEmail;
            existingQuote.RecipientAddress = quote.RecipientAddress;
            existingQuote.LastModifiedAt = DateTime.UtcNow;

            // Remove old line items
            _context.QuoteLineItems.RemoveRange(existingQuote.LineItems);

            // Add new line items
            if (quote.LineItems != null && quote.LineItems.Any())
            {
                foreach (var item in quote.LineItems)
                {
                    item.QuoteId = id;
                    item.CalculateTotals();
                    item.CreatedAt = DateTime.UtcNow;
                    item.LastModifiedAt = DateTime.UtcNow;
                    _context.QuoteLineItems.Add(item);
                }
            }

            // Recalculate totals
            CalculateQuoteTotals(existingQuote, quote.LineItems?.ToList());

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!QuoteExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/quotes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuote(int id)
        {
            var quote = await _context.Quotes
                .Include(q => q.LineItems)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (quote == null)
            {
                return NotFound();
            }

            _context.QuoteLineItems.RemoveRange(quote.LineItems);
            _context.Quotes.Remove(quote);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/quotes/5/send
        [HttpPost("{id}/send")]
        public async Task<IActionResult> SendQuote(int id, [FromBody] SendQuoteRequest request)
        {
            var quote = await _context.Quotes.FindAsync(id);
            if (quote == null)
            {
                return NotFound();
            }

            quote.Status = QuoteStatus.Sent;
            quote.SentDate = DateTime.UtcNow;
            quote.RecipientEmail = request.Email;
            quote.LastModifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Quote sent successfully", sentTo = request.Email });
        }

        // POST: api/quotes/5/view
        [HttpPost("{id}/view")]
        public async Task<IActionResult> ViewQuote(int id)
        {
            var quote = await _context.Quotes.FindAsync(id);
            if (quote == null)
            {
                return NotFound();
            }

            // Only update status if it's currently Sent (don't overwrite Accepted/Declined)
            if (quote.Status == QuoteStatus.Sent)
            {
                quote.Status = QuoteStatus.Viewed;
                quote.ViewedDate = DateTime.UtcNow;
                quote.LastModifiedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Quote marked as viewed" });
        }

        // POST: api/quotes/5/accept
        [HttpPost("{id}/accept")]
        public async Task<IActionResult> AcceptQuote(int id, [FromBody] AcceptQuoteRequest request)
        {
            var quote = await _context.Quotes.FindAsync(id);
            if (quote == null)
            {
                return NotFound();
            }

            quote.Status = QuoteStatus.Accepted;
            quote.AcceptedDate = DateTime.UtcNow;
            quote.AcceptedByName = request.AcceptedBy;
            quote.AcceptedByEmail = request.Email;
            quote.LastModifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Quote accepted", acceptedAt = quote.AcceptedDate });
        }

        // POST: api/quotes/5/decline
        [HttpPost("{id}/decline")]
        public async Task<IActionResult> DeclineQuote(int id, [FromBody] DeclineQuoteRequest request)
        {
            var quote = await _context.Quotes.FindAsync(id);
            if (quote == null)
            {
                return NotFound();
            }

            quote.Status = QuoteStatus.Declined;
            quote.DeclinedDate = DateTime.UtcNow;
            quote.DeclineReason = request.Reason;
            quote.LastModifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Quote declined", reason = request.Reason });
        }

        // GET: api/quotes/public/{token}
        [HttpGet("public/{token}")]
        public async Task<ActionResult<Quote>> GetQuoteByToken(Guid token)
        {
            var quote = await _context.Quotes
                .Include(q => q.Contact)
                .Include(q => q.Company)
                .Include(q => q.LineItems.OrderBy(li => li.SortOrder))
                .Include(q => q.QuoteTemplate)
                .FirstOrDefaultAsync(q => q.PublicToken == token);

            if (quote == null)
            {
                return NotFound();
            }

            return quote;
        }

        // POST: api/quotes/public/{token}/view
        [HttpPost("public/{token}/view")]
        public async Task<IActionResult> ViewQuoteByToken(Guid token)
        {
            var quote = await _context.Quotes.FirstOrDefaultAsync(q => q.PublicToken == token);
            if (quote == null)
            {
                return NotFound();
            }

            if (quote.Status == QuoteStatus.Sent)
            {
                quote.Status = QuoteStatus.Viewed;
                quote.ViewedDate = DateTime.UtcNow;
                quote.LastModifiedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Quote marked as viewed" });
        }

        // POST: api/quotes/public/{token}/accept
        [HttpPost("public/{token}/accept")]
        public async Task<IActionResult> AcceptQuoteByToken(Guid token, [FromBody] AcceptQuoteRequest request)
        {
            var quote = await _context.Quotes.FirstOrDefaultAsync(q => q.PublicToken == token);
            if (quote == null)
            {
                return NotFound();
            }

            quote.Status = QuoteStatus.Accepted;
            quote.AcceptedDate = DateTime.UtcNow;
            quote.AcceptedByName = request.AcceptedBy;
            quote.AcceptedByEmail = request.Email;
            quote.LastModifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Quote accepted", acceptedAt = quote.AcceptedDate });
        }

        // POST: api/quotes/public/{token}/decline
        [HttpPost("public/{token}/decline")]
        public async Task<IActionResult> DeclineQuoteByToken(Guid token, [FromBody] DeclineQuoteRequest request)
        {
            var quote = await _context.Quotes.FirstOrDefaultAsync(q => q.PublicToken == token);
            if (quote == null)
            {
                return NotFound();
            }

            quote.Status = QuoteStatus.Declined;
            quote.DeclinedDate = DateTime.UtcNow;
            quote.DeclineReason = request.Reason;
            quote.LastModifiedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Quote declined", reason = request.Reason });
        }

        // POST: api/quotes/5/duplicate
        [HttpPost("{id}/duplicate")]
        public async Task<ActionResult<Quote>> DuplicateQuote(int id)
        {
            var original = await _context.Quotes
                .Include(q => q.LineItems)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (original == null)
            {
                return NotFound();
            }

            var year = DateTime.UtcNow.Year;
            var count = await _context.Quotes.CountAsync(q => q.CreatedAt.Year == year) + 1;

            var newQuote = new Quote
            {
                Subject = $"{original.Subject} (Copy)",
                QuoteNumber = $"Q-{year}-{count:D5}",
                Status = QuoteStatus.Draft,
                ContactId = original.ContactId,
                CompanyId = original.CompanyId,
                OpportunityId = original.OpportunityId,
                QuoteDate = DateTime.UtcNow,
                ExpirationDate = DateTime.UtcNow.AddDays(30),
                Subtotal = original.Subtotal,
                DiscountPercent = original.DiscountPercent,
                DiscountAmount = original.DiscountAmount,
                TaxAmount = original.TaxAmount,
                ShippingAmount = original.ShippingAmount,
                Total = original.Total,
                Currency = original.Currency,
                PaymentTerms = original.PaymentTerms,
                TermsAndConditions = original.TermsAndConditions,
                Notes = original.Notes,
                RecipientName = original.RecipientName,
                RecipientEmail = original.RecipientEmail,
                RecipientAddress = original.RecipientAddress,
                OwnerId = original.OwnerId,
                ParentQuoteId = original.Id,
                Version = original.Version + 1,
                CreatedAt = DateTime.UtcNow,
                LastModifiedAt = DateTime.UtcNow
            };

            _context.Quotes.Add(newQuote);
            await _context.SaveChangesAsync();

            // Duplicate line items
            foreach (var item in original.LineItems)
            {
                var newItem = new QuoteLineItem
                {
                    QuoteId = newQuote.Id,
                    ProductId = item.ProductId,
                    Name = item.Name,
                    SKU = item.SKU,
                    Description = item.Description,
                    Quantity = item.Quantity,
                    UnitOfMeasure = item.UnitOfMeasure,
                    UnitPrice = item.UnitPrice,
                    Cost = item.Cost,
                    DiscountPercent = item.DiscountPercent,
                    DiscountAmount = item.DiscountAmount,
                    IsTaxable = item.IsTaxable,
                    TaxRate = item.TaxRate,
                    TaxAmount = item.TaxAmount,
                    LineTotal = item.LineTotal,
                    LineTotalWithTax = item.LineTotalWithTax,
                    SortOrder = item.SortOrder,
                    GroupName = item.GroupName,
                    Notes = item.Notes,
                    CreatedAt = DateTime.UtcNow,
                    LastModifiedAt = DateTime.UtcNow
                };
                _context.QuoteLineItems.Add(newItem);
            }

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetQuote), new { id = newQuote.Id }, newQuote);
        }

        // POST: api/quotes/5/line-items
        [HttpPost("{id}/line-items")]
        public async Task<ActionResult<QuoteLineItem>> AddLineItem(int id, QuoteLineItem item)
        {
            var quote = await _context.Quotes.FindAsync(id);
            if (quote == null)
            {
                return NotFound();
            }

            item.QuoteId = id;
            item.CalculateTotals();
            item.CreatedAt = DateTime.UtcNow;
            item.LastModifiedAt = DateTime.UtcNow;

            _context.QuoteLineItems.Add(item);
            await _context.SaveChangesAsync();

            // Recalculate quote totals
            await RecalculateQuoteTotals(id);

            return CreatedAtAction(nameof(GetQuote), new { id = quote.Id }, item);
        }

        // DELETE: api/quotes/5/line-items/10
        [HttpDelete("{quoteId}/line-items/{itemId}")]
        public async Task<IActionResult> DeleteLineItem(int quoteId, int itemId)
        {
            var item = await _context.QuoteLineItems
                .FirstOrDefaultAsync(li => li.Id == itemId && li.QuoteId == quoteId);

            if (item == null)
            {
                return NotFound();
            }

            _context.QuoteLineItems.Remove(item);
            await _context.SaveChangesAsync();

            // Recalculate quote totals
            await RecalculateQuoteTotals(quoteId);

            return NoContent();
        }

        // Helper methods
        private void CalculateQuoteTotals(Quote quote, List<QuoteLineItem>? lineItems = null)
        {
            var items = lineItems ?? quote.LineItems?.ToList() ?? new List<QuoteLineItem>();

            foreach (var item in items)
            {
                item.CalculateTotals();
            }

            quote.Subtotal = items.Sum(li => li.LineTotal);
            quote.TaxAmount = items.Sum(li => li.TaxAmount);

            // Apply quote-level discount
            var discountedSubtotal = quote.Subtotal;
            if (quote.DiscountPercent > 0)
            {
                quote.DiscountAmount = quote.Subtotal * (quote.DiscountPercent / 100);
            }
            discountedSubtotal -= quote.DiscountAmount;

            quote.Total = discountedSubtotal + quote.TaxAmount + quote.ShippingAmount;
        }

        private async Task RecalculateQuoteTotals(int quoteId)
        {
            var quote = await _context.Quotes
                .Include(q => q.LineItems)
                .FirstOrDefaultAsync(q => q.Id == quoteId);

            if (quote != null)
            {
                CalculateQuoteTotals(quote);
                quote.LastModifiedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        private bool QuoteExists(int id)
        {
            return _context.Quotes.Any(e => e.Id == id);
        }
    }

    // Request DTOs
    public class SendQuoteRequest
    {
        public string Email { get; set; } = string.Empty;
        public string? Message { get; set; }
    }

    public class AcceptQuoteRequest
    {
        public string AcceptedBy { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Signature { get; set; }
    }

    public class DeclineQuoteRequest
    {
        public string? Reason { get; set; }
    }
}
