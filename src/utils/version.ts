import semver, {SemVer} from "semver";
import {globalArgs} from "../global.ts";
import {consola} from "consola";

/**
 * Parse a version string into a SemVer object. It will try to coerce the version string into a valid SemVer object.
 * @param versionString
 */
export function parseVersion(versionString: string): SemVer | null | string {
    try {
        const packageVersion = semver.coerce(versionString);

        if (packageVersion === null) {
            if (globalArgs.verboseMode) consola.error(`Version could not be parsed from "${String(versionString)}"`)

            return 'Unknown'
        }

        return packageVersion.version
    } catch (e) {
        consola.error(`Version could not be parsed from "${String(versionString)}"`)
        return 'Unknown'
    }
}