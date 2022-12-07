
# generate a json file listing all gas files

from pathlib import Path
import json
import argparse


def parse_gas_json(path: Path) -> dict:
    print(path)
    with open(path, "r") as f:
        data = json.load(f)
        return dict(
            components=data["components"],
            name=data["name"],
            pressure=data["pressure"],
            temperature=data["temperature"],
            url=f"""https://lobis.github.io/gas-files/{path.as_posix()}"""
        )


def generate_file_list(path: Path):
    file_list = []
    # loop over all files in the directory with glob
    for item in path.glob("**/*"):
        if item.is_dir():
            continue

        # only show files with .gas extension (and related)
        if not item.name.endswith(".gas.json"):
            continue

        file_list.append(parse_gas_json(item))

    return file_list


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("root_dir", type=Path,
                        help="Root directory to scan for gas files")
    parser.add_argument("output", type=Path,
                        help="Path to output file")
    args = parser.parse_args()

    file_list = generate_file_list(args.root_dir)

    with open(args.output, "w") as f:
        json.dump(file_list, f, indent=4)
