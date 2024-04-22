/**
 * import ParsedRoute from swagger-typescript-api
 * 
 * Should be looking at ParsedRoute.queryObjectSchema
 * Correctly pre-rendered types can be used from ParsedRoute.specificArgs
 * **** RESPONSIBILITES ****
 * 1. Correctly parse `ParsedRoute.routeParams`
 * 2. Correctly parse `ParsedRoute.requestBodyInfo`
 * 3. Render the arguments of a function
 * 4. Render the argument mapping in the function API function call
 * 
 * This file contains functions that can take the following objects as input and parse them correctly
 * Individual object documentation is provided below with some examples
 * Please note that the examples provided should contain a set of variables with as wide as a dataset possible
 * 
 * ParsedRoute.routeParams
 *   - routeParams.path: Contains the path variables
 *     example: [{"description":"The ID of a project","in":"path","name":"id","required":true,"schema":{"type":"string","$parsed":{"type":"primitive","$schemaPath":["PutV3ProjectsIdParams",null],"$parsedSchema":true,"schemaType":"primitive","typeIdentifier":"type","name":null,"description":"","content":"string"}},"type":"string"}]
 * 
 *   - routeParams.formData
 *     example: [{"description":"The name of the project","in":"formData","name":"name","required":false,"type":"string"},{"description":"The default branch of the project","in":"formData","name":"default_branch","required":false,"type":"string"},{"description":"The path of the repository","in":"formData","name":"path","required":false,"type":"string"},{"description":"The description of the project","in":"formData","name":"description","required":false,"type":"string"},{"description":"Flag indication if the issue tracker is enabled","in":"formData","name":"issues_enabled","required":false,"type":"boolean"},{"description":"Flag indication if merge requests are enabled","in":"formData","name":"merge_requests_enabled","required":false,"type":"boolean"},{"description":"Flag indication if the wiki is enabled","in":"formData","name":"wiki_enabled","required":false,"type":"boolean"},{"description":"Flag indication if builds are enabled","in":"formData","name":"builds_enabled","required":false,"type":"boolean"},{"description":"Flag indication if snippets are enabled","in":"formData","name":"snippets_enabled","required":false,"type":"boolean"},{"description":"Flag indication if shared runners are enabled for that project","in":"formData","name":"shared_runners_enabled","required":false,"type":"boolean"},{"description":"Flag indication if the container registry is enabled for that project","in":"formData","name":"container_registry_enabled","required":false,"type":"boolean"},{"description":"Flag indication if Git LFS is enabled for that project","in":"formData","name":"lfs_enabled","required":false,"type":"boolean"},{"description":"Create a public project. The same as visibility_level = 20.","in":"formData","name":"public","required":false,"type":"boolean"},{"description":"Create a public project. The same as visibility_level = 20.","enum":[0,10,20],"format":"int32","in":"formData","name":"visibility_level","required":false,"type":"integer"},{"description":"Perform public builds","in":"formData","name":"public_builds","required":false,"type":"boolean"},{"description":"Allow users to request member access","in":"formData","name":"request_access_enabled","required":false,"type":"boolean"},{"description":"Only allow to merge if builds succeed","in":"formData","name":"only_allow_merge_if_build_succeeds","required":false,"type":"boolean"},{"description":"Only allow to merge if all discussions are resolved","in":"formData","name":"only_allow_merge_if_all_discussions_are_resolved","required":false,"type":"boolean"}]
 * 
 * ParsedRoute.requestBodyInfo
 */

import path from "path"
import { getTemplatesDirectory } from ".."
import { Eta } from "eta"
const CircularJSON = require("circular-json");

export type Schema = {
  description?: string,
  name?: string,
  in?: string,
  required?: boolean,
  schema?: Schema,
  $parsed?: Schema,
  enum?: number[] | string[] | any[]
  type: string,
  properties?: Record<string, Schema>,
  rendered?: string, // contains the rendered string for this schema node
}

export type SpecificArgsObject = {
  name?: string, // name of the variable
  optional: boolean,
  type: string, // the string representation of all args
  tsArgName?: string,
}

// represents `ParsedRoute.specificArgs`
export type SpecificArgs = {
  body?: SpecificArgsObject,
  pathParams?: SpecificArgsObject,
}

// export type ParsedType = {
//   requiresRelaxedTypeAnnotation: boolean,
//   specificArgs: SpecificArgs,
//   functionArgsRendered: string,
//   functionArgsMappingRendered: string,
// }

export type ParsedTypes = {
  apiMethod: string,
  apiRoute: string,
  queryParams: Schema | undefined;
}

