import {sensibleObject, globalArgs} from "../global.ts";
import {consola} from "consola";
import yaml from "js-yaml";
import type {TaskObject} from "../types/task.ts";
import { readdir } from "node:fs/promises";
import {colors} from "consola/utils";
import {runTask} from "../tasks.ts";
import open, {openApp, apps} from 'open';
import {$} from "zx";
import { $ as bunShell } from "bun";
import path from 'node:path'
import {runZxScript} from "../shell.ts";


/**
 * Run a task command
 * @param taskName
 */
export async function taskRun(taskName: string, vars: object) : Promise<void> {
    let sensibleFolderPath = globalArgs.sensibleFolder

    // Find the task inside sensible folder
    const taskFileYml = Bun.file(`${sensibleFolderPath}/tasks/${taskName}.yml`)
    const taskFileJs = Bun.file(`${sensibleFolderPath}/tasks/${taskName}.js`)

    // Run the yaml file if it exists
    if (await taskFileYml.exists()) {
        // Load the task file
        const taskObject = yaml.load(await taskFileYml.text()) as TaskObject;


        consola.info(`Running task: ${taskName}`)

        const tastStatus = await runTask(taskObject, vars)
        if (tastStatus) {
            consola.success("Task completed successfully.")
        } else {
            consola.error("Task failed.")
        }

        return
    }
    
    // Run the js file if it exists
    if (await taskFileJs.exists()) {
        consola.info(`Running js task: ${taskName}`)
        const scriptContent = await taskFileJs.text()

         // Check if the script is a zx script
        if (scriptContent.startsWith('#!/usr/bin/env zx')) {
            const {exitCode} = await runZxScript(`${sensibleFolderPath}/tasks/${taskName}.js`, vars)

            if (exitCode === 0) {
                consola.success("Task completed successfully.")
            } else {
                consola.error("Task failed.")
            }
        } else {
            consola.error("Only zx scripts are supported.")
            process.exit(1)
        }

        return
    }

    consola.error("task does not exist.");
    process.exit(1);

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
            const taskFile = Bun.file(`${taskFolder}/${task}`);
            const taskFileType = taskFile.type.split(';')[0]

            // Handle javascipt files differently
            if (taskFileType === 'text/javascript') {
                consola.log(`${colors.bold(taskFilename)} (${colors.yellow('zx script')})`)
                continue
            }

            // Load the task file to get info about it
            const taskObject = yaml.load(await taskFile.text()) as TaskObject;
            if (options.description) {
                consola.log(`${colors.bold(taskFilename)}: ${taskObject.name} (${taskObject.description})`)
            } else {
                consola.log(`${colors.bold(taskFilename)}: ${taskObject.name}`)
            }
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
