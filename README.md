# Python Project Template

Currently defaults to Python 13.2. You may need to adjust the files here and Python version for
your project's requirements. Do that after copying the files to your new project.

## How to initialize a new python project

First, copy the files to your cloned empty repo:

- Powershell: `.\CopyFiles.ps1 -destinationFolder "C:\TargetFolder"`
- Fish shell: `./copy_files.fish /path/to/new/repo`

Next, after copying, update the `pyproject.toml` file to match your project. Adjust the Python
version and library versions as necessary.

Note: The `pyproject.toml` file is a configuration file for Python projects. It is used to
define project metadata, dependencies, and build system requirements. It is part of the
PEP 518 standard, which aims to standardize the way Python projects are configured and built.

In that file, please keep the prefix `testeract-` if possible to denote any packages built from
this project are from us.

## What is provided in this Template

### Developer Tools

The file lists several developer and quality tools. Notably, these include:

- ruff: A fast linter and code fixer.
- Black: A code formatter that enforces a consistent style.
- isort: A tool to sort and organize import statements.
- pre_commit: Manages and runs Git pre‑commit hooks.
- pyright: A static type checker for Python.
- radon: An analyzer that provides code metrics such as cyclomatic complexity.
- xenon: Analyzes code complexity and helps monitor code quality over time.

The configuration file provides settings and supported environments for several tools, including:

### Other tools

#### Build System & Packaging

Uses setuptools and setuptools‑scm for building and version management. Package discovery is
configured under the [tool.setuptools] sections.

#### Python Version Support

The project requires Python ≥3.1 (as defined by requires-python = ">=3. 12"). Tools like pyright
and black are specifically configured to target Python 3.12 (e.g., target-version = "py312" and
pythonVersion = "3.12").

#### Testing & Coverage

pytest is configured for running tests (see [tool.pytest.ini_options]). coverage is set up to
measure test coverage, with specific files/directories omitted.

#### Code Quality and Analysis

- Black: Configured for formatting with a line length of 100.
- isort: Uses the Black profile to maintain consistent import formatting.
- ruff: Configured with custom settings (e.g., excluded directories, line length, and lint
  rules) to act as a linter and auto-fixer.
- pyright: Provides static type checking with paths and Python version specifics.
- radon: Configured to analyze code complexity (ignoring the virtual environment).
- bandit: Set up for security analysis by checking code for vulnerabilities, excluding
  certain directories.
- licensecheck: Checks dependency licenses based on the requirements file.

### CI/CD Jobs

#### Included Templates

- SAST Jobs: The pipeline includes the Jobs/SAST.gitlab-ci.yml template, which automatically
  runs static application security tests on your code.
- Secret Detection: The Security/Secret-Detection.gitlab-ci.yml template is also included, which
  scans the repository for accidentally committed secrets.

#### Custom Pipeline Stages and Jobs

The pipeline defines the following stages: install, check, lint, test, verify, build, and release.

1. Install Stage
  - install-dependencies: Purpose: Sets up the Python environment by upgrading pip, installing
    virtualenv, creating a virtual environment, and installing the dependencies from
    requirements. txt. Artifacts & Caching: Caches the virtual environment and pip cache for
    reuse in later jobs.
2. Check Stage
  - check-licenses: Purpose: Activates the virtual environment and runs a license check
    (using licensecheck) to verify that all dependency licenses are compliant. Dependencies:
    Needs the install-dependencies job.
  - check-security: Purpose: Runs security analysis using Bandit (with bandit -r ./src/) to
    scan the source code for common security issues. Dependencies: Also requires
    install-dependencies.
3. Lint Stage
  - lint-markdown: Purpose: Uses a dedicated Markdown linting image to check Markdown files with
    mdl ..
  - lint-python: Purpose: Activates the virtual environment and uses Ruff to lint Python files
    by checking all .py files. Dependencies: Needs install-dependencies.
  - lint-typings: Purpose: Runs Pyright to perform static type checking on the Python code,
    verifying type annotations. Dependencies: Needs install-dependencies.
  - lint-complexity: Purpose: Uses Xenon to analyze code complexity and ensure that complexity
    metrics (absolute, module, and average) are within defined thresholds. Dependencies: Needs
    install-dependencies.
4. Test Stage
  - .unit-tests: Purpose: Runs unit tests using Pytest with coverage enabled. It executes tests,
    generates a coverage report, and produces an XML report for further analysis. Artifacts: The
    coverage XML is saved as an artifact (expires in 14 days). Dependencies: Needs
    install-dependencies.
5. Verify Stage: This stage is designed to validate the project across different Python versions.
  - .verify: Purpose: A generic verification job that sets up a fresh virtual environment,
    installs dependencies, and runs Pytest. .verify-python-3.9, .verify-python-3.10, .
    verify-python-3.11, .verify-python-3.12: Purpose: Each job uses a different Python version
    (3.9, 3.10, 3.11, and 3.12 respectively) to run the same verification steps as in .verify.
6. Build Stage
  - .build-library: Purpose: Builds the Python library using the python -m build command and
    then uploads the package using Twine. Execution: This job is only triggered for taggedJ
    commits (ensuring that builds happen only on releases or significant tags). Dependencies:
    Requires the install-dependencies job to ensure the environment is set up.
7. Release Stage
  - .release_job: Purpose: Uses GitLab’s Release CLI to create a release. It sets the release
    tag, description, and reference based on the Git commit. Execution Rule: This job only runs
    if a Git tag is present (if: $CI_COMMIT_TAG).
