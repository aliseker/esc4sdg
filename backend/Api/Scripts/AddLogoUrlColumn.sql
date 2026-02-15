-- LogoUrl sütununu Partners tablosuna ekler
-- Migration uygulanmamışsa bu script'i SQL Server'da çalıştırın
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('Partners') AND name = 'LogoUrl'
)
BEGIN
    ALTER TABLE Partners ADD LogoUrl nvarchar(500) NULL;
END
GO
