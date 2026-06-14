#addin nuget:?package=Cake.Json&version=7.0.1
#addin nuget:?package=Newtonsoft.Json&version=13.0.1
#load "./versionFile.cake"

public record BuildVersion(string Short, string File, string Informational, string Package)
{
    public static BuildVersion Calculate(ICakeContext context, BuildParameters parameters)
    {
        var baseVersion = ReadVersionInfo(context, parameters);
        var suffix = CalculateSuffix(context, parameters);
        var meta = CalculateMeta(context, parameters);

        var buildVersion = new BuildVersion(
            baseVersion,
            $"{baseVersion}.{parameters.BuildProvider.BuildNumber}",
            $"{baseVersion}{suffix}+{meta}",
            $"{baseVersion}{suffix}");
        parameters.BuildProvider.SetOutputVariable("shortVersion", buildVersion.Short);
        parameters.BuildProvider.SetOutputVariable("fileVersion", buildVersion.File);
        parameters.BuildProvider.SetOutputVariable("informationalVersion", buildVersion.Informational);
        parameters.BuildProvider.SetOutputVariable("packageVersion", buildVersion.Package);
        return buildVersion;
    }

    private static IEnumerable<VersionStrategyBase> GetVersionStrategies()
    {
        yield return new VersionPropertyStrategy();
        yield return new ThreePartPropertyStrategy();
        yield return new ReleaseNotesStrategy();
        yield return new OpenApiFileStrategy();
        yield return new PyProjectFileStrategy();
        yield return new VersionPyFileStrategy();
        yield return new PackageJsonStrategy();
        yield return new NoVersionFileStrategy();
    }

    private static string ReadVersionInfo(ICakeContext context, BuildParameters parameters)
    {
        var versionFile = parameters.Settings.VersionFile;
        foreach (var strategy in GetVersionStrategies())
        {
            var strategyName = strategy.GetType().Name;
            try
            {
                var version = strategy.Extract(context, parameters, versionFile);
                if (!string.IsNullOrWhiteSpace(version))
                {
                    context.Information($"Determined version to be: {version} using {strategyName}");
                    return version;
                }
            }
            catch (Exception exception)
            {
                context.Warning($"The {strategyName} failed with the following error: {exception}");
            }
        }

        throw new InvalidOperationException($"Unable to extract version from: '{versionFile}'");
    }

    private static string CalculateSuffix(ICakeContext context, BuildParameters parameters)
    {
        if (parameters.IsLocalBuild)
        {
            return $"{parameters.Settings.VersionPrefix}local.{DateTime.UtcNow:yyyyMMddHHmmss}";
        }

        if (!parameters.BuildProvider.Repository.IsReleaseableBranch)
        {
            return $"{parameters.Settings.VersionPrefix}preview.{parameters.BuildProvider.BuildNumber}";
        }

        return string.Empty;
    }

    private static string CalculateMeta(ICakeContext context, BuildParameters parameters)
    {
        return $"sha.{parameters.BuildProvider.Repository.Sha}";
    }
}

public abstract class VersionStrategyBase
{
    public string Extract(ICakeContext context, BuildParameters parameters, FilePath file)
    {
        try
        {
            return ExtractCore(context, parameters, file);
        }
        catch
        {
        }
        return null;
    }

    protected abstract string ExtractCore(ICakeContext context, BuildParameters parameters, FilePath file);
}

public class VersionPropertyStrategy : VersionStrategyBase
{
    protected override string ExtractCore(ICakeContext context, BuildParameters parameters, FilePath file)
    {
        return context.XmlPeek(file, "//Version");
    }
}

public class ThreePartPropertyStrategy : VersionStrategyBase
{
    protected override string ExtractCore(ICakeContext context, BuildParameters parameters, FilePath file)
    {
        var major = context.XmlPeek(file, "//AssemblyMajorVersion");
        var minor = context.XmlPeek(file, "//AssemblyMinorVersion");
        var patch = context.XmlPeek(file, "//AssemblyPatchVersion");

        if (!string.IsNullOrWhiteSpace(major) &&
            !string.IsNullOrWhiteSpace(minor) &&
            !string.IsNullOrWhiteSpace(patch))
        {
            return  $"{major}.{minor}.{patch}";
        }
        return null;
    }
}

public class ReleaseNotesStrategy : FilePatternVersionStrategyBase
{
    private const string VersionPattern = @"\#\# ([0-9]+\.[0-9]+\.[0-9]+)";

    public ReleaseNotesStrategy()
        : base(VersionPattern)
    {
    }
}

public class OpenApiFileStrategy : FilePatternVersionStrategyBase
{
    private const string VersionPattern = @"^\s+version: ([0-9]+\.[0-9]+\.[0-9]+)";

    public OpenApiFileStrategy()
        : base(VersionPattern)
    {
    }
}

public class PyProjectFileStrategy : FilePatternVersionStrategyBase
{
    private const string VersionPattern = @"^version = ""([0-9]+\.[0-9]+\.[0-9]+)""";

    public PyProjectFileStrategy()
        : base(VersionPattern)
    {
    }
}

public class VersionPyFileStrategy : FilePatternVersionStrategyBase
{
    private const string VersionPattern = @"^__version__ = ""([0-9]+\.[0-9]+\.[0-9]+)""";

    public VersionPyFileStrategy()
        : base(VersionPattern)
    {
    }
}

public class PackageJsonStrategy : JsonPathVersionStrategyBase
{
    private const string VersionPath = "$.version";

    public PackageJsonStrategy()
        : base(VersionPath)
    {
    }
}

public class NoVersionFileStrategy : VersionStrategyBase
{
    protected override string ExtractCore(ICakeContext context, BuildParameters parameters, FilePath file)
    {
        if (!context.FileExists(file))
        {
            context.Warning($"Expected version file '{file}' not found. Falling back to current timestamp.");
            return $"{DateTime.UtcNow:yyyyMMdd}.{parameters.BuildProvider.BuildNumber}";
        }
        return null;
    }
}

public class FilePatternVersionStrategyBase : VersionStrategyBase
{
    private readonly string _pattern;

    public FilePatternVersionStrategyBase(string pattern)
    {
        _pattern = pattern;
    }

    protected override string ExtractCore(ICakeContext context, BuildParameters parameters, FilePath file)
    {
        var version = VersionFileParser.Parse(context, file, _pattern);
        return version;
    }
}

public class JsonPathVersionStrategyBase : VersionStrategyBase
{
    private readonly string _path;

    public JsonPathVersionStrategyBase(string path)
    {
        _path = path;
    }

    protected override string ExtractCore(ICakeContext context, BuildParameters parameters, FilePath file)
    {
        var json = context.ParseJsonFromFile(file);
        var version = json.SelectToken(_path);
        return version.ToString();
    }
}