import { Command, Option } from "commander";
import { importOpenApi } from "../app/open-api-generator";
import { exit } from "process";
import * as logger from "../util/logger";
import * as context from "../app/context";

export const cmd = new Command("update")
  .description(
    "Import or Re-import OpenAPI Document into your Hasura project using the NDC Typescript Lambda Connector",
  )
  .addHelpText(
    "after",
    `
Further reading:
* https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#nodejs-lambda-connector
`,
  )
  .addOption(
    new Option(
      "--open-api <uri or filepath>",
      "URI or file path of OAS Document. Usually ${HASURA_CONFIGURATION_DIRECTORY}/swagger.json",
    )
      .default("./swagger.json")
      .env("NDC_OAS_DOCUMENT_URI"),
  )
  .addOption(
    new Option("--output-directory <directory>", "Output Directory")
      .default("./")
      .env("HASURA_CONFIGURATION_DIRECTORY"),
  )
  .addOption(
    new Option("-b --base-url <value>", "Base URL of the API")
      .env("NDC_OAS_BASE_URL")
      .argParser(headerParser), // TODO why??
  )
  .addOption(
    new Option(
      "-H --headers <key=value...>",
      "Headers to be included in the requests",
    )
      .env("NDC_OAS_HEADERS")
      .argParser(headerParser),
  )
  .addOption(
    new Option(
      "--overwrite [bool]",
      "Overwrite files if already present in the output directory.",
    )
      .default("false")
      .choices(["true", "false"])
      .preset("true")
      .env("NDC_OAS_FILE_OVERWRITE"),
  )

  .addOption(
    new Option(
      "--ndc-lambda-sdk <version>",
      "NDC Lambda SDK Version to be used by the SDK. Defaults to the latest version",
    ).env("NDC_LAMBDA_SDK_VERSION"),
  )

  .action((args, cmd) => {
    main(
      args.openApi,
      args.outputDirectory,
      args.overwrite === "true",
      args.headers,
      args.baseUrl,
      args.ndcLambdaSdk,
    );
  });

// convert the given array into the following format:
// key1=value1&key2=value2&key3=value3....
// because this is what the format is expected to be for the env var
function headerParser(value: string, previousValue: string[]): string[] {
  if (!value) {
    return [];
  }
  if (!previousValue) {
    return [value];
  }
  const joinedValue = `${value}&${previousValue.join("&")}`;
  return [joinedValue];
}

async function main(
  openApi: string,
  outputDir: string,
  overwrite: boolean,
  headers: string[],
  baseUrl: string | undefined,
  ndcLambdaSdk: string | undefined,
) {
  context.getInstance().setOverwriteFiles(overwrite);
  context.getInstance().setOpenApiUri(openApi);
  context.getInstance().setOutputDirectory(outputDir);

  try {
    await importOpenApi({
      headers: headers && headers.length > 0 ? headers[0] : undefined, // beacuse of headerParser(), the headers array can contain only 1 element,
      baseUrl: baseUrl,
      ndcLambdaSdkVersion: ndcLambdaSdk,
    });
  } catch (e) {
    logger.fatal(e);
    if (e instanceof Error) {
      console.log(e.message);
    }
    exit(1);
  }
}
