import { $ } from "bun";
import { createTaskGetter } from "~/utils/create-variant";

export const getDockerTask = createTaskGetter(async (ctx) => {
  await ctx.addRepositoryFromUrl(
    "https://download.docker.com/linux/fedora/docker-ce.repo",
  );

  await ctx.installPackages(
    "docker-ce",
    "docker-ce-cli",
    "containerd.io",
    "docker-buildx-plugin",
    "docker-compose-plugin",
  );

  await $`systemctl enable docker`;
});
