using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.Drawing;
using CRM.Api.Models.Reporting;

namespace CRM.Api.Services.Reporting
{
    public interface IExcelExportService
    {
        byte[] ExportReportToExcel(SavedReport report, object data);
    }

    public class ExcelExportService : IExcelExportService
    {
        static ExcelExportService()
        {
            // Set EPPlus license (NonCommercial is free)
            // Using EPPlus 7.x syntax
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        }

        public byte[] ExportReportToExcel(SavedReport report, object data)
        {
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add(report.Name);

            // Add header
            AddHeader(worksheet, report);

            // Add data
            AddData(worksheet, data);

            // Format worksheet
            FormatWorksheet(worksheet);

            return package.GetAsByteArray();
        }

        private void AddHeader(ExcelWorksheet worksheet, SavedReport report)
        {
            // Title
            worksheet.Cells["A1"].Value = "Nexus CRM";
            worksheet.Cells["A1"].Style.Font.Size = 16;
            worksheet.Cells["A1"].Style.Font.Bold = true;
            worksheet.Cells["A1"].Style.Font.Color.SetColor(Color.FromArgb(79, 70, 229)); // Blue

            // Report Name
            worksheet.Cells["A2"].Value = report.Name;
            worksheet.Cells["A2"].Style.Font.Size = 14;
            worksheet.Cells["A2"].Style.Font.Bold = true;

            // Generated Date
            worksheet.Cells["A3"].Value = $"Generated: {DateTime.Now:yyyy-MM-dd HH:mm}";
            worksheet.Cells["A3"].Style.Font.Size = 10;
            worksheet.Cells["A3"].Style.Font.Color.SetColor(Color.Gray);

            // Description
            if (!string.IsNullOrEmpty(report.Description))
            {
                worksheet.Cells["A4"].Value = report.Description;
                worksheet.Cells["A4"].Style.Font.Size = 10;
                worksheet.Cells["A4"].Style.Font.Color.SetColor(Color.DarkGray);
            }
        }

        private void AddData(ExcelWorksheet worksheet, object data)
        {
            int startRow = 6; // Start after header

            if (data is System.Collections.IEnumerable enumerable && data is not string)
            {
                var items = enumerable.Cast<object>().ToList();

                if (items.Any())
                {
                    // Get properties
                    var properties = items.First().GetType().GetProperties();

                    // Add column headers
                    for (int i = 0; i < properties.Length; i++)
                    {
                        var cell = worksheet.Cells[startRow, i + 1];
                        cell.Value = properties[i].Name;
                        cell.Style.Font.Bold = true;
                        cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
                        cell.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(79, 70, 229)); // Blue
                        cell.Style.Font.Color.SetColor(Color.White);
                        cell.Style.Border.BorderAround(ExcelBorderStyle.Thin);
                    }

                    // Add data rows
                    for (int row = 0; row < items.Count; row++)
                    {
                        var item = items[row];
                        for (int col = 0; col < properties.Length; col++)
                        {
                            var cell = worksheet.Cells[startRow + row + 1, col + 1];
                            var value = properties[col].GetValue(item);
                            
                            // Set value with proper type
                            if (value is DateTime dateTime)
                            {
                                cell.Value = dateTime;
                                cell.Style.Numberformat.Format = "yyyy-mm-dd hh:mm";
                            }
                            else if (value is decimal || value is double || value is float)
                            {
                                cell.Value = value;
                                cell.Style.Numberformat.Format = "#,##0.00";
                            }
                            else if (value is int || value is long)
                            {
                                cell.Value = value;
                                cell.Style.Numberformat.Format = "#,##0";
                            }
                            else
                            {
                                cell.Value = value?.ToString() ?? "";
                            }

                            // Alternating row colors
                            if (row % 2 == 0)
                            {
                                cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
                                cell.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(248, 250, 252)); // Light gray
                            }

                            cell.Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.LightGray);
                        }
                    }

                    // Add total row if numeric columns exist
                    AddTotalRow(worksheet, properties, items, startRow);
                }
            }
            else
            {
                worksheet.Cells["A6"].Value = "No data available";
                worksheet.Cells["A6"].Style.Font.Color.SetColor(Color.Gray);
            }
        }

        private void AddTotalRow(ExcelWorksheet worksheet, System.Reflection.PropertyInfo[] properties, List<object> items, int startRow)
        {
            int totalRow = startRow + items.Count + 1;
            bool hasNumericColumns = false;

            for (int col = 0; col < properties.Length; col++)
            {
                var prop = properties[col];
                var cell = worksheet.Cells[totalRow, col + 1];

                if (prop.PropertyType == typeof(decimal) || prop.PropertyType == typeof(double) || 
                    prop.PropertyType == typeof(int) || prop.PropertyType == typeof(long))
                {
                    // Add SUM formula
                    var range = worksheet.Cells[startRow + 1, col + 1, startRow + items.Count, col + 1];
                    cell.Formula = $"SUM({range.Address})";
                    cell.Style.Numberformat.Format = "#,##0.00";
                    cell.Style.Font.Bold = true;
                    hasNumericColumns = true;
                }
                else if (col == 0)
                {
                    cell.Value = "TOTAL";
                    cell.Style.Font.Bold = true;
                }

                cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
                cell.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(226, 232, 240)); // Light blue-gray
                cell.Style.Border.BorderAround(ExcelBorderStyle.Medium);
            }

            // Only keep total row if there are numeric columns
            if (!hasNumericColumns)
            {
                worksheet.DeleteRow(totalRow);
            }
        }

        private void FormatWorksheet(ExcelWorksheet worksheet)
        {
            // Auto-fit columns
            worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

            // Freeze header row
            worksheet.View.FreezePanes(7, 1);

            // Add filters
            if (worksheet.Dimension != null)
            {
                worksheet.Cells[6, 1, 6, worksheet.Dimension.End.Column].AutoFilter = true;
            }
        }
    }
}
