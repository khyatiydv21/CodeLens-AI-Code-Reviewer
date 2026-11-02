from urllib.parse import urlparse
import json
import urllib.request
import urllib.error


def get_github_files(repo_url):
    try:
        # Extract owner and repository name
        parts = repo_url.rstrip("/").split("/")

        if len(parts) < 2:
            raise ValueError("Invalid GitHub repository URL.")

        owner = parts[-2]
        repo = parts[-1].replace(".git", "")

        # Get repository information
        api_url = f"https://api.github.com/repos/{owner}/{repo}"

        request = urllib.request.Request(
            api_url,
            headers={"User-Agent": "CodeLens"}
        )

        with urllib.request.urlopen(request, timeout=15) as response:
            repo_data = json.loads(response.read())

        branch = repo_data["default_branch"]

        # Get repository file tree
        tree_url = (
            f"https://api.github.com/repos/{owner}/{repo}"
            f"/git/trees/{branch}?recursive=1"
        )

        request = urllib.request.Request(
            tree_url,
            headers={"User-Agent": "CodeLens"}
        )

        with urllib.request.urlopen(request, timeout=20) as response:
            tree_data = json.loads(response.read())

        allowed_extensions = (
            ".py", ".js", ".jsx", ".ts", ".tsx",
            ".cpp", ".c", ".h", ".java"
        )

        files = []

        for item in tree_data.get("tree", []):
            if (
                item["type"] == "blob"
                and item["path"].endswith(allowed_extensions)
                and item.get("size", 0) <= 100000
            ):
                files.append({
                    "name": item["path"],
                    "url": item["url"]
                })

        return files

    except urllib.error.HTTPError as e:
        raise Exception(f"GitHub API error: HTTP {e.code}")

    except urllib.error.URLError:
        raise Exception("Could not connect to GitHub.")

def get_file_content(file_url):
    try:
        parsed_url = urlparse(file_url)

        if (
            parsed_url.scheme != "https"
            or parsed_url.hostname != "api.github.com"
            or "/git/blobs/" not in parsed_url.path
        ):
            raise ValueError("Only GitHub blob URLs are allowed.")

        request = urllib.request.Request(
            file_url,
            headers={"User-Agent": "CodeLens"}
        )

        with urllib.request.urlopen(request, timeout=15) as response:
            file_data = json.loads(response.read())

        import base64

        content = base64.b64decode(
            file_data["content"]
        ).decode("utf-8")

        return content

    except Exception as e:
        raise Exception(f"Could not fetch file: {str(e)}")