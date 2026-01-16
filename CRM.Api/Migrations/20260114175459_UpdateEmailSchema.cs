using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRM.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateEmailSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_EmailTrackings",
                table: "EmailTrackings");

            migrationBuilder.DropIndex(
                name: "IX_EmailTrackings_SentEmailId",
                table: "EmailTrackings");

            migrationBuilder.DropColumn(
                name: "BccEmails",
                table: "SentEmails");

            migrationBuilder.DropColumn(
                name: "CcEmails",
                table: "SentEmails");

            migrationBuilder.DropColumn(
                name: "FromEmail",
                table: "SentEmails");

            migrationBuilder.DropColumn(
                name: "ToEmail",
                table: "SentEmails");

            migrationBuilder.DropColumn(
                name: "WasSent",
                table: "SentEmails");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "EmailTrackings");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "EmailTrackings");

            migrationBuilder.DropColumn(
                name: "FirstClickedAt",
                table: "EmailTrackings");

            migrationBuilder.DropColumn(
                name: "LastClickedAt",
                table: "EmailTrackings");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "EmailSignatures");

            migrationBuilder.RenameColumn(
                name: "Attachments",
                table: "SentEmails",
                newName: "Cc");

            migrationBuilder.RenameColumn(
                name: "TimesUsed",
                table: "EmailTemplates",
                newName: "CreatedBy");

            migrationBuilder.AlterColumn<string>(
                name: "Subject",
                table: "SentEmails",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AddColumn<string>(
                name: "Bcc",
                table: "SentEmails",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SentByUserId",
                table: "SentEmails",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "SentEmails",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "To",
                table: "SentEmails",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "EmailTemplates",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<string>(
                name: "Subject",
                table: "EmailTemplates",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "Category",
                table: "EmailTemplates",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "EmailSignatures",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_EmailTrackings",
                table: "EmailTrackings",
                column: "SentEmailId");

            // migrationBuilder.AddForeignKey(
            //     name: "FK_SentEmails_EmailTemplates_TemplateId",
            //     table: "SentEmails",
            //     column: "TemplateId",
            //     principalTable: "EmailTemplates",
            //     principalColumn: "Id",
            //     onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SentEmails_EmailTemplates_TemplateId",
                table: "SentEmails");

            migrationBuilder.DropPrimaryKey(
                name: "PK_EmailTrackings",
                table: "EmailTrackings");

            migrationBuilder.DropColumn(
                name: "Bcc",
                table: "SentEmails");

            migrationBuilder.DropColumn(
                name: "SentByUserId",
                table: "SentEmails");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "SentEmails");

            migrationBuilder.DropColumn(
                name: "To",
                table: "SentEmails");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "EmailSignatures");

            migrationBuilder.RenameColumn(
                name: "Cc",
                table: "SentEmails",
                newName: "Attachments");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "EmailTemplates",
                newName: "TimesUsed");

            migrationBuilder.AlterColumn<string>(
                name: "Subject",
                table: "SentEmails",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "BccEmails",
                table: "SentEmails",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CcEmails",
                table: "SentEmails",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FromEmail",
                table: "SentEmails",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ToEmail",
                table: "SentEmails",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "WasSent",
                table: "SentEmails",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "EmailTrackings",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "EmailTrackings",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "FirstClickedAt",
                table: "EmailTrackings",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastClickedAt",
                table: "EmailTrackings",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "EmailTemplates",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Subject",
                table: "EmailTemplates",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "Category",
                table: "EmailTemplates",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "EmailSignatures",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddPrimaryKey(
                name: "PK_EmailTrackings",
                table: "EmailTrackings",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_EmailTrackings_SentEmailId",
                table: "EmailTrackings",
                column: "SentEmailId",
                unique: true);
        }
    }
}
