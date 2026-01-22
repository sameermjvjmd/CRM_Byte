using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRM.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class EnhanceDocumentManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AccessCount",
                table: "Documents",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Documents",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Documents",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiresAt",
                table: "Documents",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPublic",
                table: "Documents",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastAccessedAt",
                table: "Documents",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ParentDocumentId",
                table: "Documents",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Tags",
                table: "Documents",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UploadedByUserId",
                table: "Documents",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "Documents",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Documents_ParentDocumentId",
                table: "Documents",
                column: "ParentDocumentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_Documents_ParentDocumentId",
                table: "Documents",
                column: "ParentDocumentId",
                principalTable: "Documents",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Documents_Documents_ParentDocumentId",
                table: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_Documents_ParentDocumentId",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "AccessCount",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "ExpiresAt",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "IsPublic",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "LastAccessedAt",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "ParentDocumentId",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "Tags",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "UploadedByUserId",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "Documents");
        }
    }
}
