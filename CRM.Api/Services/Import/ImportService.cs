using ClosedXML.Excel;
using CsvHelper;
using CsvHelper.Configuration;
using CRM.Api.Data;
using CRM.Api.DTOs.Import;
using CRM.Api.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace CRM.Api.Services.Import
{
    public class ImportService : IImportService
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public ImportService(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        public async Task<ImportPreviewResponse> UploadAndPreviewAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty");

            // 1. Save file to temp
            var tempDir = Path.Combine(_environment.ContentRootPath, "TempImports");
            if (!Directory.Exists(tempDir)) Directory.CreateDirectory(tempDir);

            var fileToken = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(tempDir, fileToken);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // 2. Parse preview
            var response = new ImportPreviewResponse { FileToken = fileToken };
            var extension = Path.GetExtension(file.FileName).ToLower();

            if (extension == ".csv")
            {
                PreviewCsv(filePath, response);
            }
            else if (extension == ".xlsx")
            {
                PreviewExcel(filePath, response);
            }
            else
            {
                throw new ArgumentException("Unsupported file format");
            }

            return response;
        }

        public async Task<ImportResult> ExecuteImportAsync(ImportMappingRequest request)
        {
            var tempDir = Path.Combine(_environment.ContentRootPath, "TempImports");
            var filePath = Path.Combine(tempDir, request.FileToken);

            if (!File.Exists(filePath))
                throw new FileNotFoundException("Import file expired or not found");

            var result = new ImportResult();
            var extension = Path.GetExtension(filePath).ToLower();

            try
            {
                if (request.EntityType == "Contact")
                {
                    await ImportContactsAsync(filePath, extension, request, result);
                }
                else
                {
                    result.ErrorCount++;
                    result.Errors.Add("Unsupported entity type for import");
                }
            }
            catch (Exception ex)
            {
                result.ErrorCount++;
                result.Errors.Add($"Fatal error: {ex.Message}");
            }
            // Cleanup? Maybe later or by a cron job. For debugging keeping files is okay for now.
            // File.Delete(filePath); 

            return result;
        }

        private void PreviewCsv(string path, ImportPreviewResponse response)
        {
            using var reader = new StreamReader(path);
            using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture) { PrepareHeaderForMatch = args => args.Header.ToLower() });
            
            // Read Header
            csv.Read();
            csv.ReadHeader();
            response.Headers = csv.HeaderRecord.ToList();

            // Read first 5 rows
            int count = 0;
            while (count < 5 && csv.Read())
            {
                var row = new Dictionary<string, string>();
                foreach (var header in response.Headers)
                {
                    row[header] = csv.GetField(header);
                }
                response.PreviewRows.Add(row);
                count++;
            }
            
            // Estimate Total (not precise without reading whole file, but we can do a quick line count if needed)
            // For now, let's just leave estimate or read all if file is small.
        }

        private void PreviewExcel(string path, ImportPreviewResponse response)
        {
            using var workbook = new XLWorkbook(path);
            var worksheet = workbook.Worksheet(1); // Assume sheet 1
            var firstRow = worksheet.FirstRowUsed();
            if (firstRow == null) return;

            // Headers
            var headers = new List<string>();
            foreach (var cell in firstRow.CellsUsed())
            {
                headers.Add(cell.GetString());
            }
            response.Headers = headers;

            // Preview rows
            var rows = worksheet.RowsUsed().Skip(1).Take(5);
            foreach (var row in rows)
            {
                var rowData = new Dictionary<string, string>();
                int cellIndex = 1;
                foreach (var header in headers)
                {
                    rowData[header] = row.Cell(cellIndex).GetString();
                    cellIndex++;
                }
                response.PreviewRows.Add(rowData);
            }
        }

        private async Task ImportContactsAsync(string path, string extension, ImportMappingRequest request, ImportResult result)
        {
            var contactsToAdd = new List<Contact>();

            if (extension == ".csv")
            {
                using var reader = new StreamReader(path);
                using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);
                // We'll read manually to handle mapping
                csv.Read();
                csv.ReadHeader();
                
                while (csv.Read())
                {
                    try
                    {
                        var contact = new Contact { CreatedAt = DateTime.UtcNow, LastModifiedAt = DateTime.UtcNow };
                        MapRowToContact(contact, header => csv.GetField(header), request.FieldMapping);
                        contactsToAdd.Add(contact);
                    }
                    catch (Exception ex)
                    {
                        result.ErrorCount++;
                        result.Errors.Add($"Row error: {ex.Message}");
                    }
                }
            }
            else if (extension == ".xlsx")
            {
                using var workbook = new XLWorkbook(path);
                var worksheet = workbook.Worksheet(1);
                var headers = worksheet.FirstRowUsed().CellsUsed().Select(c => c.GetString()).ToList();

                foreach (var row in worksheet.RowsUsed().Skip(1))
                {
                    try
                    {
                        var contact = new Contact { CreatedAt = DateTime.UtcNow, LastModifiedAt = DateTime.UtcNow };
                        // Create a map helper
                        MapRowToContact(contact, header => {
                            // Find index of header
                            var index = headers.IndexOf(header);
                            if (index == -1) return null;
                            return row.Cell(index + 1).GetString();
                        }, request.FieldMapping);
                        contactsToAdd.Add(contact);
                    }
                    catch (Exception ex) 
                    {
                         result.ErrorCount++;
                         result.Errors.Add($"Row error: {ex.Message}");
                    }
                }
            }

            // Batch Process and Save
            // Look up companies if needed
            var companyNames = contactsToAdd.Where(c => c.Company != null && !string.IsNullOrEmpty(c.Company.Name))
                                            .Select(c => c.Company.Name).Distinct().ToList();
            
            var existingCompanies = await _context.Companies
                                                  .Where(c => companyNames.Contains(c.Name))
                                                  .ToListAsync();

            foreach (var contact in contactsToAdd)
            {
                if (contact.Company != null)
                {
                    var existing = existingCompanies.FirstOrDefault(c => c.Name.Equals(contact.Company.Name, StringComparison.InvariantCultureIgnoreCase));
                    if (existing != null)
                    {
                        contact.Company = null;
                        contact.CompanyId = existing.Id;
                    }
                    else
                    {
                        // It will create new company because Contact.Company object is set
                        // We might want to fix duplication if multiple contacts have same new company in this batch
                        var newCompInBatch = existingCompanies.FirstOrDefault(c => c.Name == contact.Company.Name);
                         if (newCompInBatch == null) {
                             // It's truly new
                             contact.Company.CreatedAt = DateTime.UtcNow;
                             contact.Company.LastModifiedAt = DateTime.UtcNow;
                             // Add to local cache to prevent duplicates in batch
                             existingCompanies.Add(contact.Company);
                         } else {
                             contact.Company = null;
                             contact.CompanyId = newCompInBatch.Id;
                         }
                    }
                }
                
                // Duplicate Email Check? 
                if (!string.IsNullOrEmpty(contact.Email))
                {
                     // For performance, checking one by one is slow. But for safety...
                     // Ideally we pre-fetch emails or rely on DB constraint exceptions
                }

                _context.Contacts.Add(contact);
                result.SuccessCount++;
            }

            await _context.SaveChangesAsync();
            result.TotalProcessed = result.SuccessCount + result.ErrorCount;
        }

        private void MapRowToContact(Contact contact, Func<string, string> getValue, Dictionary<string, string> mapping)
        {
            foreach (var map in mapping)
            {
                var header = map.Key;
                var propName = map.Value;
                var value = getValue(header);

                if (string.IsNullOrWhiteSpace(value)) continue;

                if (propName == "Company")
                {
                    contact.Company = new Company { Name = value };
                }
                else
                {
                    // Reflection
                    var prop = typeof(Contact).GetProperty(propName);
                    if (prop != null && prop.CanWrite)
                    {
                        if (prop.PropertyType == typeof(string))
                        {
                           prop.SetValue(contact, value);
                        }
                        // Add more type conversions if needed (e.g. Phone, Date)
                    }
                }
            }
        }
    }
}
