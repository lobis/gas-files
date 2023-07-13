# Generate a html file tree from a directory

import os
from pathlib import Path
import argparse


def generate_html_list(path: Path):
    list_items_html = []

    for item in sorted(os.listdir(path)):
        item_path = os.path.join(path, item)

        if os.path.isdir(item_path):
            list_items_html.append(
                f"<li class=directory><details closed><summary>{item}</summary>{generate_html_list(Path(item_path))}</details></li>"
            )
        else:
            # only show files with .gas extension (and related)
            if not item.endswith(".gas") and not item.endswith(".gas.json"):
                # continue
                pass

            # get extension of file
            extension = item.split(".")[-1]
            # replace the root directory with the url of the github pages site
            list_items_html.append(
                f"""<li class="file file-{extension}"><a href={"https://lobis.github.io/gas-files/" + "/".join(path.as_posix().split("/")[1:]) + "/" + item}>{item}</a></li>"""
            )

    return "<ul>" + "".join(list_items_html).replace("<ul></ul>", "") + "</ul>"


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "root_dir", type=Path, help="Root directory to generate the tree for"
    )
    parser.add_argument("output", type=Path, help="Path to output file")

    args = parser.parse_args()

    tree = generate_html_list(args.root_dir)

    # open the first <details> tag
    tree = tree.replace("<details closed>", "<details open>", 1)

    index_html_path = args.output
    with open(index_html_path, "r") as f:
        content = f.read()
        to_replace = '<div id="tree"></div>'
        if content.count(to_replace) != 1:
            raise Exception("Unexpected number of matches")
        content = content.replace(to_replace, f'<div id="tree">{tree}</div>')
    with open(index_html_path, "w") as f:
        f.write(content)
