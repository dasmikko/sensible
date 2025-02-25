import {globalArgs} from "../global.ts";
import {consola} from "consola";

type InitOptions = {
    force: boolean
}

/**
 * Initialize a new sensible file
 * @param options
 */
export async function init(options: InitOptions) {
    const fileContents = `---
packages:
requirements:
deploy:`

    // Check if the sensible file already exists, unless force is enabled
    if (options.force) {
        const sensibleFile = Bun.file(globalArgs.sensibleFilePath);
        try {
            Bun.write('sensible.yml', fileContents)
        } catch (e) {
            consola.error("Failed to initiate sensible file.");
            consola.error(e);
            process.exit(1)
        }
    } else {
        // Check if there is a sensible.yml in the current path
        const sensibleFile = Bun.file(globalArgs.sensibleFilePath);
        const exists = await sensibleFile.exists();

        if (exists) {
            consola.error("sensible.yml file already exists.");
            process.exit(1);
        }

        try {
            Bun.write('sensible.yml', fileContents)
        } catch (e) {
            consola.error("Failed to initiate sensible file.");
            consola.error(e);
            process.exit(1)
        }
    }

    consola.success("sensible.yml file was created!");
}
