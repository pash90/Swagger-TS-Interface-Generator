/** Libraries */
import * as vscode from 'vscode';
import axios, {AxiosInstance} from 'axios';
import {fromJS} from 'immutable';
import * as Lodash from 'lodash';
import * as FileSystem from 'fs';
import * as Path from 'path';

/** Interfaces */
import * as Swagger from 'swagger-schema-official';
import {ProjectConfiguration} from '../interfaces/Config'
import {ApiResponseInterface} from '../interfaces/Api';

/** Types */
type RequestType = 'post' | 'get' | 'patch' | 'delete' | 'put';
type ResponseProperties = {[propertyName: string]: Swagger.Schema};


/**
 * Get the type of the request.
 * 
 * @param api The API definition received from Swagger
 * @return One of the five request types: 'post', 'get', 'patch', 'delete', 'put'
 */
export const getRequestType = (api: Swagger.Path): RequestType => {
  if(api.get) return 'get';
  if(api.post) return 'post';
  if(api.patch) return 'patch';
  if(api.delete) return 'delete';
  if(api.put) return 'put';
}

/**
 * Checks whether the underlying API has any defined response
 * structure. If none are found, it returns false
 * 
 * @param api The API definition received from Swagger
 * @return A single boolean value indicating whether or not
 * the underlying API has any response structure
 */
export const hasResponseDefinition = (api: Swagger.Path): boolean => {
  const schema = api[getRequestType(api)].responses['200'].schema;

  // Case 1: 'properties' object is in the outer structure
  if(schema.hasOwnProperty('properties')) {
    return true;
  }

  // Case 2: 'properties' object is inside the 'items' property
  if(schema.hasOwnProperty('items')) {
    if((schema.items as Swagger.Schema).hasOwnProperty('properties')) {
      return true;
    }
    return false;
  }

  // Case 3: No 'properties' object present
  return false;
}

/**
 * Retreives the response definition object from the API
 * definition
 * 
 * @param api The API definition received from Swagger
 * @return An object with all the properties in the response
 * definition
 */
export const getResponseDefinition = (api: Swagger.Path): ResponseProperties => {
  const schema = api[getRequestType(api)].responses['200'].schema;
  let properties = schema.properties;

  if(!properties && !(schema.items instanceof Array)) {
    properties = schema.items.properties;
  }

  return properties;
}

/**
 * Takes the URL for swagger and fetches the definition for it
 * 
 * @return A promise that will resolve to the swagger spec for the
 * underlying URL
 */
export async function fetchSwaggerDefinitions(): Promise<Swagger.Spec> {
  const [fileURI] = await vscode.workspace.findFiles('**/client.json', '**/node_modules/**', 5); //TODO: this needs to be modified so that fallback to default.json occurs
  const document = await vscode.workspace.openTextDocument(fileURI);
  const {baseURL, apiKey}: ProjectConfiguration = JSON.parse(document.getText());

  const axiosInstance = axios.create({
    withCredentials: true,
    headers: {apiKey}
  });
  const response = await axiosInstance.get(baseURL + '/swagger/docs/v1?flatten=true');

  return response.data;
}

/**
 * Generates an interface for the underlying API
 * 
 * @param properties An object with all the properties in the response definition
 * @returns An interface that can be used to easily use the response data from the api
 */
export const generateApiInterface = (interfaceName: string, properties: ResponseProperties): string => {
  const formattedInterfaceName = Lodash.upperFirst(Lodash.camelCase(interfaceName));


  const items = fromJS(properties).reduce((reduction, property, key) => {
    return reduction += `${getPropertyString(key, property)}`;
  }, '');
  
  const generatedInterface = `export interface ${formattedInterfaceName} {\n${items}}\n\n`;
  return generatedInterface;
}

const getPropertyString = (name: string, property: Map<string, any>): string => {
  const type = property.get('type');

  switch(type) {
    // string
    case 'string': return `  ${name}: string\n`;

    // number
    case 'number': return `  ${name}: number\n`;
    case 'integer': return `  ${name}: number\n`;

    // object
    case 'object': return `  ${name}: Map<string, any>\n`;

    // file
    case 'file': return `  ${name}: File\n`;

    // boolean
    case 'boolean': return `  ${name}: boolean\n`;

    // array
    case 'array': return `  ${name}: List<${property.get('items').get('type')}>\n`

    // default
    default: return `  ${name}: any\n`;
  }
}

export const makeSwaggerInterfaceFile = (interfaces: string): void => {
  const interfaceImports = "import {Map, List} from 'immutable'\n\n";
  const filePath: string = vscode.workspace.rootPath + '/front-end/interfaces/Swagger.ts'
  const fileExists: boolean = FileSystem.existsSync(filePath);

  if(!fileExists) {
    FileSystem.mkdirSync(Path.dirname(filePath));
  }

  FileSystem.writeFileSync(filePath, interfaceImports + interfaces, error => console.log(error));
}