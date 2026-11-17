using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAssignedToUserId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AssignedToUserId",
                table: "LoanApplications",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_LoanApplications_AssignedToUserId",
                table: "LoanApplications",
                column: "AssignedToUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_LoanApplications_Users_AssignedToUserId",
                table: "LoanApplications",
                column: "AssignedToUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LoanApplications_Users_AssignedToUserId",
                table: "LoanApplications");

            migrationBuilder.DropIndex(
                name: "IX_LoanApplications_AssignedToUserId",
                table: "LoanApplications");

            migrationBuilder.DropColumn(
                name: "AssignedToUserId",
                table: "LoanApplications");
        }
    }
}
