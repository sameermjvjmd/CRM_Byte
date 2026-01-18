using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRM.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddLandingPages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WebForms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FormFieldsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SubmitButtonText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SuccessMessage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RedirectUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MarketingListId = table.Column<int>(type: "int", nullable: true),
                    CreateContact = table.Column<bool>(type: "bit", nullable: false),
                    CreateActivity = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WebForms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WebForms_MarketingLists_MarketingListId",
                        column: x => x.MarketingListId,
                        principalTable: "MarketingLists",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "LandingPages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HtmlContent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    JsonContent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Theme = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SeoTitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SeoDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    VisitCount = table.Column<int>(type: "int", nullable: false),
                    SubmissionCount = table.Column<int>(type: "int", nullable: false),
                    WebFormId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LandingPages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LandingPages_WebForms_WebFormId",
                        column: x => x.WebFormId,
                        principalTable: "WebForms",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "LandingPageSubmissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LandingPageId = table.Column<int>(type: "int", nullable: false),
                    ContactId = table.Column<int>(type: "int", nullable: true),
                    SubmittedDataJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IPAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LandingPageSubmissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LandingPageSubmissions_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalTable: "Contacts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_LandingPageSubmissions_LandingPages_LandingPageId",
                        column: x => x.LandingPageId,
                        principalTable: "LandingPages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LandingPages_WebFormId",
                table: "LandingPages",
                column: "WebFormId");

            migrationBuilder.CreateIndex(
                name: "IX_LandingPageSubmissions_ContactId",
                table: "LandingPageSubmissions",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_LandingPageSubmissions_LandingPageId",
                table: "LandingPageSubmissions",
                column: "LandingPageId");

            migrationBuilder.CreateIndex(
                name: "IX_WebForms_MarketingListId",
                table: "WebForms",
                column: "MarketingListId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LandingPageSubmissions");

            migrationBuilder.DropTable(
                name: "LandingPages");

            migrationBuilder.DropTable(
                name: "WebForms");
        }
    }
}
