# Sensible
A small tool to manage and deploy projects.

## NOTICE
This tool has been rewritten in ruby. Please check the maintained repository here: https://github.com/dasmikko/sensible-ruby

## Why?
The reason I made this tool, is I work on a lot of project at work, and we are a very small team. We work on separate things for the same projects, like I work on the frontend, and the other guy on the database.
He has his own tooling, and need a bunch of stuff installed and various settings set in files, to run the database. I have also my own tooling, and we often have to spend a lot of time helping with setting up our part of the project for each other so we can run them locally.

So to make things easier, I created this tool to help us document and setup each part of the projects, and make sure we have everything required to run each part.

It can also be used to document the setup process for a project, and make it easier for new developers to get started with the project. 

It's inspired by the `flutter doctor` feature in Flutter.

It's currently focused for usage in linux environments, but it should work on MacOS as well. It's not tested on Windows, but it should work with WSL. It uses zx by google to run the scripts, and it's only tested on linux.

## Installing
You can use the binary from the releases page, or you can install it with the RPM package from the same page

### Using binary

Download the binary from the releases page, and make it executable with `chmod +x sensible`. Then move it to a folder in your path, like `/usr/local/bin`.

### Using RPM package

Download the RPM package from the releases page, and install it with `dnf install ./sensible-x.x.x-1.x86_64.rpm`

# Docs

## Sensible file
The sensible file is a yaml file that defines the packages, requirements and tasks for the project. The sensible file should be in the root of the project and should be named `sensible.yml`. You can run the `sensible init` command to create a new sensible file.

The `sensible.yml` should look like this:

```yaml
---
preTasks:
packages:
requirements:
tasks:
postTasks:
```
This is the basic structure of the sensible file. You can add the packages, requirements, tasks, and postTasks to the file.

**All properties are optional, and you can omit them if you don't need them.**

### Packages
The packages are the packages that should be installed. The packages should be defined in the `packages` section of the sensible file.

The packages should be defined like this:

```yaml
packages:
  - name: <package-name> 
    range: <version-range>
    install: <install-command>
    env:
      - <environment 1>
      - <environment 2>
```  
The package should be the name of the command the package provides. As an example, if you check if Nodejs is installed `node`, the package name should be `node`.
It uses the [semver](https://www.npmjs.com/package/semver) npm package to check if the version is in the correct range.

The env property is optional, and if it's not defined, the package will be installed in every environment

The property `install` is the shell command that install the package.

### Requirements
The requirements section defines the requirements for the project, like if you need specific settings in a file, or a line in /etc/hosts. They work pretty much like tasks, but it's a way to document the requirements for the project, and structure the setup process.

The requirement should be defined like this:
```yaml
# sensible.yml
requirements:
  - name: <requirement-name>
    check: <shell script to check if the requirement is met>
    install: <shell script to make the requirement met>
    env:
      - <environment 1>
      - <environment 2>
```
The check and install script should be kept as short and simple as possible. If it gets too complex, it should be a task instead.


### Tasks
Tasks are the tasks that should be run when setting up the project. The tasks should be defined in the `tasks` section of the sensible file.

```yaml
# sensible.yml
tasks:
  - name: <task-name>
    check: <shell script to check if the task is already done, omit this to make it always run>
    task: <task-file>
    env:
      - <environment 1>
      - <environment 2>
``` 
A task in the sensible file has the following properties:
- name: The name of the task
- task: The name of the task file without the .yml extension
- env: The list of environments the task should be run in. The default is `dev`, and if you omit this property, it will be run in every environment.

#### Task files
Task files are the files that define the tasks that should be run. The task files should be placed in the `.sensible/tasks` folder in the root of the project.
The tasks should be defined like this:

```yaml
# .sensible/tasks/example.yml
---
name: Example task
description: This is an example task, showing how to define a task
showOutput: true | false # Default is false
script: echo "This is an example task"
```
You can use | to make multiline scripts
```yaml
# .sensible/tasks/example.yml
---
name: Example task 2
description: This is an example task, showing how to define a task
script: |
  echo "This is an example task"
  echo "This is a multiline script"
```
The script part is pure bash script. You can use any bash command in the script.

Tasks has the following properties:
- name: The name of the task
- description: A description of the task
- showOutput: If the output of the task should be shown in the terminal. Default is false
- script: The bash script that should be run
- env: The list of environments the task should be run in. The default is `dev`, and if you omit this property, it will be run in every environment.

#### Using tasks
Use tasks to help setting up parts of your project easily, and document the setup process.

To use the task in your sensible.yml file, you can reference the task like this:

```yaml
# sensible.yml
---
tasks:
  - name: Example task
    task: example
```


## Commands

```
Usage: sensible [options] [command]

A simple sensible tool for your projects

Options:
  --env <string>               Set the environment (default: "dev")
  -f, --sensibleFile <string>    Path to the sensible file
  -d, --sensibleFolder <string>  Path to the sensible folder (default: ".sensible")
  -p, --prod                   Set to production mode (default: false)
  -V, --version                output the version number
  -h, --help                   display help for command

Commands:
  check [options]              Check the project for missing dependencies
  install [options]            Install missing dependencies and requirements
  task <task>                  Manage tasks
  init [options]               Create a new sensible file
  help [command]               display help for command`
```

### `sensible init`
This command creates a new sensible file in the root of your project. It will create a file called `sensible.yml`.


### `sensible check`
This checks the project for missing dependencies. It will check if the packages are installed and if they are in the correct version range. It uses the bash command `command -v` to check if the packages are installed.
To determine the version of the package, it uses the `<command> --version` and `<command> --V` command.

### `sensible install`
This command installs missing dependencies and requirements. It will install the packages that are missing and are in the correct version range.

It will also run the tasks that are defined in the sensible file.
The order of the tasks is important. The tasks will be run in the order they are defined in the sensible file.

The total order of things are like this:

- preTasks
- packages
- requirements
- tasks
- postTasks

### `sensible task`
This command manages the tasks that are defined in your project.

```
Usage: sensible task [command] <task>

Manage tasks

Arguments:
  task                     Task to run

Options:
  -h, --help               display help for command

Commands:
  run [options] <task>     Run a task
  list [options]           List available tasks
  create [options] <task>  Create a new task
```

Tasks will be placed in the `.sensible/tasks` when created, and it looks for them in that folder.

#### `sensible task run`
This will run a single task. Very useful if your project has need to do a lot of things to run it.

The last argument for the command is the name of the task you want to run.

`sensible run task example`

This will run the task `example` in the `.sensible/tasks` folder.

Possible use cases for tasks:
- Setting up a database
- Running migrations
- Running tests
- Running a development server
- Reinstall node dependencies
- Clearing cache files

#### `sensible task list`
This simply lists the tasks that are available in the `.sensible/tasks` folder.


## Environments
The sensible tool supports multiple environments. The default environment is `dev`. You can set the environment with the `--env` flag. 

This means you can have different requirements, packages, and tasks for different environments, and you can name them however you want.

An example of a command that sets the environment to `prod`:

```bash
sensible check --env prod # Check the project for missing dependencies in the prod environment
sensible install --env stage # Install missing dependencies and requirements in the staging environment
```

# Todo

- [ ] Publish to the public npm repository
- [ ] Add tests
