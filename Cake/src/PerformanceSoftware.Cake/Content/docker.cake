public record DockerInfo(string Tag, string LatestTag, FilePath OutputFileName)
{
    public static DockerInfo Generate(ICakeContext context, BuildParameters parameters)
    {
        var registry = parameters.Settings.DockerRegistry;
        var imageName = parameters.Settings.DockerImageName;

        if (string.IsNullOrWhiteSpace(registry) || string.IsNullOrWhiteSpace(imageName))
        {
            return null;
        }

        var version = parameters.Version.Package;
        var tag = $"{registry}/{imageName}:{version}";
        var latestVersion = parameters.BuildProvider.Repository.IsReleaseableBranch ? "latest" : "latest-preview";
        var latestTag = $"{registry}/{imageName}:{latestVersion}";

        var fileName = $"{imageName.Substring(imageName.LastIndexOf('/') + 1)}.tar";
        var outputFileName = parameters.Paths.Dist.CombineWithFilePath(context.File(fileName));

        return new DockerInfo(tag, latestTag, outputFileName);
    }
}