/**
 * 
 * @param routeParams : ParsedRoute.routeParams
 * routeParams contains:
 * path[], header[], body[], query[], formData[], cookie[],
 * 
 * `formData` represents request body data, if the content type is `application/x-www-form-urlencoded`
 * Otherwise, in case of content type being `application/json`, request body data is contained in `ParsedRoute.requestBodyInfo`
 * 
 * **** EXAMPLES ****
 * path[]: 
  [
    {
      "description": "delete author",
      "name": "authorId",
      "in": "path",
      "required": true,
      "schema": {
        "type": "string",
        "$parsed": {
          "type": "primitive",
          "$schemaPath": [
            "AuthorDeleteParams",
            null
          ],
          "$parsedSchema": true,
          "schemaType": "primitive",
          "typeIdentifier": "type",
          "name": null,
          "description": "",
          "content": "string"
        }
      },
      "type": "string"
    }
  ]

 * query[]
  [
    {
      "description": "blog to dislike",
      "name": "blogId",
      "in": "query",
      "required": true,
      "schema": {
        "type": "string"
      },
      "type": "string"
    }
  ] 

  * formData[]:
[
  {
    "description": "The default branch of the project",
    "in": "formData",
    "name": "default_branch",  // name of the variable
    "required": false,
    "type": "string" // data type
  },
  {
    "description": "Flag indication if the issue tracker is enabled",
    "in": "formData",
    "name": "issues_enabled",
    "required": false,
    "type": "boolean"
  },
  {
    "description": "Create a public project. The same as visibility_level = 20.",
    "enum": [
      0,
      10,
      20
    ],
    "format": "int32",
    "in": "formData",
    "name": "visibility_level",
    "required": false,
    "type": "integer"
  },
]
 */
export function routeParamsParser(routeParams: any) {
    /* routeParams */
}

/**
 * 
 * @param routeData the route data the is passed in the `onCreateRoute()` hook of `generateApi()`
 */
export function parse(routeData: any): ParsedTypes {
  // const specificArgs = parseSpecificArgs(routeData.specificArgs as SpecificArgs)

  // console.log(`\n\n\nRouteParams ${routeData.raw.method} ${routeData.raw.route}: ${CircularJSON.stringify(routeData.routeParams)}`);
  // console.log(`\n\n\nqueryObjectSchema ${routeData.raw.method} ${routeData.raw.route}: ${CircularJSON.stringify(routeData.queryObjectSchema)}`);
  // console.log(`Specific args ${routeData.raw.method} ${routeData.raw.route}: ${CircularJSON.stringify(routeData.specificArgs)}`);
  
  // console.log(`\n\nAPI: ${routeData.raw.method} ${routeData.raw.route}`)
  const queryParams = parseQueryParams(routeData.queryObjectSchema);

  return {
    apiMethod: routeData.raw.method,
    apiRoute: routeData.raw.route,
    queryParams: queryParams,
  }

  // const templateDir = path.resolve(getTemplatesDirectory(), "./functions-modular")
  // const templateFile = "function-args.ejs";
  // const eta = new Eta({ views: templateDir});
  // const specificArgObjectArr = [specificArgs.body, specificArgs.pathParams];
  // console.log("specific args object arr", specificArgObjectArr)
  // let functionArgsRendered = eta.render(templateFile, { specificArgsObjectArr: specificArgObjectArr });

  // console.log('functionsArgsRendered: ', functionArgsRendered);

  // return {
  //   specificArgs: specificArgs,
  //   requiresRelaxedTypeAnnotation: false,
  //   functionArgsRendered: functionArgsRendered,
  //   functionArgsMappingRendered: '',
  // };
}

export function parseQueryParams(queryParams: any): Schema | undefined {
  if (!queryParams || !queryParams.$parsed) {
    console.log('no query params');
    return undefined;  // no query params
  }
  // console.log('queryParams.$parsed: ', queryParams.$parsed);

  const queryParamName = queryParams.$parsed.name ?  queryParams.$parsed.name : 'query';
  const querySchema: Schema = {
    description: "request query",
    name: queryParamName,
    type: "object",
    properties: queryParams.properties,
    required: true,
  }
  querySchema.rendered = renderQueryParams(querySchema);
  console.log(querySchema.rendered);
  // console.log('querySchemaJson: ', CircularJSON.stringify(querySchema));
  return querySchema;
}

function renderQueryParams(schema: Schema | undefined): string {
  // console.log('renderQueryParams: schema: ', CircularJSON.stringify(schema));
  if (!schema) {
    return '';
  }
  if (schema.type === 'object') {
    let result = '';
    for (const property in schema.properties) {
      result = `${result}  ${renderQueryParams(schema.properties[property])}`;
      // result.concat(renderQueryParams(schema.properties[property]));
    }
    if (schema.required) {
      schema.rendered = `${schema.name}: { ${result} },`
    } else {
      schema.rendered =  `${schema.name}?: { ${result} },`
    }
    return schema.rendered;
  }
  else {
    if (schema.required) {
      schema.rendered = `${schema.name}: ${schema.type},`
    } else {
      schema.rendered = `${schema.name}?: ${schema.type},`
    }
    return schema.rendered;
  }
}

// function renderSchema(schema: Schema) {
//   const schemaDescription = schema.description ? `\\** ${schema.description} */` : '';

//   if (schema.required) {
//     return `${schemaDescription} ${schema.name}: ${schema.type},`
//   } else {
//     return `${schemaDescription} ${schema.name}?: ${schema.type},`
//   }
// }

export function parseSpecificArgs(specificArgs: SpecificArgs): SpecificArgs {
  if (specificArgs.body) {
    specificArgs.body.tsArgName = specificArgs.body.name;
  }
  if (specificArgs.pathParams) {
    // specificArgs.pathParams.tsArgName = 'def'
    // parse path arguments
  }
  return specificArgs;
}

function renderFunctionArgs(specificArgs: SpecificArgs) {

}