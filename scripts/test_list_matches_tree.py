
# verify links in the html page and urls in the json file match

import json
from pathlib import Path
import re
import argparse


def test_list_matches_tree(list_path: Path, html_path: Path, files_path: Path = None):
    with open(list_path, "r") as f:
        data = json.load(f)

    urls_from_list = [item["url"] for item in data]
    with open(html_path, "r") as f:
        content = f.read()

    # get all links in the html page
    urls_from_html = re.findall(r"<a href=(.+?)>", content)

    # keep only those matching pattern https://lobis.github.io/gas-files/*.gas.json
    urls_from_html = [url for url in urls_from_html if url.startswith(
        "https://lobis.github.io/gas-files/") and url.endswith(".gas.json")]

    # check the number of files matches the files in files_path
    if files_path is not None:
        files = [file for file in files_path.iterdir() if file.suffix == ".gas"]
        print(len(files), len(urls_from_list), files)
        # assert len(files) == len(urls_from_list)

    # check that the number of links in the html page matches the number of urls in the json file
    assert len(urls_from_list) == len(urls_from_html)
    # check that the links in the html page match the urls in the json file
    assert set(urls_from_list) == set(urls_from_html)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("list_path", type=Path,
                        help="Path to json file with list of gas files")
    parser.add_argument("html_path", type=Path,
                        help="Path to html file with tree of gas files")
    # add optional argument that defaults to None
    parser.add_argument("--files_path", type=Path, default=None,)

    args = parser.parse_args()

    test_list_matches_tree(args.list_path, args.html_path, args.files_path)
