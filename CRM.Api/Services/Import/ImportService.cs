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
            else if (request.EntityType == "Company")
            {
               await ImportCompaniesAsync(filePath, extension, request, result);
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
            var parsedContacts = new List<Contact>();

            // 1. Parse File into Objects
            if (extension == ".csv")
            {
                using var reader = new StreamReader(path);
                using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);
                csv.Read();
                csv.ReadHeader();
                
                while (csv.Read())
                {
                    try
                    {
                        var contact = new Contact { CreatedAt = DateTime.UtcNow, LastModifiedAt = DateTime.UtcNow };
                        MapRowToContact(contact, header => csv.GetField(header), request.FieldMapping);
                        if (!string.IsNullOrEmpty(contact.FirstName) || !string.IsNullOrEmpty(contact.LastName) || !string.IsNullOrEmpty(contact.Email))
                        {
                            parsedContacts.Add(contact);
                        }
                    }
                    catch (Exception ex)
                    {
                        result.ErrorCount++;
                        result.Errors.Add($"Row parse error: {ex.Message}");
                    }
                }
            }
            else if (extension == ".xlsx")
            {
                using var workbook = new XLWorkbook(path);
                var worksheet = workbook.Worksheet(1);
                var headerRow = worksheet.FirstRowUsed();
                if (headerRow == null) return;

                var headers = headerRow.CellsUsed().Select(c => c.GetString()).ToList();

                foreach (var row in worksheet.RowsUsed().Skip(1))
                {
                    try
                    {
                        var contact = new Contact { CreatedAt = DateTime.UtcNow, LastModifiedAt = DateTime.UtcNow };
                        MapRowToContact(contact, header => {
                            var index = headers.IndexOf(header);
                            if (index == -1) return null;
                            return row.Cell(index + 1).GetString();
                        }, request.FieldMapping);

                        if (!string.IsNullOrEmpty(contact.FirstName) || !string.IsNullOrEmpty(contact.LastName) || !string.IsNullOrEmpty(contact.Email))
                        {
                            parsedContacts.Add(contact);
                        }
                    }
                    catch (Exception ex) 
                    {
                         result.ErrorCount++;
                         result.Errors.Add($"Row parse error: {ex.Message}");
                    }
                }
            }

            // 2. Pre-fetch existing data for verification
            var emails = parsedContacts.Where(c => !string.IsNullOrEmpty(c.Email)).Select(c => c.Email).Distinct().ToList();
            var existingContacts = new List<Contact>();
            if (emails.Any())
            {
                existingContacts = await _context.Contacts
                    .Where(c => emails.Contains(c.Email))
                    .ToListAsync();
            }

            // Company Handling (Simple cache)
            var companyNames = parsedContacts.Where(c => c.Company != null && !string.IsNullOrEmpty(c.Company.Name))
                                            .Select(c => c.Company.Name).Distinct().ToList();
            var existingCompanies = await _context.Companies
                                                  .Where(c => companyNames.Contains(c.Name))
                                                  .ToListAsync();

            // 3. Company Linkage (Pre-pass)
            var namesToResolve = parsedContacts.Where(c => c.Company != null).Select(c => c.Company.Name).Distinct().ToList();
            foreach (var name in namesToResolve)
            {
                if (!existingCompanies.Any(c => c.Name.Equals(name, StringComparison.OrdinalIgnoreCase)))
                {
                    var newComp = new Company { Name = name, CreatedAt = DateTime.UtcNow, LastModifiedAt = DateTime.UtcNow };
                    _context.Companies.Add(newComp);
                }
            }
            try 
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                var msg = "Company Save Error: " + ex.Message;
                if (ex.InnerException != null) msg += " Inner: " + ex.InnerException.Message;
                result.Errors.Add(msg);
                return; // Stop here if companies failed
            }

            // Re-fetch all relevant companies to get IDs
            var allComps = await _context.Companies.Where(c => namesToResolve.Contains(c.Name)).ToListAsync();
            var companyIdMap = allComps.ToDictionary(c => c.Name, c => c.Id, StringComparer.OrdinalIgnoreCase);

            // 4. Process Contacts
            foreach (var incoming in parsedContacts)
            {
                if (incoming.Company != null)
                {
                    if (companyIdMap.TryGetValue(incoming.Company.Name, out var companyId))
                    {
                        incoming.CompanyId = companyId;
                        incoming.Company = null;
                    }
                }

                // Duplicate Check
                Contact match = null;
                if (!string.IsNullOrEmpty(incoming.Email))
                {
                    match = existingContacts.FirstOrDefault(c => c.Email.Equals(incoming.Email, StringComparison.OrdinalIgnoreCase));
                }

                if (match != null)
                {
                    if (request.UpdateExisting)
                    {
                        UpdateContactProperties(match, incoming);
                        match.LastModifiedAt = DateTime.UtcNow;
                        result.SuccessCount++; 
                    }
                    else
                    {
                        result.Skipped.Add($"Skipped duplicate: {incoming.Email}");
                    }
                }
                else
                {
                    _context.Contacts.Add(incoming);
                    result.SuccessCount++;
                }

                try 
                {
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    result.SuccessCount--; // Revert count
                    var msg = $"Error saving {incoming.Email}: " + ex.Message;
                    if (ex.InnerException != null) msg += " Inner: " + ex.InnerException.Message;
                    result.Errors.Add(msg);
                    // Detach the failed entity to avoid block subsequent saves
                    _context.Entry(incoming).State = EntityState.Detached;
                }
            }
            result.TotalProcessed = parsedContacts.Count; 
        }

        private void UpdateContactProperties(Contact target, Contact source)
        {
            // Simple reflection copy for non-null/non-empty fields
            var props = typeof(Contact).GetProperties().Where(p => p.CanWrite && p.PropertyType == typeof(string));
            foreach (var prop in props)
            {
                var val = prop.GetValue(source) as string;
                if (!string.IsNullOrEmpty(val))
                {
                    prop.SetValue(target, val);
                }
            }
            // Handle CompanyId update
            if (source.CompanyId.HasValue && source.CompanyId != 0)
            {
                target.CompanyId = source.CompanyId;
            }
            if (source.Company != null)
            {
                // Complex case: switch company if source has new company object?
                // For now simpler to respect CompanyId if resolved.
                if (target.CompanyId == null && source.Company != null)
                {
                    target.Company = source.Company;
                }
            }
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

        private async Task ImportCompaniesAsync(string path, string extension, ImportMappingRequest request, ImportResult result)
        {
            var parsedCompanies = new List<Company>();

            // 1. Parse File
            if (extension == ".csv")
            {
                using var reader = new StreamReader(path);
                using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);
                csv.Read();
                csv.ReadHeader();
                
                while (csv.Read())
                {
                    try
                    {
                        var company = new Company { CreatedAt = DateTime.UtcNow, LastModifiedAt = DateTime.UtcNow };
                        MapRowToCompany(company, header => csv.GetField(header), request.FieldMapping);
                        if (!string.IsNullOrEmpty(company.Name))
                        {
                            parsedCompanies.Add(company);
                        }
                    }
                    catch (Exception ex)
                    {
                        result.ErrorCount++;
                        result.Errors.Add($"Row parse error: {ex.Message}");
                    }
                }
            }
            else if (extension == ".xlsx")
            {
                using var workbook = new XLWorkbook(path);
                var worksheet = workbook.Worksheet(1);
                var headerRow = worksheet.FirstRowUsed();
                if (headerRow == null) return;

                var headers = headerRow.CellsUsed().Select(c => c.GetString()).ToList();

                foreach (var row in worksheet.RowsUsed().Skip(1))
                {
                    try
                    {
                        var company = new Company { CreatedAt = DateTime.UtcNow, LastModifiedAt = DateTime.UtcNow };
                        MapRowToCompany(company, header => {
                            var index = headers.IndexOf(header);
                            if (index == -1) return null;
                            return row.Cell(index + 1).GetString();
                        }, request.FieldMapping);

                        if (!string.IsNullOrEmpty(company.Name))
                        {
                            parsedCompanies.Add(company);
                        }
                    }
                    catch (Exception ex) 
                    {
                         result.ErrorCount++;
                         result.Errors.Add($"Row parse error: {ex.Message}");
                    }
                }
            }

            // 2. Processing
            var names = parsedCompanies.Select(c => c.Name).Distinct().ToList();
            var existingCompanies = await _context.Companies
                .Where(c => names.Contains(c.Name))
                .ToListAsync();

            foreach (var incoming in parsedCompanies)
            {
                var match = existingCompanies.FirstOrDefault(c => c.Name.Equals(incoming.Name, StringComparison.OrdinalIgnoreCase));
                
                if (match != null)
                {
                    if (request.UpdateExisting)
                    {
                        UpdateCompanyProperties(match, incoming);
                        match.LastModifiedAt = DateTime.UtcNow;
                        result.SuccessCount++; 
                    }
                    else
                    {
                        result.Skipped.Add($"Skipped duplicate: {incoming.Name}");
                    }
                }
                else
                {
                    _context.Companies.Add(incoming);
                    result.SuccessCount++;
                }

                try 
                {
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    result.SuccessCount--; 
                    var msg = $"Error saving {incoming.Name}: " + ex.Message;
                    result.Errors.Add(msg);
                    _context.Entry(incoming).State = EntityState.Detached;
                }
            }
            result.TotalProcessed = parsedCompanies.Count; 
        }

        private void UpdateCompanyProperties(Company target, Company source)
        {
            var props = typeof(Company).GetProperties().Where(p => p.CanWrite && p.PropertyType == typeof(string));
            foreach (var prop in props)
            {
                var val = prop.GetValue(source) as string;
                if (!string.IsNullOrEmpty(val))
                {
                    prop.SetValue(target, val);
                }
            }
        }

        private void MapRowToCompany(Company company, Func<string, string> getValue, Dictionary<string, string> mapping)
        {
            foreach (var map in mapping)
            {
                var header = map.Key;
                var propName = map.Value;
                var value = getValue(header);

                if (string.IsNullOrWhiteSpace(value)) continue;

                var prop = typeof(Company).GetProperty(propName);
                if (prop != null && prop.CanWrite && prop.PropertyType == typeof(string))
                {
                    prop.SetValue(company, value);
                }
            }
        }
    }
}
