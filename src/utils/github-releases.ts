export async function listReleases(repo: `${string}/${string}`) {
  const res = await fetch(`https://api.github.com/repos/${repo}/releases`);
  const data = await res.json();

  return data as {
    id: number;
    tag_name: string;
    name: string;
    published_at: string;
  }[];
}


export async function getReleaseAssets(
  repo: `${string}/${string}`,
  version: "latest" | number | `tags/${string}` = "latest"
) {
  const res = await fetch(
    `https://api.github.com/repos/${repo}/releases/${version}`
  );
  const data = await res.json();

  return (
    data.assets as {
      name: string;
      browser_download_url: string;
    }[]
  ).map((a) => ({
    name: a.name,
    url: a.browser_download_url,
  }));
}
