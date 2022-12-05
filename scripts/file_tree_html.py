
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
                f"<li>{item}<ul>{generate_html_list(Path(item_path))}</ul></li>")
        else:
            # only show files with .gas extension (and related)
            if not item.endswith(".gas") and not item.endswith(".gas.json"):
                continue

            # replace the root directory with the url of the github pages site
            list_items_html.append(
                f"""<li><a href={"https://lobis.github.io/gas-files/" + "/".join(path.as_posix().split("/")[1:]) + "/" + item}>{item}</a></li>"""
            )

    return "<ul>" + "".join(list_items_html).replace("<ul></ul>", "") + "</ul>"


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("root_dir", type=Path,
                        help="Root directory to generate the tree for")
    args = parser.parse_args()

    tree = generate_html_list(args.root_dir)

    # insert the tree into index.html
    index_html_path = Path(__file__).parent.parent / "public" / "index.html"
    with open(index_html_path, "r") as f:
        content = f.read()
        to_replace = "<div id=\"tree\"></div>"
        if content.count(to_replace) != 1:
            raise Exception("Unexpected number of matches")
        content = content.replace(
            to_replace, f"<div id=\"tree\">{tree}</div>")
    with open(index_html_path, "w") as f:
        f.write(content)
