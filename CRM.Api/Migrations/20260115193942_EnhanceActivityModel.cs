using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRM.Api.Migrations
{
    /// <inheritdoc />
    public partial class EnhanceActivityModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Priority",
                table: "Activities",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Attendees",
                table: "Activities",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Activities",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Color",
                table: "Activities",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "Activities",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "Activities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "HasReminder",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsAllDay",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsPrivate",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsRecurring",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastModifiedAt",
                table: "Activities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Activities",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MeetingLink",
                table: "Activities",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OpportunityId",
                table: "Activities",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Outcome",
                table: "Activities",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OwnerId",
                table: "Activities",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RecurrenceCount",
                table: "Activities",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RecurrenceDays",
                table: "Activities",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RecurrenceEndDate",
                table: "Activities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RecurrenceInterval",
                table: "Activities",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "RecurrencePattern",
                table: "Activities",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ReminderMinutesBefore",
                table: "Activities",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "ReminderSent",
                table: "Activities",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Result",
                table: "Activities",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SeriesId",
                table: "Activities",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Activities",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Attendees", "Category", "Color", "CompanyId", "CompletedAt", "HasReminder", "IsAllDay", "IsPrivate", "IsRecurring", "LastModifiedAt", "Location", "MeetingLink", "OpportunityId", "Outcome", "OwnerId", "RecurrenceCount", "RecurrenceDays", "RecurrenceEndDate", "RecurrenceInterval", "RecurrencePattern", "ReminderMinutesBefore", "ReminderSent", "Result", "SeriesId" },
                values: new object[] { null, null, null, null, null, false, false, false, false, null, null, null, null, null, null, null, null, null, 1, null, 15, false, null, null });

            migrationBuilder.CreateIndex(
                name: "IX_Activities_CompanyId",
                table: "Activities",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Activities_OpportunityId",
                table: "Activities",
                column: "OpportunityId");

            migrationBuilder.CreateIndex(
                name: "IX_Activities_SeriesId",
                table: "Activities",
                column: "SeriesId");

            migrationBuilder.AddForeignKey(
                name: "FK_Activities_Activities_SeriesId",
                table: "Activities",
                column: "SeriesId",
                principalTable: "Activities",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Activities_Companies_CompanyId",
                table: "Activities",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Activities_Opportunities_OpportunityId",
                table: "Activities",
                column: "OpportunityId",
                principalTable: "Opportunities",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Activities_Activities_SeriesId",
                table: "Activities");

            migrationBuilder.DropForeignKey(
                name: "FK_Activities_Companies_CompanyId",
                table: "Activities");

            migrationBuilder.DropForeignKey(
                name: "FK_Activities_Opportunities_OpportunityId",
                table: "Activities");

            migrationBuilder.DropIndex(
                name: "IX_Activities_CompanyId",
                table: "Activities");

            migrationBuilder.DropIndex(
                name: "IX_Activities_OpportunityId",
                table: "Activities");

            migrationBuilder.DropIndex(
                name: "IX_Activities_SeriesId",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "Attendees",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "Color",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "HasReminder",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "IsAllDay",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "IsPrivate",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "IsRecurring",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "LastModifiedAt",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "MeetingLink",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "OpportunityId",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "Outcome",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "OwnerId",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "RecurrenceCount",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "RecurrenceDays",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "RecurrenceEndDate",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "RecurrenceInterval",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "RecurrencePattern",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "ReminderMinutesBefore",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "ReminderSent",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "Result",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "SeriesId",
                table: "Activities");

            migrationBuilder.AlterColumn<string>(
                name: "Priority",
                table: "Activities",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);
        }
    }
}
