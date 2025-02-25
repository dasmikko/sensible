export type TaskObject = {
    name: string,
    description: string,
    showOutput: boolean
    script: string,
}


export interface SensibleTask {
    name: string,
    task: string,
    env: Array<string>,
    check: string,
    vars: object
}