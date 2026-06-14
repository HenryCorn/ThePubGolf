#load "./src/PerformanceSoftware.Cake/Content/parameters.cake"

//////////////////////////////////////////////////////////////////////
// Command line parameters.
//////////////////////////////////////////////////////////////////////

var target = Argument("Target", "Default");

//////////////////////////////////////////////////////////////////////
// Declarations
//////////////////////////////////////////////////////////////////////

var sln = File("Cake.sln");
var releaseNotes = File("release-notes.md");

Setup<BuildParameters>(context =>
{
    var buildSettings = new BuildSettings
    {
        VersionFile = releaseNotes
    };
    var parameters = new BuildParameters(context, buildSettings);
    return parameters;
});

//////////////////////////////////////////////////////////////////////
// Tasks
//////////////////////////////////////////////////////////////////////

Task("__UpdateBuildNumber")
    .WithCriteria<BuildParameters>((context, parameters) => !parameters.IsLocalBuild)
    .Does<BuildParameters>((context, parameters) =>
{
    parameters.BuildProvider.SetBuildName(parameters.Version.File);
});

Task("__Clean")
    .Does<BuildParameters>((context, parameters) =>
{
    CleanDirectories(parameters.Paths.ToClean);
    DotNetClean(sln, new DotNetCleanSettings
    {
        Configuration = parameters.Configuration
    });
});

Task("__DotNetRestore")
    .Does<BuildParameters>((context, parameters) =>
{
    DotNetRestore(sln);
});

Task("__DotNetBuild")
    .Does<BuildParameters>((context, parameters) =>
{
    DotNetBuild(sln, new DotNetBuildSettings
    {
        Configuration = parameters.Configuration,
        NoRestore = true,
        MSBuildSettings = new DotNetMSBuildSettings
        {
            Version = parameters.Version.File,
            InformationalVersion = parameters.Version.Informational
        }
    });
});

Task("__DotNetPack")
    .Does<BuildParameters>((context, parameters) =>
{
    DotNetPack(sln, new DotNetPackSettings
    {
        Configuration = parameters.Configuration,
        NoBuild = true,
        NoRestore = true,
        MSBuildSettings = new DotNetMSBuildSettings
        {
            PackageVersion = parameters.Version.Package
        }
    });
});

Task("__CopyPackagesToDist")
    .Does<BuildParameters>((context, parameters) =>
{
    EnsureDirectoryExists(parameters.Paths.Dist);
    CopyFiles($"src/**/{parameters.Configuration}/*.nupkg", parameters.Paths.Dist);
});

Task("__PublishArtifacts")
    .WithCriteria<BuildParameters>((context, parameters) => !parameters.IsLocalBuild)
    .Does<BuildParameters>((context, parameters) =>
{
    parameters.BuildProvider.PublishArtifacts(parameters.Paths.Dist);
});

//////////////////////////////////////////////////////////////////////
// Execution
//////////////////////////////////////////////////////////////////////

Task("Init")
    .IsDependentOn("__UpdateBuildNumber")
    .IsDependentOn("__Clean")
    .IsDependentOn("__DotNetRestore");

Task("Build")
    .IsDependentOn("Init")
    .IsDependentOn("__DotNetBuild");

Task("Pack")
    .IsDependentOn("Build")
    .IsDependentOn("__DotNetPack")
    .IsDependentOn("__CopyPackagesToDist")
    .IsDependentOn("__PublishArtifacts");

Task("Default")
    .IsDependentOn("Pack");

RunTarget(target);