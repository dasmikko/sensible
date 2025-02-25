import {$} from "zx";
import {globalArgs} from "./global.ts";
import {$ as bunShell} from "bun";

/**
 * Run a shell command and return the exit code and the output
 * @param shellCommand
 * @returns {Promise<{exitCode: number, stdout: string, stderr: string}>}
 */
export async function runShellCommand(shellCommand: string, vars: object = {}, showOutput: boolean = false): Promise<{ exitCode: number, stdout: string, stderr: string }> {
    // Prepare vars by making keys uppercase
    const varsUppercase = Object.fromEntries(
        Object.entries(vars).map(([key, value]) => [key.toUpperCase(), value])
    )

    // Setup the shell function
    const $$ = $({
        verbose: globalArgs.verboseMode,
        env: {
            ...process.env, // Pass the current environment variables
            ...varsUppercase // Pass the vars object
        },
        nothrow: true, // Don't throw an error if the command fails
        quiet: !globalArgs.verboseMode, // Don't output the command
    })

    // Run the shell command
    const { stdout, stderr, exitCode } = await $$`bash -c ${shellCommand}`

    if (showOutput) {
        console.log(stdout.toString().trim())
    }

    // Return the exit code and the output
    return {
        exitCode : exitCode === null ? 0 : exitCode,
        stdout: stdout.toString(),
        stderr: stderr.toString(),
    }
}


export async function runZxScript (scriptPath: string, vars: object = {}): Promise<{ exitCode: number, stdout: string, stderr: string }> {
    // Prepare vars by making keys uppercase
    const varsUppercase = Object.fromEntries(
        Object.entries(vars).map(([key, value]) => [key.toUpperCase(), value])
    )

    // Run the shell command
    const { stdout, stderr, exitCode } = await bunShell`${scriptPath}`.env({
        ...process.env,
        ...varsUppercase
    })

    return {
        exitCode : exitCode === null ? 0 : exitCode,
        stdout: stdout.toString(),
        stderr: stderr.toString(),
    }
}