import * as path from "path";
import { ApiComponents } from "./api-generator";
import { ParsedApiRoutes } from "./parsedApiRoutes";
import { Eta } from "eta";
import { getTemplatesDirectory } from "./index";
import * as prettier from "prettier";

const CircularJSON = require("circular-json");

let templateDir: string; // cannot be a constant because calling `getTemplateDirectory` results in a compilation error
const templateFile = "functions.ejs";

/**
 *
 * @param apiComponents
 * @param headers Expected to be in format: key1=value1&key2=value2&key3=value3...
 * @returns
 */
export async function generateFunctionsTypescriptFile(
  apiComponents: ApiComponents,
  headers: string | undefined,
  baseUrl: string | undefined,
): Promise<string> {
  templateDir = path.resolve(getTemplatesDirectory(), "./functions");

  const parseApiRoutes = new ParsedApiRoutes(
    new Set<string>(apiComponents.getTypeNames()),
    apiComponents,
  );

  for (let route of apiComponents.routes) {
    parseApiRoutes.parse(route);
  }

  const headerMap = parseHeaders(headers);

  const eta = new Eta({ views: templateDir });
  let fileStr = eta.render(templateFile, {
    apiRoutes: parseApiRoutes.getApiRoutes(),
    importList: parseApiRoutes.getImportList(),
    baseUrl: baseUrl ? baseUrl : "",
    headerMap: headerMap,
  });
  fileStr = await prettier.format(fileStr, {
    parser: "typescript",
  }); // correctly format the generated file string
  return fileStr;
}

function parseHeaders(headerStr: string | undefined): Map<string, string> {
  const headerMap = new Map<string, string>();
  if (!headerStr) {
    return headerMap;
  }
  for (let h of headerStr.split("&")) {
    const splitStr = h.split("=");
    const key = `${splitStr[0]}`;
    const value = splitStr.slice(1, splitStr.length).join("=");
    headerMap.set(key, value);
  }
  return headerMap;
}
