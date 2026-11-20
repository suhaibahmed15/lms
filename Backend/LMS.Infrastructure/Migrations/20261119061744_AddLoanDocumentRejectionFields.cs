using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLoanDocumentRejectionFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LoanDocuments_Statuses_StatusId",
                table: "LoanDocuments");

            migrationBuilder.AddColumn<DateTime>(
                name: "RejectedAt",
                table: "LoanDocuments",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RejectedByUserId",
                table: "LoanDocuments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RejectionRemarks",
                table: "LoanDocuments",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_LoanDocuments_RejectedByUserId",
                table: "LoanDocuments",
                column: "RejectedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_LoanDocuments_Statuses_StatusId",
                table: "LoanDocuments",
                column: "StatusId",
                principalTable: "Statuses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LoanDocuments_Users_RejectedByUserId",
                table: "LoanDocuments",
                column: "RejectedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LoanDocuments_Statuses_StatusId",
                table: "LoanDocuments");

            migrationBuilder.DropForeignKey(
                name: "FK_LoanDocuments_Users_RejectedByUserId",
                table: "LoanDocuments");

            migrationBuilder.DropIndex(
                name: "IX_LoanDocuments_RejectedByUserId",
                table: "LoanDocuments");

            migrationBuilder.DropColumn(
                name: "RejectedAt",
                table: "LoanDocuments");

            migrationBuilder.DropColumn(
                name: "RejectedByUserId",
                table: "LoanDocuments");

            migrationBuilder.DropColumn(
                name: "RejectionRemarks",
                table: "LoanDocuments");

            migrationBuilder.AddForeignKey(
                name: "FK_LoanDocuments_Statuses_StatusId",
                table: "LoanDocuments",
                column: "StatusId",
                principalTable: "Statuses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
