import type {PackageObject} from "./types/package.ts";
import {consola, createConsola} from "consola";
import {colors} from "consola/utils";
import semver from "semver";
import { runShellCommand } from "./shell.ts";

import {parseVersion} from "./utils/version.ts";
import {isInCurrentEnvironment} from "./utils/environment.ts";

/**
 * Check if a package is installed
 * @param packageObj
 * @returns {Promise<boolean>}
 */
export async function checkPackage(packageObj: PackageObject): Promise<boolean> {
    // Check if package is installed
    const {exitCode, stdout, stderr } = await runShellCommand(`command -v ${packageObj.name}`);

    if(exitCode > 0) {
        consola.fail(`${colors.bold(packageObj.name)} not found.`);
        return false
    }

    const versionString = await getPackageVersion(packageObj);
    const packageVersion = parseVersion(versionString);

    if (packageObj.range) {
        if (!semver.satisfies(packageVersion, packageObj.range)) {
            consola.fail(`${colors.bold(packageObj.name)} (${packageVersion}) was found. but does not satisfy the range ${packageObj.range}.`);
            return false
        }
    }

    if (packageVersion === null) {
        consola.fail(`${colors.bold(packageObj.name)} was found, but the version could not be determined.`);
        return false
    }

    consola.success(`${colors.bold(packageObj.name)} (${packageVersion}) found.`);
    return true
}


/**
 * Get the version of a package, returns an empty string if the version could not be determined
 * @param packageObj
 * @returns {Promise<string>}
 */
export async function getPackageVersion(packageObj: PackageObject): Promise<string> {
    // Try using --version
    const {exitCode: exitCodeVersion, stdout: stdOutVersion} = await runShellCommand(`${packageObj.name} --version`);

    if (exitCodeVersion === 0) {
        return stdOutVersion
    }

    // Try using -V
    const {exitCode: exitCodeV, stdout: stdoutV} = await runShellCommand(`${packageObj.name} -V`);

    if (exitCodeV === 0) {
        return stdoutV
    }

    return ''
}

/**
 * Install a package
 * @param packageObj
 * @returns {Promise<boolean>}
 */
export async function installPackage(packageObj: PackageObject): Promise<boolean> {
    consola.info(`Attempting to install ${colors.bold(packageObj.name)}...`);

    if (!packageObj.install) {
        consola.warn(`No install command found for ${colors.bold(packageObj.name)}. Skipping...`);
        return false
    }

    const { stdout, stderr, exitCode } = await runShellCommand(packageObj.install)

    if (exitCode > 0) {
        consola.verbose(`Failed with code ${exitCode}`);
        return false
    }

    return true
}

/**
 * Check and install packages
 * @param packages
 */
export async function checkAndInstallPackages(packages: [PackageObject], force: boolean = false): Promise<boolean> {
    let packageFailedInstall = false
    for (const packageObj of packages) {
        if (!isInCurrentEnvironment(packageObj.env)) {
            continue
        }

        // If flag is set, force install all packages
        if (force) {
            const installStatus = await installPackage(packageObj)

            if (!installStatus) {
                packageFailedInstall = true
            } else {
                consola.success(`${colors.bold(packageObj.name)} installed successfully.`);
            }

            continue
        }

        const packageStatus = await checkPackage(packageObj);

        if (!packageStatus) {
            const installStatus = await installPackage(packageObj)

            if (!installStatus) {
                packageFailedInstall = true
            }
        }
    }

    return !packageFailedInstall
}