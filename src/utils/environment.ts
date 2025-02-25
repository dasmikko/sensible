import { globalArgs } from "../global.ts";

export function isInCurrentEnvironment(environments: Array<string> = []): boolean {
    // If no environments are specified, it is assumed that the package is required in all environments
    if (environments.length === 0) {
        return true;
    }

    // If the current environment is in the list of required environments, return true
    return environments.includes(globalArgs.environment);
}