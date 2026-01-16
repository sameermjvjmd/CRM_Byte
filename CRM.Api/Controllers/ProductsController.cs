using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CRM.Api.Data;
using CRM.Api.Models;

namespace CRM.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts(
            [FromQuery] string? search,
            [FromQuery] string? category,
            [FromQuery] bool? activeOnly)
        {
            var query = _context.Products.AsQueryable();

            // Filter by active status
            if (activeOnly == true)
            {
                query = query.Where(p => p.IsActive);
            }

            // Filter by category
            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(p => p.Category == category);
            }

            // Search by name, SKU, or description
            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.ToLower();
                query = query.Where(p =>
                    p.Name.ToLower().Contains(term) ||
                    (p.SKU != null && p.SKU.ToLower().Contains(term)) ||
                    (p.Description != null && p.Description.ToLower().Contains(term))
                );
            }

            return await query.OrderBy(p => p.Name).ToListAsync();
        }

        // GET: api/products/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                return NotFound();
            }

            return product;
        }

        // GET: api/products/categories
        [HttpGet("categories")]
        public ActionResult<IEnumerable<string>> GetCategories()
        {
            return Ok(ProductCategories.All);
        }

        // GET: api/products/billing-frequencies
        [HttpGet("billing-frequencies")]
        public ActionResult<IEnumerable<string>> GetBillingFrequencies()
        {
            return Ok(BillingFrequencies.All);
        }

        // POST: api/products
        [HttpPost]
        public async Task<ActionResult<Product>> PostProduct(Product product)
        {
            product.CreatedAt = DateTime.UtcNow;
            product.LastModifiedAt = DateTime.UtcNow;
            
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        // PUT: api/products/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, Product product)
        {
            if (id != product.Id)
            {
                return BadRequest("Product ID mismatch");
            }

            var existingProduct = await _context.Products.FindAsync(id);
            if (existingProduct == null)
            {
                return NotFound();
            }

            // Update fields
            existingProduct.Name = product.Name;
            existingProduct.SKU = product.SKU;
            existingProduct.Category = product.Category;
            existingProduct.Description = product.Description;
            existingProduct.Price = product.Price;
            existingProduct.Cost = product.Cost;
            existingProduct.Currency = product.Currency;
            existingProduct.IsTaxable = product.IsTaxable;
            existingProduct.TaxRate = product.TaxRate;
            existingProduct.BillingFrequency = product.BillingFrequency;
            existingProduct.IsActive = product.IsActive;
            existingProduct.StockQuantity = product.StockQuantity;
            existingProduct.TrackInventory = product.TrackInventory;
            existingProduct.ImageUrl = product.ImageUrl;
            existingProduct.ExternalId = product.ExternalId;
            existingProduct.Tags = product.Tags;
            existingProduct.LastModifiedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/products/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/products/5/toggle-active
        [HttpPatch("{id}/toggle-active")]
        public async Task<IActionResult> ToggleActive(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            product.IsActive = !product.IsActive;
            product.LastModifiedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { product.Id, product.IsActive });
        }

        // GET: api/products/search
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<object>>> SearchProducts([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q))
            {
                return Ok(Array.Empty<object>());
            }

            var term = q.ToLower();
            var products = await _context.Products
                .Where(p => p.IsActive &&
                    (p.Name.ToLower().Contains(term) ||
                     (p.SKU != null && p.SKU.ToLower().Contains(term))))
                .Take(20)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.SKU,
                    p.Price,
                    p.Category,
                    p.IsTaxable,
                    p.TaxRate
                })
                .ToListAsync();

            return Ok(products);
        }

        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.Id == id);
        }
    }
}
