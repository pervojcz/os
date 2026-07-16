import { createTaskGetter } from "~/utils/create-variant";

const FFMPEG_FREE_PACKAGES = [
  "fdk-aac-free",
  "ffmpeg-free",
  "libavcodec-free",
  "libavdevice-free",
  "libavfilter-free",
  "libavformat-free",
  "libpostproc-free",
  "libavutil-free",
  "libswresample-free",
  "libswscale-free",
] as const;

export const getCodecsTask = createTaskGetter(async (ctx) => {
  // RPM Fusion's Intel VA package conflicts with Fedora's split package on F44+.
  // Swapping it first keeps the nonfree repo enabled and makes later codec layering resolvable.
  if (await ctx.isPackageInstalled("libva-intel-media-driver")) {
    await ctx.replacePackages(
      ["libva-intel-media-driver"],
      ["intel-media-driver"],
    );
  }

  // uBlue NVIDIA images already ship full ffmpeg from RPM Fusion. Only swap the
  // Fedora ffmpeg-free stack when that base is actually present.
  if (await ctx.isPackageInstalled("ffmpeg-free")) {
    await ctx.replacePackages([...FFMPEG_FREE_PACKAGES], ["ffmpeg"]);
  }

  await ctx.installPackages(
    "gstreamer1-plugin-openh264",
    "gstreamer1-plugins-bad-free-extras",
    "gstreamer1-plugins-bad-free-fluidsynth",
    "gstreamer1-plugins-bad-free-wildmidi",
    "gstreamer1-plugins-bad-free-zbar",
    "gstreamer1-plugins-good-extras",
    "gstreamer1-plugins-good-gtk",
    "lame",
  );
});
