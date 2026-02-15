-- Eksik migration'ları veritabanına uygula (tekrar çalıştırılabilir).
-- Veritabanı: Escape4sdgDb (appsettings.Development.json'daki connection string ile aynı olmalı).
-- Çalıştırma: SSMS veya Azure Data Studio ile açıp F5, veya: sqlcmd -S "localhost\SQLEXPRESS" -d Escape4sdgDb -U Owner -P "Owner123*v1" -i ApplyMissingMigrations.sql

USE [Escape4sdgDb];
GO

-- 1) Partners: LogoUrl (yoksa ekle)
IF COL_LENGTH('Partners', 'LogoUrl') IS NULL
BEGIN
    ALTER TABLE [Partners] ADD [LogoUrl] nvarchar(500) NULL;
END
GO

-- 2) Partners: LogoPosition (yoksa ekle)
IF COL_LENGTH('Partners', 'LogoPosition') IS NULL
BEGIN
    ALTER TABLE [Partners] ADD [LogoPosition] nvarchar(20) NULL;
END
GO

-- 3) ModuleItems: MustWatch, VideoDurationSeconds (yoksa ekle)
IF COL_LENGTH('ModuleItems', 'MustWatch') IS NULL
BEGIN
    ALTER TABLE [ModuleItems] ADD [MustWatch] bit NOT NULL DEFAULT 0;
END
GO
IF COL_LENGTH('ModuleItems', 'VideoDurationSeconds') IS NULL
BEGIN
    ALTER TABLE [ModuleItems] ADD [VideoDurationSeconds] int NULL;
END
GO

-- 4) Projects tabloları (yoksa oluştur)
IF OBJECT_ID('Projects', 'U') IS NULL
BEGIN
    CREATE TABLE [Projects] (
        [Id] int NOT NULL IDENTITY(1,1),
        [Slug] nvarchar(200) NOT NULL,
        [CoverImageUrl] nvarchar(500) NULL,
        [SortOrder] int NOT NULL DEFAULT 0,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        [UpdatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_Projects] PRIMARY KEY ([Id])
    );
    CREATE UNIQUE INDEX [IX_Projects_Slug] ON [Projects] ([Slug]);
END
GO

IF OBJECT_ID('ProjectTranslations', 'U') IS NULL
BEGIN
    CREATE TABLE [ProjectTranslations] (
        [ProjectId] int NOT NULL,
        [LanguageId] int NOT NULL,
        [Title] nvarchar(300) NOT NULL,
        [Subtitle] nvarchar(500) NULL,
        [BodyHtml] nvarchar(max) NULL,
        CONSTRAINT [PK_ProjectTranslations] PRIMARY KEY ([ProjectId], [LanguageId]),
        CONSTRAINT [FK_ProjectTranslations_Projects_ProjectId] FOREIGN KEY ([ProjectId]) REFERENCES [Projects] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_ProjectTranslations_Languages_LanguageId] FOREIGN KEY ([LanguageId]) REFERENCES [Languages] ([Id]) ON DELETE CASCADE
    );
    CREATE INDEX [IX_ProjectTranslations_LanguageId] ON [ProjectTranslations] ([LanguageId]);
END
GO

IF OBJECT_ID('ProjectGalleryImages', 'U') IS NULL
BEGIN
    CREATE TABLE [ProjectGalleryImages] (
        [Id] int NOT NULL IDENTITY(1,1),
        [ProjectId] int NOT NULL,
        [ImageUrl] nvarchar(500) NOT NULL,
        [SortOrder] int NOT NULL DEFAULT 0,
        [Caption] nvarchar(300) NULL,
        CONSTRAINT [PK_ProjectGalleryImages] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ProjectGalleryImages_Projects_ProjectId] FOREIGN KEY ([ProjectId]) REFERENCES [Projects] ([Id]) ON DELETE CASCADE
    );
    CREATE INDEX [IX_ProjectGalleryImages_ProjectId] ON [ProjectGalleryImages] ([ProjectId]);
END
GO

-- 5) Migration history'ye ekle (EF bir daha uygulamaya çalışmasın)
IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20260205120000_AddModuleItemMustWatch')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20260205120000_AddModuleItemMustWatch', N'8.0.0');
IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20260206120000_AddPartnerLogoUrl')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20260206120000_AddPartnerLogoUrl', N'8.0.0');
IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20260207120000_AddPartnerLogoPosition')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20260207120000_AddPartnerLogoPosition', N'8.0.0');
IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20260209120000_AddProjects')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20260209120000_AddProjects', N'8.0.0');
GO

-- 6) SiteTranslations (site çevirileri: hero, footer, nav vb.)
IF OBJECT_ID('SiteTranslations', 'U') IS NULL
BEGIN
    CREATE TABLE [SiteTranslations] (
        [LanguageId] int NOT NULL,
        [Key] nvarchar(120) NOT NULL,
        [Value] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_SiteTranslations] PRIMARY KEY ([LanguageId], [Key]),
        CONSTRAINT [FK_SiteTranslations_Languages_LanguageId] FOREIGN KEY ([LanguageId]) REFERENCES [Languages] ([Id]) ON DELETE CASCADE
    );
    CREATE INDEX [IX_SiteTranslations_LanguageId] ON [SiteTranslations] ([LanguageId]);
END
GO
IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20260209180000_AddSiteTranslations')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20260209180000_AddSiteTranslations', N'8.0.0');
GO

-- 7) CourseTranslations: Category, Level (dil bazlı)
IF COL_LENGTH('CourseTranslations', 'Category') IS NULL
BEGIN
    ALTER TABLE [CourseTranslations] ADD [Category] nvarchar(100) NULL;
END
GO
IF COL_LENGTH('CourseTranslations', 'Level') IS NULL
BEGIN
    ALTER TABLE [CourseTranslations] ADD [Level] nvarchar(50) NULL;
END
GO
IF NOT EXISTS (SELECT 1 FROM [__EFMigrationsHistory] WHERE [MigrationId] = N'20260209200000_AddCourseTranslationCategoryLevel')
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES (N'20260209200000_AddCourseTranslationCategoryLevel', N'8.0.0');
GO

PRINT 'Eksik migration uygulandı.';
GO
