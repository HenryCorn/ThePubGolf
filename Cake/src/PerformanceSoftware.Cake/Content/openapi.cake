#addin nuget:?package=Cake.Docker&version=1.0.0

public record OpenApiSettings(
    FilePath SpecFile,
    string Product,
    string Version,
    string GeneratorImage,
    string GeneratorVersion,
    string MergerImage,
    string AspNetCoreVersion,
    string TargetFramework,
    string NgVersion,
    string ValidatorImage,
    string PythonGenImage,
    Dictionary<string, string> AdditionalSettings)
{
    public static OpenApiSettings Create(ICakeContext context, BuildParameters parameters)
    {
        var specFile = parameters.Settings.OpenApiSpecFile;
        var product = parameters.Settings.ProductName;
        var version = parameters.Version.Package;
        var generatorVersion = parameters.Settings.OpenApiGeneratorVersion;
        var generatorImage = $"openapitools/openapi-generator-cli:{generatorVersion}";
        var mergerVersion = parameters.Settings.OpenApiMergerVersion;
        var mergerImage = $"nexus.jordangp.com:8443/aston-martin-f1/open-api-merge:{mergerVersion}";
        var aspNetCoreVersion = parameters.Settings.OpenApiAspNetCoreVersion;
        var targetFramework = parameters.Settings.OpenApiDotnetTargetFramework;
        var ngVersion = parameters.Settings.OpenApiNgVersion;
        var validatorVersion = parameters.Settings.OpenApiValidatorVersion;
        var validatorImage = $"wework/speccy:{validatorVersion}";
        var pythonGenVersion = parameters.Settings.OpenApiPythonGenVersion;
        var pythonGenImage = $"nexus.jordangp.com:8443/aston-martin-f1/open-api-python-gen:{pythonGenVersion}";
        var additionalSettings = parameters.Settings.OpenApiAdditionalSettings;

        return new OpenApiSettings(
            specFile,
            product,
            version,
            generatorImage,
            generatorVersion,
            mergerImage,
            aspNetCoreVersion,
            targetFramework,
            ngVersion,
            validatorImage,
            pythonGenImage,
            additionalSettings);
    }
}

public static class OpenApiGenerator
{
    public static void GenerateServer(ICakeContext context, OpenApiSettings settings)
    {
        var generator = "aspnetcore";
        var packageName = $"AstonMartinF1.{settings.Product}.Web.Api.Specification";
        var options = new Dictionary<string, string>()
        {
            { "packageName", packageName },
            { "sourceFolder", "gen" },
            { "buildTarget", "library" },
            { "classModifier", "abstract" },
            { "useSwashbuckle", "false" },
            { "aspnetCoreVersion", settings.AspNetCoreVersion },
            { "modelClassModifier", "" },
            { "enumValueSuffix", "" }
        };

        try
        {
            Generate(context, generator, options, settings);
        }
        finally
        {
            TakeOwnershipOfGeneratedFiles(context);
        }
    }

    public static void GenerateClients(ICakeContext context, OpenApiSettings settings)
    {
        try
        {
            GenerateCSharpClient(context, settings);
            GenerateAngularClient(context, settings);
            GenerateReactClient(context, settings);
            GeneratePythonClient(context, settings);
        }
        finally
        {
            TakeOwnershipOfGeneratedFiles(context);
        }
    }

    public static void Validate(ICakeContext context, OpenApiSettings settings)
    {
        var directory = context.MakeAbsolute(context.Directory("./"));

        var dockerSettings = new DockerContainerRunSettings
        {
            Rm = true,
            Volume = new[] { $"{directory}:/data" }
        };
        var output = context.DockerRun(
            dockerSettings,
            settings.ValidatorImage,
            $"lint \"/data/{settings.SpecFile}\"");
        if (!string.IsNullOrWhiteSpace(output))
        {
            context.Information(output);
        }
    }

    public static OpenApiSettings BundleSpecFiles(ICakeContext context, OpenApiSettings settings)
    {
        var directory = context.MakeAbsolute(context.Directory("./"));
        var bundleFile = context.File(settings.SpecFile.ToString().Replace(".yaml", ".bundle.yaml"));

        var dockerSettings = new DockerContainerRunSettings
        {
            Rm = true,
            Volume = new[] { $"{directory}:/data" }
        };
        context.DockerRun(dockerSettings, settings.MergerImage, $"/data/{settings.SpecFile}", $"/data/{bundleFile}");
        return settings with { SpecFile = bundleFile };
    }

