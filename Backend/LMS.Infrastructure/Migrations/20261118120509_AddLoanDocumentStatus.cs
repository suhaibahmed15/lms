
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Infrastructure.Migrations
{
    public partial class AddLoanDocumentStatus : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Step 1: Add StatusId as nullable
            migrationBuilder.AddColumn<int>(
                name: "StatusId",
                table: "LoanDocuments",
                type: "int",
                nullable: true);

            // Step 2: Populate existing documents with correct statuses
            migrationBuilder.Sql(@"
                IF NOT EXISTS (
                    SELECT 1
                    FROM Statuses
                    WHERE Category = 'LoanDocument'
                    AND [Key] = 'DOCUMENT_PENDING'
                )
                OR NOT EXISTS (
                    SELECT 1
                    FROM Statuses
                    WHERE Category = 'LoanDocument'
                    AND [Key] = 'DOCUMENT_VERIFIED'
                )
                BEGIN
                    THROW 51000,
                    'Required LoanDocument statuses are missing.',
                    1;
                END;

                UPDATE LD
                SET LD.StatusId = S.Id
                FROM LoanDocuments LD
                INNER JOIN Statuses S
                    ON S.Category = 'LoanDocument'
                    AND S.[Key] = CASE
                        WHEN LD.IsVerified = 1
                        THEN 'DOCUMENT_VERIFIED'
                        ELSE 'DOCUMENT_PENDING'
                    END;
            ");

            // Step 3: Make StatusId required
            migrationBuilder.AlterColumn<int>(
                name: "StatusId",
                table: "LoanDocuments",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            // Step 4: Create index
            migrationBuilder.CreateIndex(
                name: "IX_LoanDocuments_StatusId",
                table: "LoanDocuments",
                column: "StatusId");

            // Step 5: Add Foreign Key
            migrationBuilder.AddForeignKey(
                name: "FK_LoanDocuments_Statuses_StatusId",
                table: "LoanDocuments",
                column: "StatusId",
                principalTable: "Statuses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LoanDocuments_Statuses_StatusId",
                table: "LoanDocuments");

            migrationBuilder.DropIndex(
                name: "IX_LoanDocuments_StatusId",
                table: "LoanDocuments");

            migrationBuilder.DropColumn(
                name: "StatusId",
                table: "LoanDocuments");
        }
    }
}
