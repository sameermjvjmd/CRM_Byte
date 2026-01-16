using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRM.Api.Migrations
{
    /// <inheritdoc />
    public partial class PipelineEnhancement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DaysInCurrentStage",
                table: "Opportunities",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastStageChangeDate",
                table: "Opportunities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LostDate",
                table: "Opportunities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LostReason",
                table: "Opportunities",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NextAction",
                table: "Opportunities",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Source",
                table: "Opportunities",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Tags",
                table: "Opportunities",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "WeightedValue",
                table: "Opportunities",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "WonDate",
                table: "Opportunities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "StageHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OpportunityId = table.Column<int>(type: "int", nullable: false),
                    FromStage = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ToStage = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ChangedByUserId = table.Column<int>(type: "int", nullable: true),
                    ChangedById = table.Column<int>(type: "int", nullable: true),
                    DaysInPreviousStage = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StageHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StageHistories_Opportunities_OpportunityId",
                        column: x => x.OpportunityId,
                        principalTable: "Opportunities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StageHistories_Users_ChangedById",
                        column: x => x.ChangedById,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.UpdateData(
                table: "Opportunities",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "DaysInCurrentStage", "LastStageChangeDate", "LostDate", "LostReason", "NextAction", "Source", "Tags", "WeightedValue", "WonDate" },
                values: new object[] { 0, null, null, null, null, null, null, 0m, null });

            migrationBuilder.CreateIndex(
                name: "IX_StageHistories_ChangedById",
                table: "StageHistories",
                column: "ChangedById");

            migrationBuilder.CreateIndex(
                name: "IX_StageHistories_OpportunityId",
                table: "StageHistories",
                column: "OpportunityId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StageHistories");

            migrationBuilder.DropColumn(
                name: "DaysInCurrentStage",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "LastStageChangeDate",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "LostDate",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "LostReason",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "NextAction",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "Source",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "Tags",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "WeightedValue",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "WonDate",
                table: "Opportunities");
        }
    }
}
