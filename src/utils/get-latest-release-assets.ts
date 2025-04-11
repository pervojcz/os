export async function getLatestReleaseAssets(repo: `${string}/${string}`) {
  const res = await fetch(
    `https://api.github.com/repos/${repo}/releases/latest`
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
