import { format } from "date-fns";
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

    removeProject(projectID) {
        delete this.boardData[projectID];
        this.log(`Removed <${projectID}> from board`);
        this.#saveChanges();
    }

    #addByPriority(task, project) {
        const priority = task.priority.toLowerCase();
        if (priority === "high") {
            project.taskList.splice(0, 0, task);
        } else if (priority === "low") {
            project.taskList.push(task);
        } else {
            throw new Error("Invalid priority, must be 'high' or 'low'");
        }
    }

    #saveChanges() {
        this.saveHandler.saveChanges(this.boardData, this.name);
    }

    addTaskToProject(task, projectID) {
        const project = this.boardData[projectID];
        this.#addByPriority(task, project);
        this.log(`Added task <${task.title}> to project <${project.title}>`);
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
    constructor(title, description, priority, dateObj) {
        this.title = title;
        this.description = description;
        this.dateObj = dateObj;
        this.dueDate = this.#setDueDate(this.dateObj);
        this.priority = priority;
        this.done = false;
    }

    #setDueDate(date) {
        return format(new Date(date.year, date.month - 1, date.day), "dd/MM/yyyy");
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
