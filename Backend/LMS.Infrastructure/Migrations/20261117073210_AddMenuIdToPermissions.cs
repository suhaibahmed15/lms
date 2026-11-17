using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMenuIdToPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MenuId",
                table: "Permissions",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Permissions_MenuId",
                table: "Permissions",
                column: "MenuId");

            migrationBuilder.AddForeignKey(
                name: "FK_Permissions_Menus_MenuId",
                table: "Permissions",
                column: "MenuId",
                principalTable: "Menus",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Permissions_Menus_MenuId",
                table: "Permissions");

            migrationBuilder.DropIndex(
                name: "IX_Permissions_MenuId",
                table: "Permissions");

            migrationBuilder.DropColumn(
                name: "MenuId",
                table: "Permissions");
        }
    }
}