    private static void TakeOwnershipOfGeneratedFiles(ICakeContext context)
    {
        if (!context.IsRunningOnLinux())
        {
            return;
        }
        var user = System.Environment.GetEnvironmentVariable("USER");
        var group = System.Environment.GetEnvironmentVariable("GROUP");
        var processSettings = new ProcessSettings
        {
            Arguments = new ProcessArgumentBuilder()
                .Append("chown")
                .Append($"{user}:{group}")
                .Append(context.Directory(".").Path.FullPath)
                .Append("-R")
                .Render()
        };
        context.StartProcess("sudo", processSettings);
    }

    private static void GenerateCSharpClient(ICakeContext context, OpenApiSettings settings)
    {
        var generator = "csharp";
        var outputLocation = context.Directory($"gen/Clients/{generator}");
        var packageName = $"AstonMartinF1.{settings.Product}.Web.Api.Client";
        var options = new Dictionary<string, string>()
        {
            { "packageName", packageName },
            { "packageVersion", settings.Version },
            { "targetFramework", settings.TargetFramework },
            { "optionalAssemblyInfo", "false" },
            { "useDateTimeOffset", "true" },
            { "netCoreProjectFile", "true" },
        };
        var additionalArguments = "--library=httpclient";

        Generate(context, generator, options, settings, outputLocation, additionalArguments);
    }

    private static void GenerateAngularClient(ICakeContext context, OpenApiSettings settings)
    {
        var generator = "typescript-angular";
        var outputLocation = context.Directory($"gen/Clients/{generator}");
        var packageName = $"amf1-ngx.{settings.Product.ToLower()}.api-client";
        var options = new Dictionary<string, string>()
        {
            { "ngVersion", settings.NgVersion },
            { "npmName", packageName }
        };
        var additionalArguments = "--type-mappings=object=any";

        Generate(context, generator, options, settings, outputLocation, additionalArguments);
    }

    private static void GenerateReactClient(ICakeContext context, OpenApiSettings settings)
    {
        var generator = "typescript-axios";
        var outputLocation = context.Directory($"gen/Clients/{generator}");
        var packageName = $"amf1-react.{settings.Product.ToLower()}.api-client";
        var options = new Dictionary<string, string>()
        {
            { "npmName", packageName }
        };
        var additionalArguments = "";

        Generate(context, generator, options, settings, outputLocation, additionalArguments);
    }

    private static void Generate(
        ICakeContext context,
        string generator,
        IReadOnlyDictionary<string, string> options,
        OpenApiSettings settings,
        string outputLocation = "",
        string additionalArguments = "")
    {
        var valuePairs = options.Union(settings.AdditionalSettings).Select(x => $"{x.Key}={x.Value}");
        var additionalProperties = string.Join(',', valuePairs);
        var directory = context.MakeAbsolute(context.Directory("./"));

        var dockerSettings = new DockerContainerRunSettings
        {
            Rm = true,
            Volume = new[] { $"{directory}:/data" }
        };
        context.DockerRun(
            dockerSettings,
            settings.GeneratorImage,
            $"generate -i \"/data/{settings.SpecFile}\" -g {generator} -o /data/{outputLocation} " +
                $"{additionalArguments} --additional-properties={additionalProperties} " +
                "--openapi-normalizer REFACTOR_ALLOF_WITH_PROPERTIES_ONLY=true");
    }

    private static void GeneratePythonClient(ICakeContext context, OpenApiSettings settings)
    {
        context.Information($"Generating Python client from '{settings.SpecFile}'");
        var directory = context.MakeAbsolute(context.Directory("./"));
        var outputLocation = context.Directory($"gen/Clients/python");

        var dockerSettings = new DockerContainerRunSettings
        {
            Rm = true,
            Volume = new[] { $"{directory}:/data" }
        };
        context.DockerRun(
            dockerSettings,
            settings.PythonGenImage,
            $"\"/data/{settings.SpecFile}\"",
            $"\"/data/{outputLocation}\"",
            settings.Version.Replace("local", "alpha"));
    }
}