using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRM.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class SalesForecastFinal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "QuoteTemplateId",
                table: "Quotes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "LeadScoringRules",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ClickCount",
                table: "CampaignSteps",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "DeliveredCount",
                table: "CampaignSteps",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "OpenCount",
                table: "CampaignSteps",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SentCount",
                table: "CampaignSteps",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "CampaignStepExecutionLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CampaignId = table.Column<int>(type: "int", nullable: false),
                    StepId = table.Column<int>(type: "int", nullable: false),
                    RecipientId = table.Column<int>(type: "int", nullable: false),
                    ContactId = table.Column<int>(type: "int", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExecutedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ErrorMessage = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CampaignStepExecutionLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuoteTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CompanyAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CompanyLogoUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PrimaryColor = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    SecondaryColor = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TextColor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ShowSku = table.Column<bool>(type: "bit", nullable: false),
                    ShowQuantity = table.Column<bool>(type: "bit", nullable: false),
                    ShowDiscountColumn = table.Column<bool>(type: "bit", nullable: false),
                    ShowTaxSummary = table.Column<bool>(type: "bit", nullable: false),
                    ShowShipping = table.Column<bool>(type: "bit", nullable: false),
                    ShowNotes = table.Column<bool>(type: "bit", nullable: false),
                    DefaultTerms = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DefaultFooter = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuoteTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SalesQuotas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PeriodType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FiscalYear = table.Column<int>(type: "int", nullable: false),
                    PeriodNumber = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalesQuotas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SalesQuotas_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Quotes_QuoteTemplateId",
                table: "Quotes",
                column: "QuoteTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesQuotas_UserId",
                table: "SalesQuotas",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Quotes_QuoteTemplates_QuoteTemplateId",
                table: "Quotes",
                column: "QuoteTemplateId",
                principalTable: "QuoteTemplates",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Quotes_QuoteTemplates_QuoteTemplateId",
                table: "Quotes");

            migrationBuilder.DropTable(
                name: "CampaignStepExecutionLogs");

            migrationBuilder.DropTable(
                name: "QuoteTemplates");

            migrationBuilder.DropTable(
                name: "SalesQuotas");

            migrationBuilder.DropIndex(
                name: "IX_Quotes_QuoteTemplateId",
                table: "Quotes");

            migrationBuilder.DropColumn(
                name: "QuoteTemplateId",
                table: "Quotes");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "LeadScoringRules");

            migrationBuilder.DropColumn(
                name: "ClickCount",
                table: "CampaignSteps");

            migrationBuilder.DropColumn(
                name: "DeliveredCount",
                table: "CampaignSteps");

            migrationBuilder.DropColumn(
                name: "OpenCount",
                table: "CampaignSteps");

            migrationBuilder.DropColumn(
                name: "SentCount",
                table: "CampaignSteps");
        }
    }
}
