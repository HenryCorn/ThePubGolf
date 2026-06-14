using System.Text.RegularExpressions;

#addin nuget:?package=Cake.FileHelpers&version=5.0.0

public static class VersionFileParser
{
    public static string Parse(ICakeContext context, FilePath file, string versionPattern)
    {
        var lines = context.FileReadLines(file.FullPath);
        foreach (var line in lines)
        {
            var match = Regex.Match(line, versionPattern);
            if (match.Success)
            {
                return match.Groups[1].Value;
            }
        }
        return null;
    }
}