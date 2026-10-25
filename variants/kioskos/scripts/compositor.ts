import { $ } from "bun";
import { writeFile } from "node:fs/promises";
import tools from "~/tools";

export async function setupCompositor() {
  const defaultCommand = "/usr/bin/gtk4-widget-factory";

  await tools.packages.installPackages(
    "cage",
    "gtk4-devel-tools", // temporarily installed to run gtk4-widget-factory
  );

  // https://github.com/graysky2/kodi-standalone-service/blob/master/x86/init/tmpfiles.conf
  const tmpfilesContent = `
# Type Path Mode User Group Age Argument
d /var/lib/cage 0750 cage cage - -
Z /var/lib/cage - cage cage - -
`.trim();

  // https://github.com/graysky2/kodi-standalone-service/blob/master/x86/init/sysusers.conf
  const sysusersContent = `
# override these settings by copying this to /etc/sysusers.d/ and modifying it therein

# Type Name ID GECOS Home directory Shell
u cage - "Cage User" /var/lib/cage
`.trim();

  // https://github.com/cage-kiosk/cage/wiki/Starting-Cage-on-boot-with-systemd
  const serviceContent = `
# This is a system unit for launching Cage with auto-login as the
# user configured here. For this to work, wlroots must be built
# with systemd logind support.

[Unit]
Description=Cage Wayland compositor on %I
# Make sure we are started after logins are permitted. If Plymouth is
# used, we want to start when it is on its way out.
After=systemd-user-sessions.service plymouth-quit-wait.service
# Since we are part of the graphical session, make sure we are started
# before it is complete.
Before=graphical.target
# On systems without virtual consoles, do not start.
ConditionPathExists=/dev/tty0
# D-Bus is necessary for contacting logind, which is required.
Wants=dbus.socket systemd-logind.service
After=dbus.socket systemd-logind.service
# Replace any (a)getty that may have spawned, since we log in
# automatically.
Conflicts=getty@%i.service
After=getty@%i.service

[Service]
Type=simple
ExecStart=/usr/bin/cage ${defaultCommand}
ExecStartPost=+sh -c "tty_name='%i'; exec chvt $\${tty_name#tty}"
Restart=always
User=cage
# Log this user with utmp, letting it show up with commands 'w' and
# 'who'. This is needed since we replace (a)getty.
UtmpIdentifier=%I
UtmpMode=user
# A virtual terminal is needed.
TTYPath=/dev/%I
TTYReset=yes
TTYVHangup=yes
TTYVTDisallocate=yes
# Fail to start if not controlling the virtual terminal.
StandardInput=tty-fail

# Set up a full (custom) user session for the user, required by Cage.
PAMName=cage

[Install]
WantedBy=graphical.target
#Alias=display-manager.service
DefaultInstance=tty7
`.trim();

  // https://github.com/cage-kiosk/cage/wiki/Starting-Cage-on-boot-with-systemd
  const pamContent = `
auth           required        pam_unix.so nullok
account        required        pam_unix.so
session        required        pam_unix.so
session        required        pam_systemd.so
`.trim();

  await writeFile("/usr/lib/tmpfiles.d/cage.conf", tmpfilesContent);
  await writeFile("/usr/lib/sysusers.d/cage.conf", sysusersContent);
  await writeFile("/usr/lib/systemd/system/cage@.service", serviceContent);
  await writeFile("/usr/lib/pam.d/cage", pamContent);

  await $`systemd-sysusers`;
  await $`systemd-tmpfiles --create`;

  await $`systemctl enable cage@tty1.service`;
  await $`systemctl set-default graphical.target`;
}
