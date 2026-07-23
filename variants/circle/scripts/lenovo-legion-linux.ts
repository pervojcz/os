import { $ } from "bun";
import { join } from "path";
import { createTaskGetter } from "~/utils/create-variant";

export const getLenovoLegionLinuxTask = createTaskGetter(async (ctx) => {
  // Official COPR: https://copr.fedorainfracloud.org/coprs/mrduarte/LenovoLegionLinux/
  // python-LenovoLegionLinux is still built for Python 3.13 and fails on Fedora 44
  // (Python 3.14), so only the DKMS package comes from COPR; userspace is built
  // from the upstream release tag.
  //
  // Do not install gcc/make from live repos here: the nvidia base pins an older
  // toolchain via Koji (see build-essentials).
  await ctx.addRepositoryFromCopr("mrduarte/LenovoLegionLinux");
  await ctx.installPackages(
    "dkms-LenovoLegionLinux",
    "python3-build",
    "python3-setuptools",
    "python3-wheel",
    "python3-pyqt6",
    "python3-pyyaml",
    "python3-argcomplete",
    "python3-pip",
    "inih-devel",
    "git",
    "dmidecode",
    "lm_sensors",
  );

  const repoDir = join(ctx.getTempDir("lenovo-legion-linux"), "src");
  await $`git clone --depth 1 --branch v0.0.20 https://github.com/johnfanv2/LenovoLegionLinux.git ${repoDir}`;

  // darkdetect is not packaged on Fedora 44; use pip for that dependency only.
  await $`pip3 install --prefix=/usr --root-user-action=ignore darkdetect`;

  const pythonDir = join(repoDir, "python", "legion_linux");
  await $`sed -i 's/version = _VERSION/version = 0.0.20/g' ${join(pythonDir, "setup.cfg")}`;
  await $`python3 -m build --wheel --no-isolation`.cwd(pythonDir);
  // --no-deps keeps system PyQt6/PyYAML; --prefix=/usr avoids /usr/local.
  await $`pip3 install --prefix=/usr --no-deps --root-user-action=ignore ${join(pythonDir, "dist", "legion_linux-0.0.20-py3-none-any.whl")}`;

  const legiondDir = join(repoDir, "extra", "service", "legiond");
  // GCC 14+ rejects the upstream timer callback signature.
  await $`sed -i 's/void timer_handler()/void timer_handler(union sigval sv)/' ${join(legiondDir, "legiond.c")}`;
  await $`make CC=gcc`.cwd(legiondDir);
  await $`install -Dm755 ${join(legiondDir, "legiond")} /usr/bin/legiond`;
  await $`install -Dm755 ${join(legiondDir, "legiond-ctl")} /usr/bin/legiond-ctl`;

  const serviceDir = join(repoDir, "extra", "service");
  await $`install -Dm644 ${join(serviceDir, "legiond.service")} /usr/lib/systemd/system/legiond.service`;
  await $`install -Dm644 ${join(serviceDir, "legiond-onresume.service")} /usr/lib/systemd/system/legiond-onresume.service`;

  await $`cp -a /usr/share/legion_linux /etc/legion_linux`;
  await $`systemctl enable legiond`;
});
