'use strict';

/** Libraries */
import * as vscode from 'vscode';
import {Map} from 'immutable';
import * as Swagger from 'swagger-schema-official';

/** Helpers */
import {fetchSwaggerDefinitions, getRequestType, hasResponseDefinition, getResponseDefinition, generateApiInterface} from '../helpers/Swagger';

/**
 * This method is called when the extension is activated.
 * The extension is activated the very first time the command
 * is executed.
 * 
 * @param context The context under which the extension is
 * activated
 */
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "swagger-interface-generator" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed
        generateApiInterfaces();
    });

    context.subscriptions.push(disposable);
}

/**
 * This method is called when your extension is deactivated
 */
export function deactivate() {
}

const generateApiInterfaces = () => {
  fetchSwaggerDefinitions().then(data => {
    const apis = Map(data.paths);

    apis.map((api: Swagger.Path) => {
      if(hasResponseDefinition(api)) {
        generateApiInterface(api[getRequestType(api)].operationId, getResponseDefinition(api));
      }
    })
  });
}