#addin nuget:?package=Cake.Git&version=2.0.0

public record BuildRepository(string Branch, string Sha)
{
    public bool IsReleaseableBranch
    {
        get
        {
            return Branch == "refs/heads/main" || 
                   Branch == "refs/heads/master" ||
                   Branch.StartsWith("refs/heads/release/", StringComparison.InvariantCultureIgnoreCase) ||
                   Branch.StartsWith("refs/heads/deploy", StringComparison.InvariantCultureIgnoreCase);
        }
    }

    public static BuildRepository Create(ICakeContext context, BuildParameters parameters, string branch = null)
    {
        if (branch is null)
        {
            branch = CalculateBranch(context, parameters);
        }

        return new BuildRepository(branch, CalculateSha(context, parameters));
    }

    private static string CalculateSha(ICakeContext context, BuildParameters parameters)
    {
        var tip = context.GitLogTip(parameters.Settings.RepositoryRoot);
        return tip.Sha.Substring(0, 7);
    }

    private static string CalculateBranch(ICakeContext context, BuildParameters parameters)
    {
        var currentBranch = context.GitBranchCurrent(parameters.Settings.RepositoryRoot);
        return currentBranch.CanonicalName;
    }
}