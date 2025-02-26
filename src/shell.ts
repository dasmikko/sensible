
import {globalArgs} from "./global.ts";
import {$} from "bun";
import {consola} from "consola";
import {sleep} from "zx";

/**
 * Run a shell command and return the exit code and the output
 * @param shellCommand
 * @param vars
 * @param showOutput If true, the output will be shown in the console NOTE: This will not return the output in the return object
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

    let proc = Bun.spawn({
        cmd: ["bash", '-lc', shellCommand],
        env: { ...process.env, ...varsUppercase },
        stdout: showOutput ? 'inherit' : 'pipe',
        stderr: showOutput ? 'inherit' : 'pipe',
        stdin: 'inherit'
    });

    // Wait for the process to exit
    const exitCode = await proc.exited
    const stdout = (await new Response(proc.stdout).text()).toString().trim()
    const stderr = await new Response(proc.stderr).text()

    // Return the exit code and the output
    return {
        exitCode,
        stdout,
        stderr,
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