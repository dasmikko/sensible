
import {consola} from "consola";
import {checkPackage} from "../packages.ts";
import {checkRequirement} from "../requirements.ts";
import {colors} from "consola/utils";
import {sensibleObject, globalArgs, loadSensibleFile} from "../global.ts";
import {isInCurrentEnvironment} from "../utils/environment.ts";

/**
 * Check if all required packages are installed
 * @returns {Promise<boolean>}
 */
export async function checkPackages(): Promise<boolean> {
    consola.start("Checking packages");

    // Check if required packages are installed
    let packageMissing = false
    for (const packageObj of sensibleObject.packages) {
        if (!isInCurrentEnvironment(packageObj.env)) {
            continue
        }

        const packageStatus = await checkPackage(packageObj);
        if (!packageStatus) {
            packageMissing = true
        }
    }

    if (packageMissing) {
        consola.error("One or more packages are missing. Run `sensible install` to install them.");
        return false
    }

    return true
}

/**
 * Check if all requirements are met
 * @returns {Promise<boolean>}
 */
export async function checkRequirements(): Promise<boolean> {
    consola.start("Checking requirements");
    let hasUnmetRequirements = false;

    for (const requirementObj of sensibleObject.requirements) {
        if (!isInCurrentEnvironment(requirementObj.env)) {
            continue
        }


        const checkStatus = await checkRequirement(requirementObj)

        if (checkStatus) {
            consola.success(`${colors.bold(requirementObj.name)}`);
        } else {
            consola.fail(`${colors.bold(requirementObj.name)}`);
            hasUnmetRequirements = true;
        }
    }

    if (hasUnmetRequirements) {
        consola.error("One or more requirements are not met. Run `sensible install` to fix them.");
        return false
    }

    return true
}

/**
 * Main check command, checks packages and requirements.
 * @returns {Promise<boolean>}
 */
export async function check(): Promise<boolean> {
    // Check if there is a sensible.json in the current path
    await loadSensibleFile();

    let overallStatus = true;

    if (sensibleObject.packages && sensibleObject?.packages.length > 0) {
        const packageStatus = await checkPackages();
        if (!packageStatus) {
            overallStatus = false;
        }
    }

    if (sensibleObject.requirements && sensibleObject?.requirements.length > 0) {
        consola.log('')
        const requirementStatus = await checkRequirements();

        if (!requirementStatus) {
            overallStatus = false;
        }
    }

    if (!overallStatus) {
        return false;
    }

    return true
}
