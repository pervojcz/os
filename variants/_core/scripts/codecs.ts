import { createTaskGetter } from "~/utils/create-variant";

export const getCodecsTask = createTaskGetter(async (ctx) => {
  // RPM Fusion's Intel VA package conflicts with Fedora's split package on F44+.
  // Swapping it first keeps the nonfree repo enabled and makes later codec layering resolvable.
  await ctx.replacePackages(
    ["libva-intel-media-driver"],
    ["intel-media-driver"],
  );

  await ctx.installPackages(
    "gstreamer1-plugin-libav",
    "gstreamer1-plugin-openh264",
    "gstreamer1-plugins-bad-free-extras",
    "gstreamer1-plugins-bad-freeworld",
    "gstreamer1-plugins-bad-free-fluidsynth",
    "gstreamer1-plugins-bad-free-wildmidi",
    "gstreamer1-plugins-bad-free-zbar",
    "gstreamer1-plugins-good-extras",
    "gstreamer1-plugins-good-gtk",
    "gstreamer1-plugins-ugly",
    "gstreamer1-vaapi",
    "libva-nvidia-driver",
    "lame",
  );
});
