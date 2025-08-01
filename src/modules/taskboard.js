import Logger from "./logger.js";

class SaveHandler extends Logger {
    constructor() {
        super();
    }

    saveChanges(data, saveName) {
        localStorage.setItem(`${saveName}`, JSON.stringify(data));
        this.log("Saved Changes", data);
    }

    deleteBoard(saveName) {
        localStorage.removeItem(saveName);
        this.log(`Deleted ${saveName}`);
    }

    loadSave(saveName) {
        const save = JSON.parse(localStorage.getItem(saveName));
        if (save === null) {
            this.log("No save detected");
        } else {
            this.log("Save loaded", save);
            return save;
        }
    }
}

class Board extends Logger {
    constructor(saveHandler, saveName) {
        super();
        this.name = saveName;
        this.saveHandler = saveHandler;
        this.boardData = this.#setBoardData();
    }

    #setBoardData() {
        const save = this.saveHandler.loadSave(this.name);
        if (save) {
            return save;
        } else {
            return {};
        }
    }

    addProject(project) {
        this.boardData[project.id] = project;
        this.log(`Added project <${project.title}> to board`);
        this.#saveChanges();
    }

    editProject(projectID, newData) {
        const project = this.boardData[projectID];
        project.title = newData.title;
        project.description = newData.description;
        this.log(`Edited project <${project.title}>`);
        this.#saveChanges();
    }

    removeProject(projectID) {
        delete this.boardData[projectID];
        this.log(`Removed <${projectID}> from board`);
        this.#saveChanges();
    }

    #saveChanges() {
        this.saveHandler.saveChanges(this.boardData, this.name);
    }

    addTaskToProject(task, projectID) {
        const project = this.boardData[projectID];
        project.taskList.push(task);
        task.index = project.taskList.indexOf(task);
        this.log(`Added task <${task.title}> to project <${project.title}>`);
        this.#saveChanges();
    }

    editTaskFromProject(taskIndex, projectID, newData) {
        const project = this.boardData[projectID];
        const taskList = project.taskList;
        const task = taskList[taskIndex];
        task.title = newData.title;
        task.description = newData.description;
        task.priority = newData.priority;
        task.dueDate = newData.dueDate;
        this.log(`Edited task <${task.title}> from project <${project.title}>`);
        this.#saveChanges();
    }

    removeTaskFromProject(taskIndex, projectID) {
        const project = this.boardData[projectID];
        const task = project.taskList[taskIndex];
        project.taskList.splice(project.taskList.indexOf(task), 1);
        this.log(`Deleted task <${task.title}> from project <${project.title}>`);
        this.#saveChanges();
    }

    markTaskAsDone(taskIndex, projectID) {
        const project = this.boardData[projectID];
        project.taskList[taskIndex].done = true;
        this.log("Task done status changed to true");
        this.#saveChanges();
    }
}

class Task {
    constructor(title, description, priority, dueDate) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.done = false;
        this.index = null;
    }
}

class Project extends Logger {
    constructor(title, description, saveHandler) {
        super();
        this.saveHandler = saveHandler;
        this.title = title;
        this.description = description;
        this.taskList = [];
        this.id = crypto.randomUUID();
    }
}

export { SaveHandler, Board, Task, Project };
