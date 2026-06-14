public class BuildSettings
{
    public DirectoryPath RepositoryRoot { get; set; }

    public FilePath VersionFile { get; set; }

    public string VersionPrefix { get; set; } = "-";

    public string DockerRegistry { get; set; }

    public string DockerImageName { get; set; }

    public FilePath OpenApiSpecFile { get; set; }

    public string HelmImageVersion { get; set; } = "3.8.0";

    public string OpenApiGeneratorVersion { get; set; } = "v7.8.0";

    public string OpenApiAspNetCoreVersion { get; set; } = "2.1";

    public string OpenApiDotnetTargetFramework { get; set; } = "netstandard2.0";

    public string OpenApiNgVersion { get; set; } = "18.2.3";

    public string OpenApiValidatorVersion { get; set; } = "0.11.0";

    public string OpenApiMergerVersion { get; set; } = "0.1.0";

    public string OpenApiPythonGenVersion { get; set; } = "0.1.2";

    public Dictionary<string, string> OpenApiAdditionalSettings { get; set; } = new();

    public DirectoryPath AngularBuildDirectory { get; set; }

    public DirectoryPath ReactBuildDirectory { get; set; }

    public DirectoryPath TypescriptBuildDirectory { get; set; } = "./";

    public DirectoryPath PythonBuildDirectory { get; set; } = "./";

    public string PythonPackageName { get; set; }

    public string NpmNodeVersion { get; set; } = "18.19.50";

    public string NpmTypeScriptVersion { get; set; } = "5.5.4";

    public string ProductName { get; set; }

    public string CoverageFilter { get; set; } = "**/packages/**.cs";

    public string ApptainerImageVersion { get; set; } = "1.4.1";

    public string ApptainerOutputDirectory { get; set; } = "/cvm/cvm_oci_images/prd";

    public string ApptainerDevOutputDirectory { get; set; } = "/cvm/cvm_oci_images/dev";

    public int ApptainerRetentionCount { get; set; } = 10;

    public BuildSettings ApplyDefaults(ICakeContext context)
    {
        if (RepositoryRoot is null)
        {
            RepositoryRoot = context.Directory(".");
        }

        if (VersionFile is null)
        {
            VersionFile = context.File("./Version.props");
        }

        if (AngularBuildDirectory is null)
        {
            AngularBuildDirectory = context.Directory("gen/Clients/typescript-angular");
        }

        if (ReactBuildDirectory is null)
        {
            ReactBuildDirectory = context.Directory("gen/Clients/typescript-axios");
        }

        return this;
    }
}