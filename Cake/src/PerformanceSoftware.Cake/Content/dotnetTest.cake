#tool dotnet:?package=dotnet-reportgenerator-globaltool&version=5.2.0
#addin nuget:?package=Cake.Coverlet&version=3.0.4

public record DotNetTestRunnerSettings(
    string Configuration,
    string CoverageFilter,
    DirectoryPath ReportsFolder,
    IBuildProvider BuildProvider)
{
    public static DotNetTestRunnerSettings Create(ICakeContext context, BuildParameters parameters)
    {
        var configuration = parameters.Configuration;
        var coverageFilter = parameters.Settings.CoverageFilter;
        var reportsFolder = parameters.Paths.TestResults;
        var buildProvider = parameters.BuildProvider;

        return new DotNetTestRunnerSettings(configuration, coverageFilter, reportsFolder, buildProvider);
    }
}

public static class DotNetTestRunner
{
    public static void TestAndCover(ICakeContext context, string target, DotNetTestRunnerSettings settings)
    {
        var excludeArg = "-- DataCollectionRunSettings.DataCollectors.DataCollector.Configuration.ExcludeByFile=" +
            settings.CoverageFilter;
        var coverageFormatArg = "-- DataCollectionRunSettings.DataCollectors.DataCollector.Configuration.Format=" +
            "cobertura";

        context.DotNetTest(
            target,
            new DotNetTestSettings
            {
                ArgumentCustomization = args => args.Append(excludeArg)
                                                    .Append(coverageFormatArg),
                Configuration = settings.Configuration,
                NoBuild = true,
                NoRestore = true,
                Loggers = new[] { "trx", "console;verbosity=detailed" },
                ResultsDirectory = settings.ReportsFolder,
                Collectors = new[] { "XPlat Code Coverage" }
            });

        ProcessTestFiles(context, settings);
        ProcessCoverageFiles(context, settings);
    }

    private static void ProcessTestFiles(ICakeContext context, DotNetTestRunnerSettings settings)
    {
        context.Information("Processing Tests...");
        context.EnsureDirectoryExists(settings.ReportsFolder);
        var testResults = context.GetFiles($"{settings.ReportsFolder}/*.trx")
                                 .Select(x => FilePath.FromString(x.FullPath.Replace("]", "%5D")))
                                 .ToArray();
        settings.BuildProvider.PublishTestResults(testResults);
    }

    private static void ProcessCoverageFiles(ICakeContext context, DotNetTestRunnerSettings settings)
    {
        context.Information("Processing Code Coverage...");
        var reportPattern = $"{settings.ReportsFolder}/**/*.cobertura.xml";
        var reports = context.GetFiles(reportPattern);
        var reportSettings = new ReportGeneratorSettings
        {
            ReportTypes = new[]
            {
                ReportGeneratorReportType.HtmlInline_AzurePipelines,
                ReportGeneratorReportType.Cobertura
            }
        };
        context.ReportGenerator(reports, settings.ReportsFolder, reportSettings);
        settings.BuildProvider.PublishCodeCoverage($"{settings.ReportsFolder}/Cobertura.xml");
    }
}