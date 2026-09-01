export function getGitHubVariables() {
  return {
    repo: process.env.GH_REPO,
    commitSha: process.env.GITHUB_SHA?.slice(0, 7),
    refType: process.env.GH_REF_TYPE,
    refName: process.env.GH_REF_NAME ?? "main",
    prId: process.env.GH_PR,
  };
}
