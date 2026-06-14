AstonMartinF1.PerformanceSoftware.Cake
=======================================

## Current Release
![AstonMartinF1.PerformanceSoftware.Cake package in AstonMartinF1 feed in Azure Artifacts](https://feeds.dev.azure.com/AstonMartinF1/_apis/public/Packaging/Feeds/AstonMartinF1/Packages/6ae0d764-08e5-446f-87d8-ea38ec192f31/Badge)

## Build

[![Build Status](https://dev.azure.com/AstonMartinF1/Performance%20Software%20Group/_apis/build/status/Cake?branchName=main)](https://dev.azure.com/AstonMartinF1/Performance%20Software%20Group/_build/latest?definitionId=56&branchName=main)

## Deployments

Preview  | Stable |
-------- | :-------------: |
[![Preview Status](https://vsrm.dev.azure.com/AstonMartinF1/_apis/public/Release/badge/2a786850-95c0-4da0-b983-b2d421c95f92/8/15)](https://vsrm.dev.azure.com/AstonMartinF1/_apis/public/Release/badge/2a786850-95c0-4da0-b983-b2d421c95f92/8/15) | [![Stable Status](https://vsrm.dev.azure.com/AstonMartinF1/_apis/public/Release/badge/2a786850-95c0-4da0-b983-b2d421c95f92/8/16)](https://vsrm.dev.azure.com/AstonMartinF1/_apis/public/Release/badge/2a786850-95c0-4da0-b983-b2d421c95f92/8/16)

# Introduction
This Performance Software Cake package allows common [Cake Build](https://cakebuild.net/) scripts to between projects.

# Usage
At the top of your `build.cake` script add the following line
```
#load "nuget:?package=AstonMartinF1.PerformanceSoftware.Cake&version=1.0.0"
```
It's recommended you pin the specific version of the package that you wish to use, as per Cake best practices to avoid unexpected changes.

A `BuildParameters` object can then be constructed in the `Setup` task of your script.
``` csharp
Setup<BuildParameters>(context =>
{
    return new BuildParameters(context);
});
```

Those build parameters can then be accessed in tasks as required, for example
``` csharp
Task("Clean")
    .Does<BuildParameters>((context, parameters) =>
{
    CleanDirectories($"**/bin/{parameters.Configuration}");
    CleanDirectories($"**/obj/{parameters.Configuration}");
    CleanDirectories(parameters.Paths.ToClean);
});
```

# Build
Run `.\build` from the repository root. This Powershell script bootstraps the `dotnet cake` tool.