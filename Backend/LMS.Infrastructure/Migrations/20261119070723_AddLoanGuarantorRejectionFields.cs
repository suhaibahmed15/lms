using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLoanGuarantorRejectionFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "RejectedAt",
                table: "LoanGuarantors",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RejectedByUserId",
                table: "LoanGuarantors",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RejectionRemarks",
                table: "LoanGuarantors",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_LoanGuarantors_RejectedByUserId",
                table: "LoanGuarantors",
                column: "RejectedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_LoanGuarantors_Users_RejectedByUserId",
                table: "LoanGuarantors",
                column: "RejectedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LoanGuarantors_Users_RejectedByUserId",
                table: "LoanGuarantors");

            migrationBuilder.DropIndex(
                name: "IX_LoanGuarantors_RejectedByUserId",
                table: "LoanGuarantors");

            migrationBuilder.DropColumn(
                name: "RejectedAt",
                table: "LoanGuarantors");

            migrationBuilder.DropColumn(
                name: "RejectedByUserId",
                table: "LoanGuarantors");

            migrationBuilder.DropColumn(
                name: "RejectionRemarks",
                table: "LoanGuarantors");
        }
    }
}
