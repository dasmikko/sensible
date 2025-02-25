export type TaskObject = {
    name: string,
    description: string,
    script: string,
}


export interface SensibleTask {
    name: string,
    task: string,
    env: Array<string>,
    check: string,
    vars: object
}