import { $ } from "bun";
import { writeFile } from "node:fs/promises";
import tools from "~/tools";

export async function setupCompositor() {
  await tools.packages.installPackages("cage", "gtk4", "gjs");

  const defaultScriptPath = "/usr/bin/kiosk-launcher";
  await writeFile(
    defaultScriptPath,
    `
    #!/usr/bin/env gjs

import GObject from "gi://GObject";
import Gtk from "gi://Gtk?version=4.0";

class App extends Gtk.Application {
  static {
    GObject.registerClass(this);
  }

  constructor() {
    super({ "application-id": "org.example.kioskapp" });
  }

  vfunc_activate() {
    const window = new Gtk.ApplicationWindow({ application: this });
    window.decorated = false;
    window.fullscreened = true;

    const label = new Gtk.Label({ label: "Hello World!" });
    window.child = label;

    window.present();
  }
}

new App().run([]);
`.trim(),
  );
  await $`chmod +x ${defaultScriptPath}`;

  // https://github.com/graysky2/kodi-standalone-service/blob/master/x86/init/tmpfiles.conf
  await writeFile(
    "/usr/lib/tmpfiles.d/cage.conf",
    `
# Type Path Mode User Group Age Argument
d /var/lib/cage 0750 cage cage - -
Z /var/lib/cage - cage cage - -
`.trim(),
  );
  await $`systemd-tmpfiles --create`;

  // https://github.com/graysky2/kodi-standalone-service/blob/master/x86/init/sysusers.conf
  await writeFile(
    "/usr/lib/sysusers.d/cage.conf",
    `
    # override these settings by copying this to /etc/sysusers.d/ and modifying it therein

    # Type Name ID GECOS Home directory Shell
    u cage - "Cage User" /var/lib/cage
    `.trim(),
  );
  await $`systemd-sysusers`;

  // https://github.com/cage-kiosk/cage/wiki/Starting-Cage-on-boot-with-systemd
  await writeFile(
    "/usr/lib/systemd/system/cage@.service",
    `
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
ExecStart=/usr/bin/cage -s -- ${defaultScriptPath}
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
`.trim(),
  );

  // https://github.com/cage-kiosk/cage/wiki/Starting-Cage-on-boot-with-systemd
  await writeFile(
    "/usr/lib/pam.d/cage",
    `
auth           required        pam_unix.so nullok
account        required        pam_unix.so
session        required        pam_unix.so
session        required        pam_systemd.so
`.trim(),
  );

  await $`systemctl enable cage@.service`;
  await $`systemctl set-default graphical.target`;
}
