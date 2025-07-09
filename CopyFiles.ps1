param (
    [Parameter(Mandatory=$true)]
    [string]$destinationFolder
)

# List of files to be copied
$filesToCopy = @(
    ".gitlab",
    ".gitattributes",
    ".gitignore",
    ".gitlab-ci.yml",
    ".mdl_style.rb",
    ".mdlrc",
    ".pre-commit-config.yaml",
    ".python-version",
    "pyproject.toml",
    "requirements.txt",
    "CONTRIBUTING.md",
    "LICENSE"
)

# Source folder (current directory)
$sourceFolder = Get-Location

# Check if destination folder exists, create if not
if (-Not (Test-Path -Path $destinationFolder)) {
    New-Item -ItemType Directory -Path $destinationFolder
}

# Copy each file or directory to the destination folder
foreach ($item in $filesToCopy) {
    $sourcePath = Join-Path -Path $sourceFolder -ChildPath $item
    $destinationPath = Join-Path -Path $destinationFolder -ChildPath $item

    if (Test-Path -Path $sourcePath) {
        if ((Get-Item -Path $sourcePath).PSIsContainer) {
            # If it is a directory, copy recursively
            Copy-Item -Path $sourcePath -Destination $destinationPath -Recurse -Force
            Write-Output "Copied directory $item to $destinationFolder"
        } else {
            # If it is a file, copy the file
            Copy-Item -Path $sourcePath -Destination $destinationPath -Force
            Write-Output "Copied file $item to $destinationFolder"
        }
    } else {
        Write-Output "Item $item not found in $sourceFolder"
    }
}
