using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Api.Migrations
{
    /// <inheritdoc />
    public partial class EnsureModuleItemVideoColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Sütunlar migration geçmişinde var ama tabloda yoksa ekle (eksik uygulanan migration için)
            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ModuleItems') AND name = 'MustWatch')
BEGIN
    ALTER TABLE ModuleItems ADD MustWatch bit NOT NULL DEFAULT 0;
END
");
            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ModuleItems') AND name = 'VideoDurationSeconds')
BEGIN
    ALTER TABLE ModuleItems ADD VideoDurationSeconds int NULL;
END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ModuleItems') AND name = 'MustWatch')
    ALTER TABLE ModuleItems DROP COLUMN MustWatch;
");
            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ModuleItems') AND name = 'VideoDurationSeconds')
    ALTER TABLE ModuleItems DROP COLUMN VideoDurationSeconds;
");
        }
    }
}
