#!/opt/homebrew/bin/fish

function copy_files --argument destinationFolder
    # List of files to be copied
    set filesToCopy \
        ".gitlab" \
        ".gitattributes" \
        ".gitignore" \
        ".gitlab-ci.yml" \
        ".mdl_style.rb" \
        ".mdlrc" \
        ".pre-commit-config.yaml" \
        ".python-version" \
        "pyproject.toml" \
        "requirements.txt" \
        "CONTRIBUTING.md" \
        "LICENSE"

    # Source folder (current directory)
    set sourceFolder (pwd)

    # Check if destination folder exists, create if not
    if not test -d $destinationFolder
        mkdir -p $destinationFolder
    end

    # Copy each file or directory to the destination folder
    for item in $filesToCopy
        set sourcePath "$sourceFolder/$item"
        set destinationPath "$destinationFolder/$item"

        if test -e $sourcePath
            if test -d $sourcePath
                # If it is a directory, copy recursively
                cp -r $sourcePath $destinationPath
                echo "Copied directory $item to $destinationFolder"
            else
                # If it is a file, copy the file
                cp $sourcePath $destinationPath
                echo "Copied file $item to $destinationFolder"
            end
        else
            echo "Item $item not found in $sourceFolder"
        end
    end
end

# Check if the script is called with the required argument
if test (count $argv) -ne 1
    echo "Usage: $argv[0] <destinationFolder>"
    exit 1
end

copy_files $argv[1]
