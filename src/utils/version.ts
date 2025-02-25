import semver, {SemVer} from "semver";

/**
 * Parse a version string into a SemVer object. It will try to coerce the version string into a valid SemVer object.
 * @param versionString
 */
export function parseVersion(versionString: string): SemVer {
    const packageVersion = semver.coerce(versionString);

    if (packageVersion === null) {
        throw new Error(`Version could not be parsed from ${versionString}`);
    }

    return packageVersion
}