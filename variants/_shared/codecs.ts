import tools from "~/tools";

export async function installCodecs() {
  await tools.packages.installPackages(
    "gstreamer1-plugin-openh264",
    "gstreamer1-plugins-good-extras",
    "gstreamer1-plugins-good-gtk",
    "lame",
  );
}
