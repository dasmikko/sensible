import {sensibleObject, globalArgs} from "../global.ts";
import {consola} from "consola";
import yaml from "js-yaml";
import type {TaskObject} from "../types/task.ts";
import { readdir } from "node:fs/promises";
import {colors} from "consola/utils";
import {runTask} from "../tasks.ts";
import open, {openApp, apps} from 'open';
import { Glob } from 'bun'
import {runScript} from "../shell.ts";
import path from 'node:path'
import fs from 'node:fs/promises'

/**
 * Run a task command
 * @param taskName
 */
export async function taskRun(taskName: string, vars: object) : Promise<void> {
    let sensibleFolderPath = globalArgs.sensibleFolder

    // Make sure the tasks folder exists
    try {
        await readdir(`${sensibleFolderPath}/tasks`)
    } catch (e) {
        consola.error("You don't have any tasks yet. Create a task first.");
        process.exit(1);
    }

    // Sanitize the task name to prevent directory traversal
    let taskNameSanitized = path.normalize(taskName)
    taskNameSanitized = taskNameSanitized.replaceAll('../', '');

    const taskFileGlob = new Glob(`${sensibleFolderPath}/tasks/${taskNameSanitized}*`);

    let foundFiles = []
    for await (const file of taskFileGlob.scan(".")) {
        foundFiles.push(path.basename(file));
    }

    if (foundFiles.length > 1) {
        consola.error("Multiple task files found with the same name. Please rename the tasks");
        process.exit(1)
    }

    if (foundFiles.length === 0) {
        consola.error("task does not exist.");
        process.exit(1);
    }


    const taskFileName = foundFiles[0]
    const taskFile = Bun.file(`${sensibleFolderPath}/tasks/${taskFileName}`)

    if (taskFileName.endsWith(".yml")) {
        // Load the task file
        const taskObject = yaml.load(await taskFile.text()) as TaskObject;

        consola.info(`Running task: ${taskNameSanitized}`)

        const tastStatus = await runTask(taskObject, vars)
        if (tastStatus) {
            consola.success("Task completed successfully.")
        } else {
            consola.error("Task failed.")
        }

        return
    }


    try {
        await fs.access(`${sensibleFolderPath}/tasks/${foundFiles[0]}`, fs.constants.X_OK);
    } catch (error) {
        consola.error("Task file is not executable.");
        process.exit(1)
    }


    consola.info(`Running script task: ${taskName}`)
    const {exitCode} = await runScript(`${sensibleFolderPath}/tasks/${taskFileName}`, vars)

    if (exitCode === 0) {
        consola.success("Task completed successfully.")
    } else {
        consola.error("Task failed.")
    }
}

type TaskListOptions = {
    description: boolean;
}

export async function listTasks(options: TaskListOptions) {
    const sensibleFolderPath = globalArgs.sensibleFolder;
    const taskFolder = `${sensibleFolderPath}/tasks`;

    try {
        const tasks = await readdir(taskFolder)

        for (const task of tasks) {
            const taskFilename = task
            const taskFilenameWoExt = taskFilename.split('.').slice(0, -1).join('.')
            const taskFile = Bun.file(`${taskFolder}/${task}`);
            const taskFileType = taskFile.type.split(';')[0]

            // Handle javascipt files differently
            if (taskFileType === 'text/javascript') {
                consola.log(`${colors.bold(taskFilenameWoExt)} (${colors.yellow('zx script')})`)
                continue
            }



            // Load the task file to get info about it
            const taskObject = yaml.load(await taskFile.text()) as TaskObject;

            let outputString = `${colors.bold(taskFilenameWoExt)}`

            if (taskObject.name) {
                outputString += ` - ${taskObject.name}`
            }

            if (options.description && taskObject.description) {
                outputString += ` (${taskObject.description})`
            }

            consola.log(outputString)
        }
    } catch (e: any) {
        // Handle error
        if (e.code === 'ENOENT') {
            consola.error("tasks folder does not exist.");
            process.exit(1);
        } else {
            consola.error(e)
        }
    }
}


interface TaskCreateOptions {
    open: boolean
}

/**
 * Initialize a new sensible file
 * @param options
 */
export async function taskCreate(taskNam: string, options: TaskCreateOptions) {
    const fileContents = `---
name:
description:
script:`

    const sensibleFolderPath = globalArgs.sensibleFolder;
    const taskFolder = `${sensibleFolderPath}/tasks`;

    // Check if the task already exist
    const taskFile = Bun.file(`${taskFolder}/${taskNam}.yml`);
    const exists = await taskFile.exists();

    if (exists) {
        consola.error(`${taskNam}.yml file already exists.`);
        process.exit(1);
    }

    try {
        await taskFile.write(fileContents)
    } catch (e) {
        consola.error("Failed to write task file.");
        consola.error(e);
        process.exit(1)
    }

    consola.success(`${taskNam}.yml file was created!`);

    if (options.open) {
        await openApp(`${taskFolder}/${taskNam}.yml`)
    }
}
