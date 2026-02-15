using System.Net.Http.Json;
using System.Text.Json;

namespace backend.Api.Services;

/// <summary>
/// Çeviri API'si (LibreTranslate veya benzeri). Yeni dil eklendiğinde site metinlerini otomatik çevirmek için kullanılır.
/// </summary>
public interface ITranslationApiService
{
    Task<string> TranslateAsync(string text, string sourceLanguageCode, string targetLanguageCode, CancellationToken cancellationToken = default);
    Task<List<string>> TranslateBatchAsync(List<string> texts, string sourceLanguageCode, string targetLanguageCode, CancellationToken cancellationToken = default);
}

public class TranslationApiService : ITranslationApiService
{
    private readonly HttpClient _http;
    private readonly string? _apiKey;
    private const string DefaultBaseUrl = "https://libretranslate.com";

    public TranslationApiService(HttpClient http, IConfiguration configuration)
    {
        _http = http;
        _http.BaseAddress = new Uri(configuration["TranslationApi:BaseUrl"] ?? DefaultBaseUrl);
        _apiKey = configuration["TranslationApi:ApiKey"];
    }

    public async Task<string> TranslateAsync(string text, string sourceLanguageCode, string targetLanguageCode, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(text)) return text;
        
        // Google Translate (Unofficial/Free)
        // https://translate.googleapis.com/translate_a/single?client=gtx&sl=tr&tl=en&dt=t&q=Merhaba
        
        var url = $"https://translate.googleapis.com/translate_a/single?client=gtx&sl={sourceLanguageCode}&tl={targetLanguageCode}&dt=t&q={Uri.EscapeDataString(text)}";
        
        // Use a new HttpClient to avoid BaseUrl conflicts if needed, or use _http if BaseUrl is reset.
        // For safety, let's create a request explicitly or ensure BaseUrl doesn't mess it up.
        // Ideally _http is Singleton but we can use it with absolute URI.
        
        var response = await _http.GetAsync(url, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new HttpRequestException($"Google Translate failed: {response.StatusCode}");
        }

        var jsonStr = await response.Content.ReadAsStringAsync(cancellationToken);
        
        // Parse: [[["Hello","Merhaba",null,null,10]],null,"tr"]
        using var doc = JsonDocument.Parse(jsonStr);
        var root = doc.RootElement;
        
        if (root.ValueKind == JsonValueKind.Array && root.GetArrayLength() > 0)
        {
            var firstBlock = root[0];
            if (firstBlock.ValueKind == JsonValueKind.Array)
            {
                var sb = new System.Text.StringBuilder();
                foreach (var segment in firstBlock.EnumerateArray())
                {
                    if (segment.ValueKind == JsonValueKind.Array && segment.GetArrayLength() > 0)
                    {
                        sb.Append(segment[0].GetString());
                    }
                }
                return sb.ToString();
            }
        }
        
        return text;
    }

    public async Task<List<string>> TranslateBatchAsync(List<string> texts, string sourceLanguageCode, string targetLanguageCode, CancellationToken cancellationToken = default)
    {
        // Google GTX does not support batching natively in this way.
        // We must loop. To be faster, we can run in parallel with limits.
        
        var results = new List<string>();
        foreach (var text in texts)
        {
            try 
            {
                var translated = await TranslateAsync(text, sourceLanguageCode, targetLanguageCode, cancellationToken);
                results.Add(translated);
                // Be gentle with free API
                await Task.Delay(100, cancellationToken); 
            }
            catch
            {
                results.Add(text); // Fallback
            }
        }
        return results;
    }
}
