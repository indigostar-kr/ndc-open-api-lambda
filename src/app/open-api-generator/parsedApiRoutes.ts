import { ParsedRoute } from "swagger-typescript-api"
const CircularJSON = require('circular-json');
import * as logger from "../../util/logger";
import { ApiComponents } from "./api-generator";

export enum ParamType {
  QUERY = 'query',
  PATH = 'path',
  BODY = 'body',
}

export type Param = {
  name: string,
  description?: string,
  required: boolean,
  tsType: string,
  format?: string,
  paramType: ParamType,
}

export type ApiRoute = {
  type: string, // get/post etc
  route: string, // route of the api
  successType: any, // successDto
  errorType: any, // error DTO
  description?: string, // description of the api
  namespace: string, // in Api.ts, the name of the namespace to which this api call belongs
  apiFunction: string, // in Api.ts, the name of the function that calls this api
  queryVariablesContent: string, // all the variables in query, in a printable string format
  queryVariableName: string, // in Api.ts, the name of the function param that accepts the query variables
  functionName: string, // the name of the function that will be generated in function.ts file
  queryParams: Param[], // TODO: remove
  pathParams: Param[], // TODO: remove
  allParams: Param[],
  isQuery: boolean,
  shouldWrapReturnResultInJSON: boolean, // if the return result type is unsupported (like `any`), it should be wrapped as JSON. this flag dictates whether that happens or not
  shouldAllowRelaxedTypes: boolean, // flag to add `@allowrelaxedtypes` annotation. More: https://github.com/hasura/ndc-nodejs-lambda?tab=readme-ov-file#relaxed-types

  successResponseIsVoid: boolean,
  successAndErrorResponseIsVoid: boolean,
  // parsedRoute: ParsedRoute,
}

export class ParsedApiRoutes {
  private apiRoutes: ApiRoute[] = [];
  private importList: Set<string> = new Set<string>();
  private generatedComponents = new Set<string>();
  private hasEnumVariables = false;

  private apiComponents: ApiComponents;

  constructor(generatedComponents: Set<string>, apiComponents: ApiComponents) {
    this.generatedComponents = generatedComponents;
    this.apiComponents = apiComponents;
    this.importList = generatedComponents;
    this.importList.add('Api');
  }

  private reservedTypes = new Set<string>(['void', 'any',
    'string', 'Record', 'number']);

  public parse(route: any) {
    this.hasEnumVariables = false;

    // ensure keywords like `void` are not added to import list and hence to added to import statements
    this.addTypeToImportList(route.response.type, this.importList);
    this.addTypeToImportList(route.response.errorType, this.importList);

    const allParams = this.parseParams(route.routeParams.query, ParamType.QUERY);
    allParams.push(...this.parseParams(route.routeParams.path, ParamType.PATH));
    const bodyParam = this.parseBodyParams(route.requestBodyInfo);
    if (bodyParam) {
      allParams.push(bodyParam);
    }

    this.sortParamsByOptionality(allParams);

    // console.log('\n\n all params: ', CircularJSON.stringify(allParams));

    logger.info(`parsing route: ${route.request.method?.toUpperCase()} ${route.raw.route}`);
    const apiRoute: ApiRoute = {
      type: route.request.method?.toUpperCase(),
      route: route.raw.route,
      successType: this.sanitizeTypes(route.response.type),
      errorType: this.sanitizeTypes(route.response.errorType),
      description: route.raw.summary,
      namespace: route.namespace,
      apiFunction: route.routeName.usage,
      queryVariablesContent: route.specificArgs?.query?.type,
      queryVariableName: route.specificArgs?.query?.name,
      functionName: this.getFunctionName(route.request.method, route.namespace, route.routeName.usage),
      queryParams: this.parseParams(route.routeParams.query, ParamType.QUERY),
      pathParams: this.parseParams(route.routeParams.path, ParamType.PATH),
      allParams: allParams,
      shouldWrapReturnResultInJSON: this.shouldWrapReturnResultInJSON(route.response),
      shouldAllowRelaxedTypes: this.shouldAllowRelaxedTypes(route, allParams, this.sanitizeTypes(route.response.type)),

      isQuery: route.raw.method === 'get',

      successResponseIsVoid: this.successResponseIsVoid(route.response),
      successAndErrorResponseIsVoid: this.successAndErrorResponseIsVoid(route.response)
    };
    this.apiRoutes.push(apiRoute);
  }

  public getApiRoutes(): ApiRoute[] {
    return this.apiRoutes;
  }

  public getImportList(): string[] {
    return Array.from(this.importList);
  }

  private getImportType(type: string) {
    type = this.sanitizeTypes(type);
    if (type.endsWith('[]')) {
      return type.slice(0, type.length-2);
    } else {
      return type;
    }
  }

  private shouldWrapReturnResultInJSON(response: any): boolean {
    if (response['type'] === 'any' || response['type'] === 'void') {
      return true;
    } else if (response['type'].includes('Record<') || response['type'].includes('Map<')) {
      return true;
    }
    return false;
  }

  private successResponseIsVoid(response: any): boolean {
   return response['type'] === 'void'; 
  }

  private successAndErrorResponseIsVoid(response: any): boolean {
    return (response.errorType === 'void') && this.successResponseIsVoid(response);
  }

