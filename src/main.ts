import { ArgumentParser } from "argparse";
import { generateContainerfile } from "./commands/generate-containerfile";
import { listVariants } from "./commands/list-variants";
import { runBuilder } from "./commands/run-builder";

const parser = new ArgumentParser({
  description: "OS builder tool for bootc images",
});

const subparsers = parser.add_subparsers({
  title: "subcommands",
  dest: "subcommand",
  required: true,
});

subparsers.add_parser("list-variants", {
  help: "list all available variants",
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

const args = parser.parse_args();

switch (args.subcommand) {
  case "list-variants":
    await listVariants();
    break;
  case "run-builder":
    await runBuilder(args.variant);
    break;
  case "generate-containerfile":
    await generateContainerfile(args.variant, args.image_registry);
    break;
  default:
    parser.print_help();
    process.exit(1);
}
