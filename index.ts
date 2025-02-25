#!/usr/bin/env bun
import {Command} from "commander";
import {initArgs} from "./src/global.ts";
import packageJson from './package.json'
import {consola} from "consola";

// Import commands
import { check } from "./src/commands/check.ts"
import { init } from "./src/commands/init.ts"
import { install } from "./src/commands/install.ts"
import {listTasks, taskCreate, taskRun} from "./src/commands/task.ts";

const preAction = (_: Command, actionCommand: Command) => {
    // Initialize the global arguments
    initArgs(actionCommand.optsWithGlobals())

    if (actionCommand.optsWithGlobals().prod) {
        consola.info('Production mode enabled')
    }
}

const program = new Command();

program
    .name('sensible')
    .description('A sensible project manage tool for your projects')
    .option('--env <string>', 'Set the environment', 'dev')
    .option('-f, --sensibleFile <string>', 'Path to the sensible file')
    .option('-d, --sensibleFolder <string>', 'Path to the sensible folder', '.sensible')
    .option('-p, --prod', 'Set to production mode', false)
    .version(packageJson.version)


program
    .command('check')
    .description('Check the project for missing dependencies')
    .option('-v, --verbose', 'Verbose mode', false)
    .hook('preAction', preAction)
    .action(async () => {
        await check()
    })

program
    .command('install')
    .description('Install missing dependencies and requirements')
    .option('--force', 'Force installation', false)
    .option('-v, --verbose', 'Verbose mode', false)
    .hook('preAction', preAction)
    .action(async (options) => {
        await install(options)
    })


const taskCommand = program.command('task')
taskCommand.usage('[command] <task>')
taskCommand.argument('<task>', 'Task to run')
taskCommand.description('Manage tasks')
taskCommand.hook('preAction', preAction)


taskCommand.command('run')
    .description('Run a task')
    .usage('<task> <variables...>')
    .argument('<task>', 'Task to run')
    .option('--vars [vars...]', 'Variables for the task', '')
    .option('-v, --verbose', 'Verbose mode', false)
    .hook('preAction', preAction)
    .action(async (task, options) => {
        interface TaskVariables {
            [key: string]: string;
        }

        // Parse the variables
        let taskVars: TaskVariables = {}
        for (const variable of options.vars) {
            const [key, value] = variable.split('=')
            taskVars[key] = value
        }

        // Run the task with variables
        await taskRun(task, taskVars)
    })

taskCommand.command('list')
    .description('List available tasks')
    .option('-d, --description', 'Show descriptions', false)
    .hook('preAction', preAction)
    .action(async (options) => {
        await listTasks(options)
    })

taskCommand.command('create')
    .description('Create a new task')
    .argument('<task>', 'Task name')
    .option('-o, --open', 'open the task file in the editor', false)
    .hook('preAction', preAction)
    .action(async (task, options) => {
        await taskCreate(task, options)
    })


program
    .command('init')
    .description('Create a new sensible file')
    .option('--force', 'Force creation of sensible file', false)
    .hook('preAction', preAction)
    .action(async (options) => {
        await init(options)
    })


program.parse(process.argv);