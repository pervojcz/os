import { ArgumentParser } from "argparse";
import { generateContainerfile } from "./commands/generate-containerfile";
import { getBaseImage } from "./commands/get-base-image";
import { listVariants } from "./commands/list-variants";
import { runBuilder } from "./commands/run-builder";

const parser = new ArgumentParser({
  description: "OS builder tool for bootc images",
});

parser.add_argument("-n", "--nvidia", {
  help: "install NVIDIA drivers for the variant",
  action: "store_true",
});

const subparsers = parser.add_subparsers({
  title: "subcommands",
  dest: "subcommand",
  required: true,
});

subparsers.add_parser("list-variants", {
  help: "list all available variants",
});

const getBaseImageParser = subparsers.add_parser("get-base-image", {
  help: "get the base image for a specific variant",
});

getBaseImageParser.add_argument("variant", {
  help: "the variant to get the base image for",
});

const runBuilderParser = subparsers.add_parser("run-builder", {
  help: "run the builder for a specific variant",
});

runBuilderParser.add_argument("variant", {
  help: "the variant to build",
});

const containerfileParser = subparsers.add_parser("generate-containerfile", {
  help: "generate a containerfile for a specific variant",
});

containerfileParser.add_argument("variant", {
  help: "the variant to generate the containerfile for",
});

containerfileParser.add_argument("-r", "--image-registry", {
  help: "the image registry to use for the generated containerfile",
  nargs: "?",
});

containerfileParser.add_argument("-d", "--image-digest", {
  help: "the digest of the built image to base nvidia version of",
  nargs: "?",
});

const args = parser.parse_args();

switch (args.subcommand) {
  case "list-variants":
    await listVariants(args);
    break;
  case "get-base-image":
    await getBaseImage(args);
    break;
  case "run-builder":
    await runBuilder(args);
    break;
  case "generate-containerfile":
    await generateContainerfile(args);
    break;
  default:
    parser.print_help();
    process.exit(1);
}
