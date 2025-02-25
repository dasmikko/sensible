import type {PackageObject} from "./package.ts";
import type {RequirementObject} from "./requirement.ts";
import type {SensibleTask} from "./task.ts";

export interface SensibleObject {
    packages: [PackageObject]
    requirements: [RequirementObject]
    preTasks: [SensibleTask]
    tasks: [SensibleTask]
    postTasks: [SensibleTask]
}