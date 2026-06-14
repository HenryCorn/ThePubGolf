public record BuildPaths(DirectoryPath Artifacts, DirectoryPath Dist, DirectoryPath TestResults)
{
    public GlobPattern ToClean { get; } = $"./**/^{{bin,obj,{Artifacts.GetDirectoryName()}}}";

    public static BuildPaths GetPaths(ICakeContext context)
    {
        var artifactsDir = (DirectoryPath)context.Directory("./artifacts");
        var reportsDir = artifactsDir.Combine("reports");

        return new BuildPaths(artifactsDir, artifactsDir.Combine("dist"), reportsDir.Combine("tests"));
    }
}