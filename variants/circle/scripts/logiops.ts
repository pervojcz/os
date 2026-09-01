import { $ } from "bun";
import { writeFile } from "node:fs/promises";
import tools from "~/tools";

export async function installLogiops() {
  await tools.packages.installPackages("logiops");
  await $`systemctl enable logid`;

  await writeFile("/etc/logid.cfg", config, "utf-8");
  await $`chmod 644 /etc/logid.cfg`;
}

const config = `
# https://medium.com/@Tal-Hason/living-with-a-logitech-mx-master-3-mouse-on-my-fedora-os-6e49a4662b5e
# https://github.com/PixlOne/logiops/issues/164

devices: (
  {
    name: "MX Keys S";
    buttons: (
      {
        # Screen Shot
        cid: 0x10a;
        action = {
          type: "Keypress";
          keys: ["KEY_PRINT"];
          # normal print screen
        };
      },
      {
        # App Menu / Scroll Lock
        cid: 0xea;
        action = {
          type: "Keypress";
          keys: ["KEY_SCROLLLOCK"];
          # compose key
        };
      },
      {
        # Turn Off Microphone
        cid: 0x11c;
        action = {
          type: "Keypress";
          keys: ["KEY_MICMUTE"];
          # mute microphone
        };
      },
      {
        # Emoji Key
        cid: 0x108;
        action = {
          type: "None";
        };
      },
      {
        # Loud Speak
        cid: 0x103;
        action = {
          type: "None";
        };
      },
    );
  },

  {
    name: "MX Master 3S";
    buttons: (
      {
        # Gesture Button
        cid: 0xc3;
        action = {
          type: "Gestures";
          gestures: (
            {
              direction: "Left";
              mode: "OnRelease";
              action = {
                type: "Keypress";
                keys: ["KEY_LEFTMETA", "KEY_PAGEDOWN"];
                # switch one workspace left
              };
            },
            {
              direction: "Right";
              mode: "OnRelease";
              action = {
                type: "Keypress";
                keys: ["KEY_LEFTMETA", "KEY_PAGEUP"];
                # switch one workspace right
              };
            },
            {
              direction: "Up";
              mode: "OnRelease";
              action = {
                type: "Keypress";
                keys: ["KEY_LEFTMETA", "KEY_A"];
                # show all apps
              };
            },
            {
              direction: "Down";
              mode: "OnRelease";
              action = {
                type: "Keypress";
                keys: ["KEY_LEFTMETA", "KEY_V"];
                # show notifications menu
              };
            },
            {
              direction: "None";
              mode: "OnRelease";
              action = {
                type: "Keypress";
                keys: ["KEY_LEFTMETA"];
                # open activities screen
              };
            },
          );
        };
      },
    );
  },
);
`.trim();
