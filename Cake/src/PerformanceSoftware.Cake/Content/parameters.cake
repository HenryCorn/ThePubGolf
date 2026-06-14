#load "./apptainer.cake"
#load "./buildProvider.cake"
#load "./docker.cake"
#load "./dotnetTest.cake"
#load "./helm.cake"
#load "./npm-angular.cake"
#load "./npm-react.cake"
#load "./npm-typescript.cake"
#load "./python.cake"
#load "./openapi.cake"
#load "./paths.cake"
#load "./repository.cake"
#load "./settings.cake"
#load "./version.cake"

public class BuildParameters
{
    public string Configuration { get; }

    public IBuildProvider BuildProvider { get; }

    public bool IsLocalBuild { get; }

    public BuildSettings Settings { get; }

    public BuildPaths Paths { get; }

    public BuildVersion Version { get; }

    public DockerInfo Docker { get; }

    public HelmSettings Helm { get; }

    public OpenApiSettings OpenApi { get; set; }

    public AngularSettings Angular { get; set;}

    public ReactSettings React { get; set; }

    public TypescriptSettings Typescript { get; set; }

    public PythonSettings Python { get; set; }

    public DotNetTestRunnerSettings DotNetTest { get; set; }

    public ApptainerSettings Apptainer { get; set; }

    public BuildParameters(ICakeContext context, BuildSettings settings = null)
    {
        if (context is null)
        {
            throw new ArgumentNullException(nameof(context));
        }

        if (settings is null)
        {
            settings = new BuildSettings();
        }

        Settings = settings.ApplyDefaults(context);

        Configuration = context.Argument("configuration", "Release");
        IsLocalBuild = context.BuildSystem().IsLocalBuild;
        BuildProvider = GetBuildProvider(context, this);
        Paths = BuildPaths.GetPaths(context);
        Version = BuildVersion.Calculate(context, this);
        Docker = DockerInfo.Generate(context, this);
        OpenApi = OpenApiSettings.Create(context, this);
        Angular = AngularSettings.Create(context, this);
        React = ReactSettings.Create(context, this);
        Typescript = TypescriptSettings.Create(context, this);
        Python = PythonSettings.Create(context, this);
        DotNetTest = DotNetTestRunnerSettings.Create(context, this);
        Helm = HelmSettings.Create(context, this);
        Apptainer = ApptainerSettings.Create(context, this);
    }
}