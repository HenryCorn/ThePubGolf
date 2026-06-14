// The following functionality is unavailable in the open source version due to internal tool dependency.
public static class KeyVault
{
    public static string ReadSecret(ICakeContext context, string vaultName, string secretName)
    {
        throw new NotSupportedException("KeyVault secret reading is not available in the open source version.");
    }
}