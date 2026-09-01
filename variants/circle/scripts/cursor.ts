import tools from "~/tools";

export async function installCursor() {
  await tools.repos.addRepositoryFromString(
    "cursor.repo",
    `
      [cursor]
      name=Cursor
      baseurl=https://downloads.cursor.com/yumrepo
      enabled=1
      gpgcheck=1
      gpgkey=https://downloads.cursor.com/keys/anysphere.asc
      repo_gpgcheck=1
    `,
  );

  await tools.packages.installPackages("cursor");
}
