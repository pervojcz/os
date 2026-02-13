import { $ } from "bun";
import { readFile, writeFile } from "fs/promises";
import { createTaskGetter } from "~/utils/create-variant";

type ConfigOptions = "none" | "check" | "stage" | "apply";

export const getAutoUpdatesTask = createTaskGetter(
  async (ctx, configValue: ConfigOptions = "stage") => {
    const configFile = "/etc/rpm-ostreed.conf";
    const content = await readFile(configFile, "utf-8");

    const updatedContent = content.replace(
      /\#?AutomaticUpdatePolicy\=.*\n/,
      `AutomaticUpdatePolicy=${configValue}\n`,
    );
    await writeFile(configFile, updatedContent, "utf-8");

    await $`systemctl enable rpm-ostreed-automatic.timer`;
  },
);
