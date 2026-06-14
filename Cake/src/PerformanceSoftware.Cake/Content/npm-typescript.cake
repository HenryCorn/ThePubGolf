#addin nuget:?package=Cake.Npm&version=2.0.0

public record TypescriptSettings(
    DirectoryPath BuildDirectory,
    DirectoryPath OutputDirectory,
    string Version,
    bool IsPreview)
{
    public static TypescriptSettings Create(ICakeContext context, BuildParameters parameters)
    {
        var buildDirectory = parameters.Settings.TypescriptBuildDirectory;
        var outputDirectory = buildDirectory + context.Directory("dist");
        var version = parameters.Version.Package;
        var isPreview = !parameters.BuildProvider.Repository.IsReleaseableBranch;

        return new TypescriptSettings(buildDirectory, outputDirectory, version, isPreview);
    }
}

public static class NpmTypescriptBuilder
{
    public static void InstallAndBuild(ICakeContext context, TypescriptSettings settings)
    {
        Install(context, settings);
  
        Build(context, settings);
    }

    public static void BumpAndPack(ICakeContext context, TypescriptSettings settings)
    {
        if (settings.IsPreview)
        {
            BumpVersion(context, settings);
        }
    
        Pack(context, settings);
    }

    private static void Build(ICakeContext context, TypescriptSettings settings)
    {
        var runScriptSettings = new NpmRunScriptSettings
        {
            WorkingDirectory = settings.BuildDirectory,
            ScriptName = "build"
        };
        context.NpmRunScript(runScriptSettings);
    }

    private static void Install(ICakeContext context, TypescriptSettings settings)
    {
        var npmCiSettings = new NpmCiSettings
        {
            WorkingDirectory = settings.BuildDirectory
        };
        context.NpmCi(npmCiSettings);
    }

    private static void BumpVersion(ICakeContext context, TypescriptSettings settings)
    {
        var versionSettings = new NpmBumpVersionSettings
        {
            WorkingDirectory = settings.OutputDirectory,
            Version = settings.Version
        };
        context.NpmBumpVersion(versionSettings);
    }

    private static void Pack(ICakeContext context, TypescriptSettings settings)
    {
        var packSettings = new NpmPackSettings
        {
            WorkingDirectory = settings.OutputDirectory
        };
        context.NpmPack(packSettings);
    }
}