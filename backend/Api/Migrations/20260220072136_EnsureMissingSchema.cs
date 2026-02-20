using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Api.Migrations
{
    /// <inheritdoc />
    public partial class EnsureMissingSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Projects
            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Slug = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CoverImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProjectTranslations",
                columns: table => new
                {
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    LanguageId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Subtitle = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    BodyHtml = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectTranslations", x => new { x.ProjectId, x.LanguageId });
                    table.ForeignKey(
                        name: "FK_ProjectTranslations_Languages_LanguageId",
                        column: x => x.LanguageId,
                        principalTable: "Languages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectTranslations_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectGalleryImages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProjectId = table.Column<int>(type: "int", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    Caption = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectGalleryImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectGalleryImages_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(name: "IX_Projects_Slug", table: "Projects", column: "Slug", unique: true);
            migrationBuilder.CreateIndex(name: "IX_ProjectTranslations_LanguageId", table: "ProjectTranslations", column: "LanguageId");
            migrationBuilder.CreateIndex(name: "IX_ProjectGalleryImages_ProjectId", table: "ProjectGalleryImages", column: "ProjectId");

            // SiteTranslations
            migrationBuilder.CreateTable(
                name: "SiteTranslations",
                columns: table => new
                {
                    LanguageId = table.Column<int>(type: "int", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SiteTranslations", x => new { x.LanguageId, x.Key });
                    table.ForeignKey(
                        name: "FK_SiteTranslations_Languages_LanguageId",
                        column: x => x.LanguageId,
                        principalTable: "Languages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
            migrationBuilder.CreateIndex(name: "IX_SiteTranslations_LanguageId", table: "SiteTranslations", column: "LanguageId");

            // Partners columns
            migrationBuilder.AddColumn<string>(name: "LogoUrl", table: "Partners", type: "nvarchar(500)", maxLength: 500, nullable: true);
            migrationBuilder.AddColumn<string>(name: "LogoPosition", table: "Partners", type: "nvarchar(20)", maxLength: 20, nullable: true);

            // CourseTranslations columns
            migrationBuilder.AddColumn<string>(name: "Category", table: "CourseTranslations", type: "nvarchar(100)", maxLength: 100, nullable: true);
            migrationBuilder.AddColumn<string>(name: "Level", table: "CourseTranslations", type: "nvarchar(50)", maxLength: 50, nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "Level", table: "CourseTranslations");
            migrationBuilder.DropColumn(name: "Category", table: "CourseTranslations");
            migrationBuilder.DropColumn(name: "LogoPosition", table: "Partners");
            migrationBuilder.DropColumn(name: "LogoUrl", table: "Partners");
            migrationBuilder.DropTable(name: "SiteTranslations");
            migrationBuilder.DropTable(name: "ProjectGalleryImages");
            migrationBuilder.DropTable(name: "ProjectTranslations");
            migrationBuilder.DropTable(name: "Projects");
        }
    }
}
