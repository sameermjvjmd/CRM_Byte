using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRM.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class EnhancedOpportunityModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Stage",
                table: "Opportunities",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "LostReason",
                table: "Opportunities",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Opportunities",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ActualCloseDate",
                table: "Opportunities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CompetitivePosition",
                table: "Opportunities",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Competitors",
                table: "Opportunities",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Currency",
                table: "Opportunities",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DealHealth",
                table: "Opportunities",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DealScore",
                table: "Opportunities",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ForecastCategory",
                table: "Opportunities",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NextActionDate",
                table: "Opportunities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NextActionOwner",
                table: "Opportunities",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Owner",
                table: "Opportunities",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OwnerId",
                table: "Opportunities",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PrimaryCompetitor",
                table: "Opportunities",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "RecurringValue",
                table: "Opportunities",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RiskFactors",
                table: "Opportunities",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TotalDaysToClose",
                table: "Opportunities",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Opportunities",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WinLossNotes",
                table: "Opportunities",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WinReason",
                table: "Opportunities",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "OpportunityProducts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OpportunityId = table.Column<int>(type: "int", nullable: false),
                    ProductName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ProductCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Discount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    DiscountType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpportunityProducts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OpportunityProducts_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Opportunities",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ActualCloseDate", "CompetitivePosition", "Competitors", "Currency", "DealHealth", "DealScore", "ForecastCategory", "NextAction", "NextActionDate", "NextActionOwner", "Owner", "OwnerId", "PrimaryCompetitor", "RecurringValue", "RiskFactors", "Source", "TotalDaysToClose", "Type", "WeightedValue", "WinLossNotes", "WinReason" },
                values: new object[] { null, null, null, "USD", "Healthy", 75, "Commit", "Send proposal document", new DateTime(2026, 1, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, null, null, null, null, "Referral", 0, "New Business", 37500m, null, null });

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityProducts_OpportunityId",
                table: "OpportunityProducts",
                column: "OpportunityId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OpportunityProducts");

            migrationBuilder.DropColumn(
                name: "ActualCloseDate",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "CompetitivePosition",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "Competitors",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "Currency",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "DealHealth",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "DealScore",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "ForecastCategory",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "NextActionDate",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "NextActionOwner",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "Owner",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "OwnerId",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "PrimaryCompetitor",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "RecurringValue",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "RiskFactors",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "TotalDaysToClose",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "WinLossNotes",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "WinReason",
                table: "Opportunities");

            migrationBuilder.AlterColumn<string>(
                name: "Stage",
                table: "Opportunities",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "LostReason",
                table: "Opportunities",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Opportunities",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Opportunities",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "NextAction", "Source", "WeightedValue" },
                values: new object[] { null, null, 0m });
        }
    }
}
