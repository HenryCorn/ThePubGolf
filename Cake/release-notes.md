## 4.10.0 (19/09/2025)
- Update: Include test output in console logs.

## 4.9.0 (08/08/2025)
- Add: Support for python packages.

## 4.8.0 (25/07/2025)
- Add: Support for typescript packages.

## 4.7.0 (22/07/2025)
- Add: Support for cleaning Apptainer images.

## 4.6.0 (15/07/2025)
- Add: Support creating Apptainer images.
- Change: Update build to run on AzUbuntu.

## 4.5.0 (03/04/2025)
- Update: Support deploy branches for releases.
- Update: Update default Python OpenAPI generator version.

## 4.4.0 (31/01/2025)
- Update: Use more generic interface for build parameters.

## 4.3.0 (13/01/2025)
- Add: Allow version to be generated from pyproject.toml.

## 4.2.1 (10/01/2025)
- Fix: Issue reading key vaults on Linux machine.

## 4.2.0 (10/01/2025)
- Update: Add ability to get secrets from Azure Key Vaults.

## 4.1.0 (03/01/2025)
- Update: Make version clearer when no version is provided.

## 4.0.0 (01/10/2024)
- Add: Add react client package generation.

## 3.4.0 (11/09/2024)
- Update: Update OpenApi Generator to v7.8.0.

## 3.3.0 (20/08/2024)
- Add: Adds support for building HELM charts via Cake.

## 3.2.3 (07/06/2024)
- Fix: Corrects behaviour of chained allOf with open-api normalizer

## 3.2.2 (16/01/2024)
- Update: Revert default c# client packages to netstandard2.0.

## 3.2.1 (15/01/2024)
- Update: Use latest versions for code coverage.

## 3.2.0 (12/01/2024)
- Update: Add support for generating clients on Linux.
- Update: Make it clearer in the build what has actually failed.

## 3.1.0 (12/12/2023)
- Update: Export version variables when running in Azure DevOps.

## 3.0.0 (28/09/2023)
- Update: Update OpenApi Generator to v7.0.1.

## 2.3.2 (21/08/2023)
- Update: Update Angular minor version to 15.2.9.

## 2.3.1 (09/06/2023)
- Update: Update Angular version to v15.

## 2.3.0 (20/04/2023)
- Update: Support master branch for releases.

## 2.2.1 (18/01/2023)
- Update: [SD-10792](http://info-hq4/browse/SD-10792) - Update node version to v18.

## 2.1.0 (15/12/2022)
- Update: [SD-10739](http://info-hq4/browse/SD-10739) - Add support for version.py in Cake.

- ## 2.0.0 (17/11/2022)
- Update: [SD-10650](http://info-hq4/browse/SD-10650) - Update Cake scripts to support Cake 3.

## 1.12.2 (09/11/2022)
- Fix: [SD-10621](http://info-hq4/browse/SD-10621) - OpenApi Python package gen producing empty packages.

## 1.12.1 (02/11/2022)
- Fix: [SD-10607](http://info-hq4/browse/SD-10607) - Cake NPM version step fails on main branch.

## 1.12.0 (01/11/2022)
- Update: [SD-10597](http://info-hq4/browse/SD-10597) - Centralise logic to build, version and pack npm packages.

## 1.11.1 (26/10/2022)
- Update: [SD-10585](http://info-hq4/browse/SD-10585) - Add support for getting "latest" tag for docker image.
- Fix: [SD-10586](http://info-hq4/browse/SD-10586) - Cake shouldn't set latest tag on preview builds.

## 1.10.0 (25/10/2022)
- Update: [SD-10575](http://info-hq4/browse/SD-10575) - Add ability to provide additional settings to OpenAPI when running Cake.
- Update: [SD-10576](http://info-hq4/browse/SD-10576) - Ensure local python packages are versioned as pre-release.

## 1.9.0 (24/10/2022)
- Update: [SD-10557](http://info-hq4/browse/SD-10557) - Create Cake method for bundling OpenApi spec files.
- Update: [SD-10564](http://info-hq4/browse/SD-10564) - Create Cake method for generating Python clients from an Open API spec.

## 1.8.0 (09/10/2022)
- Update: Allow version to be generated from current timestamp.

## 1.7.0 (14/09/2022)
- Update: Add support for validating an OpenAPI spec.

## 1.6.0 (09/09/2022)
- Update: Add support for generating clients/server from OpenAPI spec.

## 1.5.1 (09/09/2022)
- Fix: Publish code coverage in DevOps builds.

## 1.5.0 (24/08/2022)
- Update: Add support for package.json files.

## 1.4.0 (04/08/2022)
- Update: Add support for OpenAPI files.

## 1.3.0 (19/05/2022)
- Update: Add docker support.

## 1.2.0 (11/05/2022)
- Update: Add ability to configure build settings.
- Update: Add ability to extract version from release notes.

## 1.1.0 (28/04/2022)
- Fix: Handle branches in DevOps builds.

## 1.0.0 (26/04/2022)
- Initial release.