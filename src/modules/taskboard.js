import { format } from "date-fns";
import Logger from "./logger.js"

const logger = new Logger();

class Board {
    constructor() {
        this.boardObj = {};
    }


    addProject(project) {
        this.boardObj[project.id] = project;
        logger.log(project, "Added project to board");
        logger.log(this.boardObj, "Updated boardObj");
    }


}

class Task {
    constructor(title, description, priority) {
        this.title = title;
        this.description = description;
        this.dueDate = this.setDueDate();
        this.priority = priority;
        this.done = false;

    }

    setDueDate() {
        return format(new Date(), 'dd/MM/yyyy');

    }

}

class Project {
    constructor(title, description) {
        this.title = title;
        this.description = description;
        this.taskList = [];
        this.id = crypto.randomUUID();

    }

    addTask(task) {
        this.taskList.push(task);
        logger.log(task, `Added task to project "${this.title}"`);
        logger.log(board.boardObj, "Updated boardObj");
    }

}


const board = new Board();

const project = new Project("Todo List", "desc");

board.addProject(project);

const task = new Task("Clean", "desc", "high");
const task2 = new Task("Walk", "desc", "high");
const task3 = new Task("Run", "desc", "high");

project.addTask(task);
project.addTask(task2);
project.addTask(task3);



