import { createTaskGetter } from "~/utils/create-variant";

export const getCodecsTask = createTaskGetter(async (ctx) => {
  await ctx.replacePackages(
    [
      "ffmpeg-free",
      "libavcodec-free",
      "libavdevice-free",
      "libavfilter-free",
      "libavformat-free",
      "libavutil-free",
      "libpostproc-free",
      "libswresample-free",
      "libswscale-free",
    ],
    ["ffmpeg"],
  );

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
