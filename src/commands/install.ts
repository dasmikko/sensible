import {loadSensibleFile, sensibleObject} from "../global.ts";
import {consola} from "consola";
import {checkAndInstallPackages} from "../packages.ts";
import {checkRequirement, installRequirement} from "../requirements.ts";
import {colors} from "consola/utils";
import {handleSensibleTask} from "../tasks.ts";
import {isInCurrentEnvironment} from "../utils/environment.ts";
import type {PackageObject} from "../types/package.ts";

type InstallOptions = {
    force: boolean,
    verbose: boolean,
}

/**
 * Install command, checks and install packages, and requirements
 * @param options
 */
export async function install(options: InstallOptions) {
    // Check if there is a sensible.yml in the current path
    await loadSensibleFile();

    console.log(options)

    // Handle pre-tasks
    let preTasks = sensibleObject?.preTasks?.filter(task => isInCurrentEnvironment(task.env));
    if (preTasks && preTasks.length > 0) {
        consola.start('Handle pre-tasks')

        for (const task of preTasks) {
            await handleSensibleTask(task);
        }

        console.log('')
    }


    // Handle packages
    let packages = sensibleObject?.packages?.filter(pkg => isInCurrentEnvironment(pkg.env));
    if (packages && packages.length > 0) {
        consola.start("Checking for required packages...");
        const status = await checkAndInstallPackages(packages as [PackageObject], options.force);

        if (!status) {
            consola.error("One or more packages failed installing.");
        } else {
            consola.success("All packages installed successfully.");
            consola.log('')
        }
    }

    // Handle requirements
    let requirements = sensibleObject?.requirements?.filter(req => isInCurrentEnvironment(req.env));
    if (requirements && requirements.length > 0) {
        consola.start('Handle requirements')

        // Check if required requirements are met
        for (const requirementObj of requirements) {
            if (!isInCurrentEnvironment(requirementObj.env)) {
                continue
            }

            if (!requirementObj.check) {
                const installStatus = await installRequirement(requirementObj)
                if (installStatus) {
                    consola.success(`${colors.bold(requirementObj.name)}`);
                } else {
                    consola.fail(`${colors.bold(requirementObj.name)}`);
                }
            } else {
                const checkStatus = await checkRequirement(requirementObj)

                if (checkStatus) {
                    consola.success(`${colors.bold(requirementObj.name)}`);
                } else {
                    consola.info(`${colors.bold(requirementObj.name)} is not met... fixing...`);
                    const installStatus = await installRequirement(requirementObj)

                    if (installStatus) {
                        consola.success(`${colors.bold(requirementObj.name)}`);
                    } else {
                        consola.fail(`${colors.bold(requirementObj.name)}`);
                    }
                }
            }
        }
        consola.log('')
    }

    // Handle tasks
    let tasks = sensibleObject?.tasks?.filter(task => isInCurrentEnvironment(task.env)); // Filter tasks for the current environment
    if (tasks && tasks.length > 0) {
        consola.start('Handle tasks')

        for (const task of tasks) {
            await handleSensibleTask(task);
        }

        console.log('')
    }

    // Handle post tasks
    let postTasks = sensibleObject?.postTasks?.filter(task => isInCurrentEnvironment(task.env));
    if (postTasks && postTasks.length > 0) {
        consola.start('Handle post-tasks')

        for (const task of postTasks) {
            await handleSensibleTask(task);
        }

        console.log('')
    }
}
