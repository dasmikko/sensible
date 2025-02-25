import type {SensibleTask} from "./task.ts";

export interface RequirementObject {
    name: string,
    env: Array<string>,
    check: string,
    install: string
    task: string | SensibleTask
}


