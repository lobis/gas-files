# uncompress the *.gas.tar.gz files in the 'files' directory while keeping them inplace

import os
import sys
from pathlib import Path


def uncompress_gas_files():
    # location of this script
    script_dir = Path(__file__).parent.absolute()

    # location of files directory
    files_dir = (script_dir / "../files").resolve()

    os.chdir(files_dir)

    # iterate over all files including subdirectories
    files = [file for file in files_dir.rglob("*") if file.is_file()]

    # only .tar.gz files should be present
    for file in files:
        if not str(file).endswith(".gas.tar.gz"):
            print("Unexpected file found: " + file.name)
            sys.exit(1)

    print(f"Found {len(files)} files to uncompress")

    # cd into subdiretory and uncompress
    for file in files:
        os.chdir(file.parent)
        os.system("tar -xzf " + file.name)


if __name__ == "__main__":
    uncompress_gas_files()
