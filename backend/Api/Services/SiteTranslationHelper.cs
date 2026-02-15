using System.Collections.Generic;
using System.Text.Json;

namespace backend.Api.Services;

/// <summary>
/// Flattens nested JSON to key-value (e.g. "home.title1") and unflattens back.
/// Array values are stored as JSON string.
/// </summary>
public static class SiteTranslationHelper
{
    public static Dictionary<string, string> FlattenJson(JsonElement element, string prefix = "")
    {
        var result = new Dictionary<string, string>();
        FlattenCore(element, prefix, result);
        return result;
    }

    private static void FlattenCore(JsonElement element, string prefix, Dictionary<string, string> result)
    {
        switch (element.ValueKind)
        {
            case JsonValueKind.Object:
                foreach (var prop in element.EnumerateObject())
                {
                    var key = string.IsNullOrEmpty(prefix) ? prop.Name : prefix + "." + prop.Name;
                    FlattenCore(prop.Value, key, result);
                }
                break;
            case JsonValueKind.Array:
                result[prefix] = element.GetRawText();
                break;
            case JsonValueKind.String:
                result[prefix] = element.GetString() ?? "";
                break;
            case JsonValueKind.Number:
            case JsonValueKind.True:
            case JsonValueKind.False:
            case JsonValueKind.Null:
                result[prefix] = element.GetRawText();
                break;
        }
    }

    public static JsonElement UnflattenToJsonElement(Dictionary<string, string> flat)
    {
        var dict = new Dictionary<string, object?>();
        foreach (var kv in flat)
        {
            var parts = kv.Key.Split('.');
            object? current = dict;
            for (int i = 0; i < parts.Length; i++)
            {
                var part = parts[i];
                var isLast = i == parts.Length - 1;
                if (isLast)
                {
                    string val = kv.Value;
                    if (val.StartsWith('['))
                    {
                        try
                        {
                            current = JsonSerializer.Deserialize<JsonElement>(val);
                        }
                        catch
                        {
                            ((Dictionary<string, object?>)current!)[part] = val;
                        }
                    }
                    else
                    {
                        ((Dictionary<string, object?>)current!)[part] = val;
                    }
                    break;
                }
                if (current is Dictionary<string, object?> d && !d.ContainsKey(part))
                    d[part] = new Dictionary<string, object?>();
                current = ((Dictionary<string, object?>)current!)[part];
            }
        }
        return JsonSerializer.SerializeToElement(dict);
    }

    /// <summary>
    /// Build nested structure suitable for next-intl (same as frontend messages JSON).
    /// </summary>
    public static object UnflattenToNestedObject(Dictionary<string, string> flat)
    {
        var root = new Dictionary<string, object>();
        foreach (var kv in flat)
        {
            var parts = kv.Key.Split('.');
            Dictionary<string, object> current = root;
            for (int i = 0; i < parts.Length; i++)
            {
                var part = parts[i];
                var isLast = i == parts.Length - 1;
                if (isLast)
                {
                    string val = kv.Value;
                    if (val.StartsWith('['))
                    {
                        try
                        {
                            var arr = JsonSerializer.Deserialize<List<string>>(val);
                            current[part] = arr ?? new List<string>();
                        }
                        catch
                        {
                            current[part] = val;
                        }
                    }
                    else
                    {
                        current[part] = val;
                    }
                    break;
                }
                if (!current.TryGetValue(part, out var next) || next is not Dictionary<string, object>)
                {
                    var child = new Dictionary<string, object>();
                    current[part] = child;
                    current = child;
                }
                else
                {
                    current = (Dictionary<string, object>)next;
                }
            }
        }
        return root;
    }
}
