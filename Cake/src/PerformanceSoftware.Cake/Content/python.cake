public record PythonSettings(
    DirectoryPath ProjectDirectory,
    DirectoryPath TempBuildDirectory,
    string Version,
    bool IsPreview,
    string PackageName)
{
    public static PythonSettings Create(ICakeContext context, BuildParameters parameters)
    {
        var projectDirectory = parameters.Settings.PythonBuildDirectory;
        var tempBuildDirectory = projectDirectory + context.Directory("artifacts/python-build");
        var version = parameters.Version.Package;
        var isPreview = !parameters.BuildProvider.Repository.IsReleaseableBranch;
        var packageName = parameters.Settings.PythonPackageName;

        return new PythonSettings(projectDirectory, tempBuildDirectory, version, isPreview, packageName);
    }
}

public static class PythonPackageBuilder
{
    public static void PrepareAndBump(ICakeContext context, PythonSettings settings)
    {
        PrepareBuildDirectory(context, settings);

        BumpVersion(context, settings);
    }

    private static void PrepareBuildDirectory(ICakeContext context, PythonSettings settings)
    {
        context.EnsureDirectoryExists(settings.TempBuildDirectory);
        var destContent =  settings.TempBuildDirectory + context.Directory(settings.PackageName);
        context.EnsureDirectoryExists(destContent);
        var packageContent = settings.ProjectDirectory + context.Directory(settings.PackageName);
        context.EnsureDirectoryExists(packageContent);
        
        context.CopyDirectory(packageContent, destContent);
        
        context.CopyFileToDirectory("./setup.cfg", settings.TempBuildDirectory);
        context.CopyFileToDirectory("./setup.py", settings.TempBuildDirectory);
        context.CopyFileToDirectory("./README.md", settings.TempBuildDirectory);
        context.CopyFileToDirectory("./entrypoint.sh", settings.TempBuildDirectory);
        context.CopyFileToDirectory("./MANIFEST.in", settings.TempBuildDirectory);
    }

    private static void BumpVersion(ICakeContext context, PythonSettings settings)
    {
        // Update version in setup.cfg in the temp build directory
        var setupCfgPath = settings.TempBuildDirectory + context.File("/setup.cfg");
        if (!context.FileExists(setupCfgPath))
        {
            throw new FileNotFoundException($"Setup configuration file not found: {setupCfgPath}");
        }
        else
        {
            var lines = context.FileReadLines(setupCfgPath);
            var newLines = new List<string>();
            foreach (var line in lines)
            {
                if (line.TrimStart().StartsWith("version = "))
                {
                    newLines.Add($"version = {settings.Version}");
                }
                else
                {
                    newLines.Add(line);
                }
            }
            context.FileWriteLines(setupCfgPath, newLines.ToArray());
        }
    }
}