  private shouldAllowRelaxedTypes(apiRoute: any, allParams: Param[] | undefined, responseSuccessType: string): boolean {
    if (this.shouldWrapReturnResultInJSON(apiRoute.response)) {
      return true;
    }
    if (apiRoute.response.type.startsWith('Record<')) {
      return true;
    }
    if (this.hasEnumVariables) {
      return true;
    }
    if (allParams && allParams.length > 0) {
      for (const param of allParams) {
        let sanitizedType = param.tsType.endsWith('[]') ? param.tsType.substring(0, param.tsType.length-2) : param.tsType;
        sanitizedType = this.sanitizeTypes(sanitizedType);
        const ndcComponent = this.apiComponents.getNdcComponentByTypeName(sanitizedType);
        if (ndcComponent && ndcComponent.isRelaxedType) {
          return true;
        }
      }
    }
    let sanitizedType = responseSuccessType.endsWith('[]') ? responseSuccessType.substring(0, responseSuccessType.length-2) : responseSuccessType;
    sanitizedType = this.sanitizeTypes(sanitizedType);
    const ndcComponent = this.apiComponents.getNdcComponentByTypeName(sanitizedType);
    if (ndcComponent && ndcComponent.isRelaxedType) {
      return true;
    }
    return false;
  }

  private addTypeToImportList(type: string, importList: Set<string>) {
    const allTypes = this.splitGenericType(type);
    for (type of allTypes) {
      type = this.convertDataTypeToTypeName(type);
      if (!this.reservedTypes.has(this.getImportType(type)) && this.generatedComponents.has(type)) {
        importList.add(this.getImportType(type));
      }
    }
  }

  private splitGenericType(type: string): string[] {
    if (type.includes('<') && type.includes('>')) {
      type = type.replace('<', ',');
      type = type.replace('>', '');
      return type.split(',');
    }
    return [type];
  }

  private sortParamsByOptionality(params: Param[]) { // puts all required params at the start of the array and the optional ones at the end
    let optionalParams: Param[] = [];
    let requiredParams: Param[] = [];
    for (const p of params) {
      if (p.required && p.required === true) {
        requiredParams.push(p);
      } else {
        optionalParams.push(p);
      }
    }
    params.splice(0, params.length);
    params.push(...requiredParams);
    params.push(...optionalParams);
  }

  private sanitizeTypes(type: string): string {
    type = type.replace('(', '');
    type = type.replace(')', '');
    return type;
  }

  /**
   * this function takes in a data type and extracts the type name from it
   * Eg: (APIRequest)[] => APIRequest
   * @param dataType the type to be converted
   */
  private convertDataTypeToTypeName(dataType: string): string {
    dataType = dataType.replace('(', '');
    dataType = dataType.replace(')', '');
    dataType = dataType.replace('[', '');
    dataType = dataType.replace(']', '');
    return dataType;
  }

  private getFunctionName(type: string, namespace: string, apiFunction: string): string {
    return `${type}${this.capitalizeFirstLetter(namespace)}${this.capitalizeFirstLetter(apiFunction)}`
  }

  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private parseParams(args: any[], paramType: ParamType): Param[] { // TODO: change parameter name to `routeParametersArray` or something more descriptive
    if (!args || args.length === 0) {
      return [];
    }

    const returnParams: Param[] = [];
    for (const arg of args) {
      let paramTsType: string = '';
      if (this.isEnum(arg)) {
        this.hasEnumVariables = true;
        paramTsType = this.getEnumType(arg);
      } else {
        paramTsType = this.getTypeMapping(arg);
      }
      const param: Param = {
        name: arg['name'],
        description: arg['description'],
        required: (arg['required'] && arg['required'] === true) ? true : false,
        tsType: paramTsType,
        format: arg['format'],
        paramType: paramType,
      }

      returnParams.push(param);
      this.addTypeToImportList(paramTsType, this.importList);
    }
    return returnParams;
  }

  private parseBodyParams(arg: any): Param | null {
    if (!arg['type']) {
      return null;
    }
    const paramType = this.getTypeMapping(arg);
    const param: Param = {
      name: arg['paramName'],
      description: 'Request body',
      required: (arg['required'] && arg['required'] === true) ? true : false,
      tsType: paramType,
      format: arg['format'],
      paramType: ParamType.BODY,
    }
    this.addTypeToImportList(paramType, this.importList);
    if (arg['schema'] && arg.schema.properties) {
      for (const propertyKey in arg.schema.properties) {
        const property: any = arg.schema.properties[propertyKey];
        if (property.enum && property.enum.length > 0) {
          this.hasEnumVariables = true;
        }
        if (property['$ref']) {
          let ndcComponent = this.apiComponents.getNdcComponentByRef(property['$ref']);
          if (ndcComponent) {
            this.addTypeToImportList(ndcComponent.component.typeName, this.importList);
            if (ndcComponent.isRelaxedType) {
              this.hasEnumVariables = true; // to add @relaxed type annotation
            }
          }
        }
      }
    }
    return param;
  }

  private isEnum(routeParam: any): boolean {
    return (routeParam.enum && routeParam.enum.length > 0)
  }

  private getEnumType(routeParam: any): string {
    if (!this.isEnum(routeParam)) {
      return routeParam.type;
    }
    if (routeParam.type != 'string') {
      return routeParam.enum.join(' | ');
    }
    let returnType = '';
    for (const enumValue of routeParam.enum) {
      if (returnType.length === 0) {
        returnType = `"${enumValue}"`;
      } else {
        returnType = `${returnType} | "${enumValue}"`
      }
    }
    return returnType;
  }

  private getTypeMapping(routeParam: any): string {
    let tsTypeMapping = new Map<string, string>();
    tsTypeMapping.set('integer', 'number');

    if (routeParam['type'] === 'array') {
      return tsTypeMapping.get(routeParam.schema.items.type)
        ? `${tsTypeMapping.get(routeParam.schema.items.type)}[]`
        : `${routeParam.schema.items.type}[]`;
    }
    return tsTypeMapping.get(routeParam['type']) ? tsTypeMapping.get(routeParam['type']) : routeParam['type'];
  }
}
