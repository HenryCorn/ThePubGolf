public record ApptainerSettings(
    string ApptainerImage,
    string DockerTag,
    DirectoryPath OutputDirectory,
    string ImageName,
    string OutputFileName,
    int RetentionCount)
{
    public static ApptainerSettings Create(ICakeContext context, BuildParameters parameters)
    {
        var dockerImage = parameters.Settings.DockerImageName;
        var dockerTag = parameters.Docker?.Tag;

        if (string.IsNullOrWhiteSpace(dockerImage) || string.IsNullOrWhiteSpace(dockerTag))
        {
            return null;
        }
        var settings = parameters.Settings;

        var imageName = dockerImage.Substring(dockerImage.IndexOf('/') + 1);
        var apptainerImageVersion = settings.ApptainerImageVersion;
        var apptainerImage = $"ghcr.io/apptainer/apptainer:{apptainerImageVersion}";
        var packageVersion = parameters.Version.Package;
        var isPreview = !parameters.BuildProvider.Repository.IsReleaseableBranch;
        var outputDirectory = isPreview ? settings.ApptainerDevOutputDirectory : settings.ApptainerOutputDirectory;
        var outputFileName = $"{imageName}_{packageVersion}.sif";
        var retentionCount = settings.ApptainerRetentionCount;

        return new ApptainerSettings(apptainerImage, dockerTag, outputDirectory, imageName, outputFileName, retentionCount);
    }
}

public static class ApptainerGenerator
{
    public static void Generate(ICakeContext context, ApptainerSettings settings)
    {
        var sifPath = $"/work/artifacts/{settings.OutputFileName}";
        var dockerSettings = new DockerContainerRunSettings
        {
            Rm = true,
            Volume = new[]
            {
                "/var/run/docker.sock:/var/run/docker.sock",
                $"\"{context.Environment.WorkingDirectory.FullPath}\":/work",
                $"\"{settings.OutputDirectory}\":/work/artifacts"
            }
        };
        context.DockerRun(
            dockerSettings,
            settings.ApptainerImage,
            $"apptainer build {sifPath} docker-daemon://{settings.DockerTag}");

        var filesToDelete = context.GetFiles($"{settings.OutputDirectory}/{settings.ImageName}_*.sif")
                                   .Select(f => new FileInfo(f.FullPath))
                                   .OrderByDescending(f => f.LastWriteTime)
                                   .Skip(settings.RetentionCount)
                                   .Select(f => f.FullName)
                                   .ToList();

        DeleteFiles(filesToDelete, context);
        context.Information(
            $"SIF cleanup done for '{settings.ImageName}': Kept {settings.RetentionCount}, deleted {filesToDelete.Count}.");
    }

    private static void DeleteFiles(IReadOnlyList<string> files, ICakeContext context)
    {
        foreach (var file in files)
        {
            try
            {
                var processSettings = new ProcessSettings
                {
                    Arguments = new ProcessArgumentBuilder()
                        .Append("rm")
                        .Append(file)
                        .Render()
                };
                context.StartProcess("sudo", processSettings);
            }
            catch (Exception ex)
            {
                context.Warning($"Failed to delete {file}: {ex.Message}");
            }
        }
    }
}

