import type {RequirementObject} from "./types/requirement.ts";
import { runShellCommand } from "./shell.ts";
import {colors} from "consola/utils";
import {consola} from "consola";
import {runTask} from "./tasks.ts";

/**
 * Check if a requirement is met
 * @param requirementObj
 * @returns {Promise<boolean>}
 */
export async function checkRequirement(requirementObj: RequirementObject) : Promise<boolean> {
    // Run the check command
    const {exitCode} = await runShellCommand(requirementObj.check);
    if (exitCode > 0) {
        return false
    }
    return true
}

/**
 * Install a requirement
 * @param requirementObj
 * @returns {Promise<boolean>}
 */
export async function installRequirement(requirementObj: RequirementObject) : Promise<boolean> {
    // Run the install command if present
    if (requirementObj.install) {
        const {exitCode} = await runShellCommand(requirementObj.install);
        if (exitCode > 0) {
            return false
        }
        return true
    }

    // Run the task if present
    if (requirementObj.task) {
        let taskStatus;

        if (typeof requirementObj.task === 'string') {
            taskStatus = await runTask(requirementObj.task)
        } else {
            taskStatus = await runTask(requirementObj.task.name, requirementObj.task.vars)
        }

        return taskStatus
    }

    consola.warn(`No install command or task was found for ${colors.bold(requirementObj.name)}. Skipping...`);

    return false
}

