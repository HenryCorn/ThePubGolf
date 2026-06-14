#addin nuget:?package=Cake.Npm&version=2.0.0

public record ReactSettings(
    DirectoryPath BuildDirectory,
    string Version,
    bool IsPreview)
{
    public static ReactSettings Create(ICakeContext context, BuildParameters parameters)
    {
        var buildDirectory = parameters.Settings.ReactBuildDirectory;;
        var version = parameters.Version.Package;
        var isPreview = !parameters.BuildProvider.Repository.IsReleaseableBranch;

        return new ReactSettings(buildDirectory, version, isPreview);
    }
}

public static class NpmReactBuilder
{
    public static void BuildAndPack(ICakeContext context, ReactSettings settings)
    {
        Install(context, settings);
        if (settings.IsPreview)
        {
            BumpVersion(context, settings);
        }
        Pack(context, settings);
    }

    private static void Install(ICakeContext context, ReactSettings settings)
    {
        var npmInstallSettings = new NpmInstallSettings
        {
            WorkingDirectory = settings.BuildDirectory
        };
        context.NpmInstall(npmInstallSettings);
    }

    private static void BumpVersion(ICakeContext context, ReactSettings settings)
    {
        var versionSettings = new NpmBumpVersionSettings
        {
            WorkingDirectory = settings.BuildDirectory,
            Version = settings.Version
        };
        context.NpmBumpVersion(versionSettings);
    }

    private static void Pack(ICakeContext context, ReactSettings settings)
    {
        var packSettings = new NpmPackSettings
        {
            WorkingDirectory = settings.BuildDirectory
        };
        context.NpmPack(packSettings);
    }
}