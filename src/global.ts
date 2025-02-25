import path from 'node:path'
import {consola} from "consola";
import type {SensibleObject} from "./types/sensible.ts";
import yaml from "js-yaml";
import type {GlobalArgsObject} from "./types/global.ts";

/**
 * Global arguments object
 */
export const globalArgs: GlobalArgsObject = {
    environment: 'dev',
    verboseMode: false,
    sensibleFolder: '',
    sensibleFilePath: '',
    localSensibleFolder: '',
}

/**
 * The main sensible object
 */
export let sensibleObject: SensibleObject;

/**
 * Initialize the global arguments
 * @param argv
 */
export function initArgs(argv: any) {
    const currentPath: string = process.cwd();
    globalArgs.environment = argv.env
    globalArgs.verboseMode = argv.verbose
    globalArgs.sensibleFolder = path.join(currentPath, String(argv.sensibleFolder));
    globalArgs.localSensibleFolder = path.join(path.dirname(Bun.main), argv.sensibleFolder);
    globalArgs.sensibleFilePath = argv.doctorFile || 'sensible.yml';
}

/**
 * Load the sensible file and store it in the sensibleObject
 */
export async function loadSensibleFile() : Promise<void> {
    // Attempt to retrieve file information
    const sensibleFileObj = Bun.file(globalArgs.sensibleFilePath);
    const exists = await sensibleFileObj.exists();
    if (!exists) {
        consola.error("sensible.yml file does not exist.");
        process.exit(1);
    }

    sensibleObject = yaml.load(await sensibleFileObj.text()) as SensibleObject;
}