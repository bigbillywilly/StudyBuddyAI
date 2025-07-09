# Contributing Guidelines

In order to develop this project, you will need to set up your development environment. This
includes setting up your Python environment, installing the required libraries, and setting up
your development tools. Lastly, discussion of expectations for code style and quality are
discussed as well as the tools used to enforce these standards.

_All commands are assumed to be run in the top-level project directory._

## Managing Multiple Python Versions

This is an advanced setup technique, but useful for juggling multiple installations of Python on
a single machine.  This is useful for testing code against multiple versions of Python.

There are several tools that facilitate this, but a popular and widely used one, is `pyenv`.

For macOS/Linux see: <https://github.com/pyenv/pyenv>

For Windows see: <https://github.com/pyenv-win/pyenv-win>

## Development Setup

### Create a virtual environment

All development is expected to be done in a virtual environment. This is a Python best practice.

In a shell, in the top-level directory of this project, run the following:

`python3 -m venv venv`

Note that if you are using Windows, you may need to use `python` instead of `python3`:

`python -m venv venv`

This should create a folder inside this project named `venv`. This is the _virtual environment_
for this project. This segregates libraries and their versions away from other Python projects
on your machine.

### Start the virtualenv

This will need to be done every time you open a shell to work on this project.

* In Windows Command Prompt: `$ .\venv\Scripts\activate.bat`
* In Powershell: `$ .\venv\Scripts\activate.ps1`
* In Bash/Z/fish: `$ source ./env/bin/activate[.fish]`

You can deactivate the virtualenv with:

* In Windows Command Prompt: `$ .\venv\Scripts\deactivate.bat`
* In Powershell: `$ .\venv\Scripts\deactivate.ps1`
* In Bash/Z/fish: `$ deactivate`

IDEs like VSCode and PyCharm can be configured to automatically activate the virtual environment
when you open the project.

### Install the required libraries

Once your virtual environment is activated, make sure you have all the required libraries for
this project. Run:

`pip install -r requirements.txt`

From here, you should be able to run the tests, build the project, and run the examples. For
example, try running the tests with: `pytest`.

## Suggested Development Tools

PyCharm is supported directly in this repository. One thing to note that you must clone the repo
in a way that preserves the lowercase name `py-hwlib` otherwise PyCharm will name your venv
internally as whatever you choose which will cause conflicts with other PyCharm developers.

VSCode is supported as well. The `.vscode` folder contains settings that should be used for this
project. You may need to install the [Python extension][1] for VSCode.

## Coding Style

Various linters are used in this project to enforce code quality. These are run in the Gitlab CI
pipeline and will fail if they find any issues. You can also run them locally to check your code
before committing.

### Linters

Static analysis is checked in our Gitlab pipelines using [Ruff][8] and [Markdown-lint][4] (the Ruby
one, not the JS one.) All `*.py` and `*.md` files are linted using these tools and your pipeline
will not pass if it contains any ["lint"][3]. Markdown-lint's configuration files are `.mldrc`
and `.mdl_style.rb`.

As mentioned, all Python code is linted using `ruff`. Its configuration is found in `pyproject.
toml`. It can be run locally as a pre-commit hook, see `pre-commit` described below.

Use Python [Type Hints][5] as much as possible. _"But, but, Python is not strongly typed!"_ That's
right, but type hints are a convenient way to document your code and make it more readable and
maintainable.

This is especially necessary in large code bases to find tricky bugs and maintainability. The type
checking tool `pyright` is listed among the dependencies of this project and is useful for
statically checking types. Its configuration is found in `pyproject. toml`.

### Code Formatting

[Black][7] is used in this project, which can auto-format code to match the style guidelines as
defined in the `pyproject.toml` file.

[isort](https://pycqa.github.io/isort/) is used to sort imports in the code.

## Python Code Health Metrics

There are two different packages that are used to get a snapshot of the code health of this repo.

* [Radon](https://pythonawesome.com/various-code-metrics-for-python-code):
  run by `radon cc .`
* [Xenon](https://github.com/rubik/xenon): run by `xenon --max-absolute C
  --max-modules B --max-average A .` where `A`, `B`, and `C` are the
  minimum "grades" allowed for this to pass. Xenon runs on every commit in
  Gitlab.

## Security Analysis

Run `bandit` to run static analysis security checks.

See [Bandit](https://bandit.readthedocs.io/en/latest/start.html) for more.

## Pre-commit Hooks

The python tool, [`pre-commit`][6] can be used to manage pre-commit hooks. This is not a
requirement and using `pre-commit` with TortoiseGit is challenging. However, it is nice to use
`pre-commit` to ensure that your code is formatted correctly before committing.

If `pre-commit` is installed, several jobs will run prior to committing, including ruff, black
and trailing whitespace removal. Your commit creation will fail if any changes are made by black or ruff
during this pre-commit stage. Typically, retrying the commit will succeed unless there are
manual changes required by Ruff.

## Automated Tests

Tests are nice to have for any new code. Write your code so that it facilitates testing!

The automated test framework used in this project is [PyTest](https://docs.pytest.org/)

These tests are ran in the Gitlab pipeline for every commit, if the tests fail you will not be
able to merge into `main` until they pass.

[1]: https://code.visualstudio.com/docs/languages/python
[2]: https://github.com/charliermarsh/ruff
[3]: https://en.wikipedia.org/wiki/Lint_(software)
[4]: https://github.com/markdownlint/markdownlint
[5]: https://docs.python.org/3/library/typing.html
[6]: https://pre-commit.com/
[7]: https://github.com/psf/black
[8]: https://github.com/astral-sh/ruff
