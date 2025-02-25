
import {globalArgs} from "./global.ts";
import {$} from "bun";
import {consola} from "consola";

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

    // Add colors
    process.env.FORCE_COLOR='1'

    if (globalArgs.verboseMode) {
        consola.log(shellCommand)
    }

    if (showOutput) {
        const { stdout, stderr, exitCode } = await $`bash -c ${shellCommand}`
            .nothrow()
            .env({
                ...process.env,
                ...varsUppercase
            })

        // Return the exit code and the output
        return {
            exitCode : exitCode === null ? 0 : exitCode,
            stdout: stdout.toString(),
            stderr: stderr.toString(),
        }
    } else {
        const { stdout, stderr, exitCode } = await $`bash -c ${shellCommand}`
            .nothrow()
            .env({
                ...process.env,
                ...varsUppercase
            })
            .quiet()

        // Return the exit code and the output
        return {
            exitCode : exitCode === null ? 0 : exitCode,
            stdout: stdout.toString(),
            stderr: stderr.toString(),
        }
    }

}


export async function runZxScript (scriptPath: string, vars: object = {}): Promise<{ exitCode: number, stdout: string, stderr: string }> {
    // Prepare vars by making keys uppercase
    const varsUppercase = Object.fromEntries(
        Object.entries(vars).map(([key, value]) => [key.toUpperCase(), value])
    )

    // Run the shell command
    const { stdout, stderr, exitCode } = await $`${scriptPath}`.env({
        ...process.env,
        ...varsUppercase
    })

    return {
        exitCode : exitCode === null ? 0 : exitCode,
        stdout: stdout.toString(),
        stderr: stderr.toString(),
    }
}