import { format } from "date-fns";
import Logger from "./logger.js"
import SaveManager from "./saveManager.js";


const saveManager = new SaveManager();

class Board extends Logger {
    constructor(name) {
        super();
        this.name = name;
        this.boardObj = {};
    }

    addProject(project) {
        this.boardObj[project.title] = project;
        this.log(project, `Added project <${project.title}> to board`);
        this.log(this.boardObj, "Updated boardObj");
    }

    removeProject(project) {
        delete this.boardObj[project.id];
        this.log(this.boardObj, `Removed <${project.title}> from board`)

    }

    load() {
        const save = saveManager.getSave(this.name);
        this.log(save, "Save loaded");
        return save;

    }

    save() {
        saveManager.save(this.name, this.boardObj);
    }

    delete() {
        saveManager.deleteSave(this.name);
    }

    populate() {
        this.boardObj = this.load();

    }


}

class Task {
    constructor(title, description, priority, dateObj) {
        this.title = title;
        this.description = description;
        this.date = dateObj;
        this.dueDate = this.#setDueDate(this.date);
        this.priority = priority;
        this.done = false;

    }

    #setDueDate(date) {
        return format(new Date(date.year, date.month, date.day), 'dd/MM/yyyy');

    }


}

class Project extends Logger {
    constructor(title, description) {
        super();
        this.title = title;
        this.description = description;
        this.taskList = [];
        this.id = crypto.randomUUID();

    }

    addByPriority(task) {
        const priority = task.priority;
        if (priority === "high") {
            this.taskList.splice(0, 0, task);
        } else if (priority === "low") {
            this.taskList.push(task);
        } else {
            throw new Error("Invalid priority")
        }
    }

    addTask(task) {
        this.addByPriority(task);
        this.log(this.taskList, `Added task <${task.title}> to project <${this.title}>`);
    }

    removeTask(task) {
        this.taskList.splice(this.taskList.indexOf(task), 1);
        this.log(this.taskList, `Deleted task <${task.title}> from project <${this.title}>`);
    }

    markTaskAsDone(task) {
        const index = this.taskList.indexOf(task);
        this.taskList[index].done = true;
        this.log(this.taskList[index], "Task done status changed to true");
    }
}

export { Board, Task, Project }









