import tools from "~/tools";

export async function installFonts() {
  await Promise.all([
    tools.fonts.installGoogleFont("inter"),
    tools.fonts.installGoogleFont("geist"),
    tools.fonts.installGoogleFont("geist-mono"),
    tools.fonts.installGoogleFont("kanit"),
  ]);

  await tools.packages.installPackages("twitter-twemoji-fonts");
}
