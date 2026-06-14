#addin nuget:?package=Cake.Docker&version=1.0.0

public record HelmSettings(string Version, DirectoryPath OutputDirectory, string HelmImage)
{
    public static HelmSettings Create(ICakeContext context, BuildParameters parameters)
    {
        var version = parameters.Version.Package;
        var outputDirectory = parameters.Paths.Dist;
        var helmImage = $"alpine/helm:{parameters.Settings.HelmImageVersion}";

        return new HelmSettings(version, outputDirectory, helmImage);
    }
}

public static class HelmPackager
{
    public static void LintAndPackage(ICakeContext context, DirectoryPath chartDirectory, HelmSettings settings)
    {
        var tempDirectory = context.Directory(System.IO.Path.GetTempFileName()[..^4]).Path.FullPath;
        var absoluteChartDirectory = context.MakeAbsolute(chartDirectory);
        context.EnsureDirectoryExists(tempDirectory);
        context.CopyFiles($"{absoluteChartDirectory.FullPath}/**/*", tempDirectory, true);
        context.ReplaceTextInFiles($"{tempDirectory}/**/*", "__VERSION__", settings.Version);

        var dockerSettings = new DockerContainerRunSettings
        {
            Rm = true,
            Volume = new[] { $"{tempDirectory}:/chart" },
            Workdir = "/chart"
        };
        var result = context.DockerRun(dockerSettings, settings.HelmImage, "lint /chart");
        context.Information("Linting complete...");
        context.DockerRun(dockerSettings, settings.HelmImage, $"package /chart --version {settings.Version}");
        context.Information("Packaging complete...");
        var chartTgz = context.GetFiles($"{tempDirectory}/*.tgz");
        if (chartTgz.Count == 0)
        {
            throw new Exception("Failed to package Helm chart");
        }
        context.EnsureDirectoryExists(settings.OutputDirectory);
        context.CopyFiles($"{tempDirectory}/*.tgz", settings.OutputDirectory);
        var deleteSettings = new DeleteDirectorySettings
        {
            Recursive = true,
            Force = true
        };
        context.DeleteDirectory(tempDirectory, deleteSettings);
    }
}