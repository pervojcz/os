import { $ } from "bun";
import tools from "~/tools";

export async function setupBitwardenPolkitPolicy() {
  // https://bitwarden.com/help/biometrics/#panel-tab-linux-2vCWb5iFg4OqKS0B2xXpqW
  const polkitPolicy = {
    url: "https://raw.githubusercontent.com/bitwarden/clients/main/apps/desktop/resources/com.bitwarden.desktop.policy",
    file: "/usr/share/polkit-1/actions/com.bitwarden.Bitwarden.policy",
  };
  await tools.download.downloadFile(polkitPolicy.url, polkitPolicy.file);
  await $`chown root:root ${polkitPolicy.file}`;
  await $`chcon system_u:object_r:usr_t:s0 ${polkitPolicy.file}`;
}
