using System.Text.Json;
using Microsoft.AspNetCore.Hosting;

namespace backend.Api.Services;

/// <summary>
/// Varsayılan site çevirilerini DefaultMessages/{code}.json dosyasından yükler.
/// </summary>
public static class SiteTranslationDefaultsLoader
{
    public static Dictionary<string, string>? LoadFlattened(string code, IWebHostEnvironment env)
    {
        var basePath = env.ContentRootPath;
        var paths = new[]
        {
            Path.Combine(basePath, "DefaultMessages", $"{code}.json"),
            Path.Combine(AppContext.BaseDirectory, "DefaultMessages", $"{code}.json")
        };
        foreach (var path in paths)
        {
            if (!System.IO.File.Exists(path)) continue;
            try
            {
                var json = System.IO.File.ReadAllText(path);
                using var doc = JsonDocument.Parse(json);
                return SiteTranslationHelper.FlattenJson(doc.RootElement);
            }
            catch
            {
                // ignore and try next path
            }
        }
        return null;
    }
}
