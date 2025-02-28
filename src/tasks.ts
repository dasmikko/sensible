import {sensibleObject, globalArgs} from "./global.ts";
import {consola} from "consola";
import type {SensibleTask, TaskObject} from "./types/task.ts";
import yaml from "js-yaml";
import {runShellCommand} from "./shell.ts";

/**
 * Handles a task from the sensible file
 * @param sensibleTask
 */
export async function handleSensibleTask(sensibleTask: SensibleTask) : Promise<boolean> {
    let sensibleFolderPath = globalArgs.sensibleFolder

    // Find the task inside sensible folder
    const taskFile = Bun.file(`${sensibleFolderPath}/tasks/${sensibleTask.task}.yml`)
    const exists = await taskFile.exists();
    if (!exists) {
        consola.error("Task does not exist.");
        process.exit(1);
    }

    // Load the task file
    const taskObject = yaml.load(await taskFile.text()) as TaskObject;

    // Check if task check is met
    if (sensibleTask.check) {
        const {exitCode} = await runShellCommand(sensibleTask.check)

        // Run the task if check fails
        if (exitCode > 0) { // Check failed
            const taskStatus = await runTask(taskObject, sensibleTask.vars)

            if (taskStatus) {
                consola.success(`${sensibleTask.name}`)
                return true
            } else {
                consola.error(`${sensibleTask.name} failed.`)
                return false
            }
        } else { // Check passed
            consola.success(`${sensibleTask.name} (Skipped because of check)`)
            return true
        }
    }

    const taskStatus = await runTask(taskObject, sensibleTask.vars)
    if (taskStatus){
        consola.success(`${sensibleTask.name}`)
        return true
    } else {
        consola.error(`${sensibleTask.name} failed.`)
        return false
    }
}


/**
 * Runs a task
 * @param taskName
 * @param local
 */
export async function runTask(task: TaskObject, vars: object = {}) : Promise<boolean> {
    if (!task.script) {
        consola.error("Task does not have a script. Exiting...")
        return false
    }

    // Run the task
    const {exitCode, stdout, stderr} = await runShellCommand(task.script, vars, task.showOutput)
    if (exitCode === null || exitCode > 0) {
        consola.log("Task failed.")
        consola.error(stderr)
        return false
    }

    return true
}