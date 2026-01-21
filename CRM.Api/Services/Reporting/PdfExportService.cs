using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using CRM.Api.Models.Reporting;

namespace CRM.Api.Services.Reporting
{
    public interface IPdfExportService
    {
        byte[] ExportReportToPdf(SavedReport report, object data);
    }

    public class PdfExportService : IPdfExportService
    {
        public byte[] ExportReportToPdf(SavedReport report, object data)
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(11));

                    // Header
                    page.Header().Element(container => ComposeHeader(container, report));

                    // Content
                    page.Content().Element(container => ComposeContent(container, report, data));

                    // Footer
                    page.Footer().Element(ComposeFooter);
                });
            });

            return document.GeneratePdf();
        }

        private void ComposeHeader(IContainer container, SavedReport report)
        {
            container.Row(row =>
            {
                row.RelativeItem().Column(column =>
                {
                    column.Item().Text("Nexus CRM").FontSize(20).SemiBold().FontColor(Colors.Blue.Medium);
                    column.Item().Text(report.Name).FontSize(16).SemiBold();
                    column.Item().Text($"Generated: {DateTime.Now:yyyy-MM-dd HH:mm}").FontSize(9).FontColor(Colors.Grey.Medium);
                });

                row.ConstantItem(100).Height(50).Placeholder();
            });
        }

        private void ComposeContent(IContainer container, SavedReport report, object data)
        {
            container.PaddingVertical(10).Column(column =>
            {
                column.Spacing(10);

                // Report Description
                if (!string.IsNullOrEmpty(report.Description))
                {
                    column.Item().Text(report.Description).FontSize(10).FontColor(Colors.Grey.Darken2);
                }

                // Report Data
                column.Item().Element(c => ComposeReportData(c, data));
            });
        }

        private void ComposeReportData(IContainer container, object data)
        {
            if (data is System.Collections.IEnumerable enumerable && data is not string)
            {
                var items = enumerable.Cast<object>().ToList();
                
                if (items.Any())
                {
                    // Get properties from first item
                    var properties = items.First().GetType().GetProperties();

                    container.Table(table =>
                    {
                        // Define columns
                        table.ColumnsDefinition(columns =>
                        {
                            foreach (var prop in properties)
                            {
                                columns.RelativeColumn();
                            }
                        });

                        // Header
                        table.Header(header =>
                        {
                            foreach (var prop in properties)
                            {
                                header.Cell().Element(CellStyle).Text(prop.Name).SemiBold();
                            }

                            static IContainer CellStyle(IContainer container)
                            {
                                return container.DefaultTextStyle(x => x.SemiBold())
                                    .PaddingVertical(5)
                                    .BorderBottom(1)
                                    .BorderColor(Colors.Grey.Lighten2);
                            }
                        });

                        // Data rows
                        foreach (var item in items)
                        {
                            foreach (var prop in properties)
                            {
                                var value = prop.GetValue(item)?.ToString() ?? "";
                                table.Cell().Element(CellStyle).Text(value);
                            }

                            static IContainer CellStyle(IContainer container)
                            {
                                return container.BorderBottom(1)
                                    .BorderColor(Colors.Grey.Lighten3)
                                    .PaddingVertical(5);
                            }
                        }
                    });
                }
            }
            else
            {
                container.Text("No data available").FontColor(Colors.Grey.Medium);
            }
        }

        private void ComposeFooter(IContainer container)
        {
            container.AlignCenter().Text(x =>
            {
                x.Span("Page ");
                x.CurrentPageNumber();
                x.Span(" of ");
                x.TotalPages();
                x.DefaultTextStyle(TextStyle.Default.FontSize(9).FontColor(Colors.Grey.Medium));
            });
        }
    }
}
