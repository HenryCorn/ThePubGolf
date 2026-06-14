public interface IBuildProvider
{
    string BuildNumber { get; }

    BuildRepository Repository { get; }

    void SetBuildName(string number);

    void WriteError(string error);

    void WriteWarning(string warning);

    void PublishArtifacts(DirectoryPath path);

    void PublishTestResults(ICollection<FilePath> files);

    void PublishCodeCoverage(FilePath summaryFile);

    void SetOutputVariable(string name, string value);
}

public class AzurePipelinesBuildProvider : IBuildProvider
{
    private readonly IAzurePipelinesProvider _provider;

    public AzurePipelinesBuildProvider(ICakeContext context, BuildParameters parameters)
    {
        _provider = context.BuildSystem().AzurePipelines;

        BuildNumber = ExtractBuildNumber();
        Repository = BuildRepository.Create(context, parameters, _provider.Environment.Repository.SourceBranch);
    }

    public string BuildNumber { get; }

    public BuildRepository Repository { get; }

    public void SetBuildName(string number)
    {
        _provider.Commands.UpdateBuildNumber(number);
    }

    public void WriteError(string error)
    {
        _provider.Commands.WriteError(error.Replace(Environment.NewLine, "%0D%0A"));
    }

    public void WriteWarning(string warning)
    {
        _provider.Commands.WriteError(warning.Replace(Environment.NewLine, "%0D%0A"));
    }

    public void PublishArtifacts(DirectoryPath path)
    {
        _provider.Commands.UploadArtifactDirectory(path);
    }

    public void PublishTestResults(ICollection<FilePath> files)
    {
        var resultsData = new AzurePipelinesPublishTestResultsData()
        {
            MergeTestResults = true,
            TestResultsFiles = files,
            TestRunner = AzurePipelinesTestRunnerType.VSTest
        };
        _provider.Commands.PublishTestResults(resultsData);
    }

    public void PublishCodeCoverage(FilePath summaryFile)
    {
        var coverageData = new AzurePipelinesPublishCodeCoverageData()
        {
            SummaryFileLocation = summaryFile,
            ReportDirectory = summaryFile.GetDirectory(),
            CodeCoverageTool = AzurePipelinesCodeCoverageToolType.Cobertura
        };
        _provider.Commands.PublishCodeCoverage(coverageData);
    }

    public void SetOutputVariable(string name, string value)
    {
        _provider.Commands.SetOutputVariable(name, value);
    }

    private string ExtractBuildNumber()
    {
        // Handles re-run jobs where the build number may have been set and re-used
        var reportedBuildNumber = _provider.Environment.Build.Number;
        var buildNumberStartingIndex = reportedBuildNumber.LastIndexOf('.') + 1;
        var actualBuildNumber = reportedBuildNumber.Substring(buildNumberStartingIndex);
        return actualBuildNumber;
    }
}

public class TeamCityBuildProvider : IBuildProvider
{
    private ITeamCityProvider _provider;

    public TeamCityBuildProvider(ICakeContext context, BuildParameters parameters)
    {
        _provider = context.BuildSystem().TeamCity;

        BuildNumber = _provider.Environment.Build.Number;
        Repository = BuildRepository.Create(context, parameters);
    }

    public string BuildNumber { get; }

    public BuildRepository Repository { get; }

    public void SetBuildName(string number)
    {
        _provider.SetBuildNumber(number);
    }

    public void WriteError(string error)
    {
        _provider.WriteStatus(error, "ERROR");
    }

    public void WriteWarning(string warning)
    {
        _provider.WriteStatus(warning, "WARNING");
    }

    public void PublishArtifacts(DirectoryPath path)
    {
        _provider.PublishArtifacts(path.FullPath);
    }

    public void PublishTestResults(ICollection<FilePath> files)
    {
        foreach(var file in files)
        {
            _provider.ImportData("vstest", file);
        }
    }

    public void PublishCodeCoverage(FilePath summaryFile)
    {
         // Handled by setting the output type to be CoverletOutputFormat.teamcity
    }

    public void SetOutputVariable(string name, string value)
    {
    }
}

/// <summary>
/// A local implementation of a build provider where commands are no-ops.
/// </summary>
public class LocalBuildProvider : IBuildProvider
{
    public LocalBuildProvider(ICakeContext context, BuildParameters parameters)
    {
        Repository = BuildRepository.Create(context, parameters);
    }

    public string BuildNumber { get; } = "0";

    public BuildRepository Repository { get; }

    public void SetBuildName(string number)
    {
    }

    public void WriteError(string error)
    {
    }

    public void WriteWarning(string warning)
    {
    }

    public void PublishArtifacts(DirectoryPath path)
    {
    }

    public void PublishTestResults(ICollection<FilePath> files)
    {
    }

    public void PublishCodeCoverage(FilePath summaryFile)
    {
    }

    public void SetOutputVariable(string name, string value)
    {
    }
}

public static IBuildProvider GetBuildProvider(ICakeContext context, BuildParameters parameters)
{
    if (context.BuildSystem().IsRunningOnAzurePipelines)
    {
        return new AzurePipelinesBuildProvider(context, parameters);
    }

    if (context.BuildSystem().IsRunningOnTeamCity)
    {
        return new TeamCityBuildProvider(context, parameters);
    }

    return new LocalBuildProvider(context, parameters);
}