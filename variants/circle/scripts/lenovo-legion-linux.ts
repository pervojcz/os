import { $ } from "bun";
import { createTaskGetter } from "~/utils/create-variant";

export const getLenovoLegionLinuxTask = createTaskGetter(async (ctx) => {
  await ctx.addRepositoryFromCopr("mrduarte/LenovoLegionLinux");
  await ctx.installPackages(
    "dkms-LenovoLegionLinux",
    "python-LenovoLegionLinux",
  );

  await $`cp -r /usr/share/legion_linux /etc/legion_linux`;
  await $`systemctl enable legiond`;
});
