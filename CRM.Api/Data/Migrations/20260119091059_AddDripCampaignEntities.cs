using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRM.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDripCampaignEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CurrentStepId",
                table: "CampaignRecipients",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NextStepScheduledAt",
                table: "CampaignRecipients",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CampaignSteps",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CampaignId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    DelayMinutes = table.Column<int>(type: "int", nullable: false),
                    TemplateId = table.Column<int>(type: "int", nullable: true),
                    Subject = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    HtmlContent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PlainTextContent = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CampaignSteps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CampaignSteps_MarketingCampaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalTable: "MarketingCampaigns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CampaignRecipients_CurrentStepId",
                table: "CampaignRecipients",
                column: "CurrentStepId");

            migrationBuilder.CreateIndex(
                name: "IX_CampaignSteps_CampaignId",
                table: "CampaignSteps",
                column: "CampaignId");

            migrationBuilder.AddForeignKey(
                name: "FK_CampaignRecipients_CampaignSteps_CurrentStepId",
                table: "CampaignRecipients",
                column: "CurrentStepId",
                principalTable: "CampaignSteps",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CampaignRecipients_CampaignSteps_CurrentStepId",
                table: "CampaignRecipients");

            migrationBuilder.DropTable(
                name: "CampaignSteps");

            migrationBuilder.DropIndex(
                name: "IX_CampaignRecipients_CurrentStepId",
                table: "CampaignRecipients");

            migrationBuilder.DropColumn(
                name: "CurrentStepId",
                table: "CampaignRecipients");

            migrationBuilder.DropColumn(
                name: "NextStepScheduledAt",
                table: "CampaignRecipients");
        }
    }
}
