#addin nuget:?package=Cake.Npm&version=2.0.0

public record AngularSettings(
    DirectoryPath BuildDirectory,
    string Version,
    string NodeVersion,
    string TypeScriptVersion,
    bool IsPreview)
{
    public static AngularSettings Create(ICakeContext context, BuildParameters parameters)
    {
        var buildDirectory = parameters.Settings.AngularBuildDirectory;
        var version = parameters.Version.Package;
        var nodeVersion = parameters.Settings.NpmNodeVersion;
        var typeScriptVersion = parameters.Settings.NpmTypeScriptVersion;
        var isPreview = !parameters.BuildProvider.Repository.IsReleaseableBranch;

        return new AngularSettings(buildDirectory, version, nodeVersion, typeScriptVersion, isPreview);
    }
}

public static class NpmAngularBuilder
{
    public static void BuildAndPack(ICakeContext context, AngularSettings settings)
    {
        Install(context, settings);
        Build(context, settings);
        if (settings.IsPreview)
        {
            BumpVersion(context, settings);
        }
        Pack(context, settings);
    }

    private static void Install(ICakeContext context, AngularSettings settings)
    {
        var npmInstallSettings = new NpmInstallSettings
        {
            WorkingDirectory = settings.BuildDirectory
        };
        npmInstallSettings.Packages.Add(
            $"@types/node@{settings.NodeVersion} typescript@{settings.TypeScriptVersion} --save-dev");
        context.NpmInstall(npmInstallSettings);
        npmInstallSettings.Packages.Clear();
        context.NpmInstall(npmInstallSettings);
    }

    private static void Build(ICakeContext context, AngularSettings settings)
    {
        var runScriptSettings = new NpmRunScriptSettings
        {
            WorkingDirectory = settings.BuildDirectory,
            ScriptName = "build"
        };
        context.NpmRunScript(runScriptSettings);
    }

    private static void BumpVersion(ICakeContext context, AngularSettings settings)
    {
        var versionSettings = new NpmBumpVersionSettings
        {
            WorkingDirectory = settings.BuildDirectory + context.Directory("dist"),
            Version = settings.Version
        };
        context.NpmBumpVersion(versionSettings);
    }

    private static void Pack(ICakeContext context, AngularSettings settings)
    {
        var packSettings = new NpmPackSettings
        {
            WorkingDirectory = settings.BuildDirectory + context.Directory("dist")
        };
        context.NpmPack(packSettings);
    }
}