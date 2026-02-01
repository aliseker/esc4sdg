using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminNormalizedColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NormalizedEmail",
                table: "Admins",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NormalizedUsername",
                table: "Admins",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: true);

            migrationBuilder.Sql(@"
                UPDATE Admins SET NormalizedUsername = UPPER(Username), NormalizedEmail = UPPER(Email)
                WHERE NormalizedUsername IS NULL OR NormalizedEmail IS NULL;
            ");

            migrationBuilder.AlterColumn<string>(
                name: "NormalizedUsername",
                table: "Admins",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "NormalizedEmail",
                table: "Admins",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.DropIndex(
                name: "IX_Admins_Email",
                table: "Admins");

            migrationBuilder.DropIndex(
                name: "IX_Admins_Username",
                table: "Admins");

            migrationBuilder.CreateIndex(
                name: "IX_Admins_NormalizedEmail",
                table: "Admins",
                column: "NormalizedEmail",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Admins_NormalizedUsername",
                table: "Admins",
                column: "NormalizedUsername",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Admins_NormalizedEmail",
                table: "Admins");

            migrationBuilder.DropIndex(
                name: "IX_Admins_NormalizedUsername",
                table: "Admins");

            migrationBuilder.DropColumn(
                name: "NormalizedEmail",
                table: "Admins");

            migrationBuilder.DropColumn(
                name: "NormalizedUsername",
                table: "Admins");

            migrationBuilder.CreateIndex(
                name: "IX_Admins_Email",
                table: "Admins",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Admins_Username",
                table: "Admins",
                column: "Username",
                unique: true);
        }
    }
}
