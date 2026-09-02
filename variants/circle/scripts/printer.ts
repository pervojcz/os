import { $ } from "bun";
import { join } from "node:path";
import tools from "~/tools";

export async function installPrinterDrivers() {
  // printer driver
  const outDir = "/usr/share/ppd/OKI";
  const tmpDir = await tools.files.createTmpDir("printer-drivers");
  const ppdFilesZip = join(tmpDir, "ppd-files.zip");

  await tools.download.downloadFile(
    "https://www.oki.com/printing/download/MC573_MC563_MC363_C843_C833_C712_C612_C542_C532_C332_PS_Linux_010102_300730.zip",
    ppdFilesZip,
  );
  await $`unzip -o ${ppdFilesZip} -d ${tmpDir}`;

  await $`mkdir -p ${outDir}`;
  await $`chmod 755 ${outDir}`;

  const ppdFiles = await tools.files.list(
    tmpDir,
    (f) => /\.ppd(\.gz)?$/.test(f),
    true,
  );
  await $`cp -r ${ppdFiles} ${outDir}`;
  await $`chmod 644 ${outDir}/*`;

  // scanner driver
  const scannerDriverRpm = join(tmpDir, "okimfpsdrv.rpm");
  await tools.download.downloadFile(
    "https://www.oki.com/eu/printing/download/okimfpsdrv-1.7-0.x86_64_231228.rpm",
    scannerDriverRpm,
  );
  await tools.packages.installPackages(scannerDriverRpm);
}
