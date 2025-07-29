import { Board, Task, Project } from "./taskboard.js";
import DomManipulationTools from "./domTools.js";
import datepicker from "js-datepicker";

class BoardContainer extends DomManipulationTools {
    constructor(name) {
        super();
        this.buttons = new ButtonMethods();
        this.board = new Board(name);
        this.container = this.createDiv("board-container");
        this.appendToBody(this.container);

        this.container.appendChild(buttons.addProjectToBoard(this));
    }

    addProjectContainer(projectContainer) {
        this.board.addProject(projectContainer.project);
        this.container.appendChild(projectContainer.container);
    }

    removeProjectContainer(projectContainer) {
        this.board.removeProject(projectContainer.project);
        this.container.removeChild(projectContainer.container);
    }

    loadContent() {
        this.board.populate();
        const values = Object.values(this.board.boardObj);
        for (let project of values) {
            console.log(project);
            const projectContainer = new ProjectContainer(
                project.title,
                project.description
            );
            const taskList = project.taskList;
            projectContainer.loadTasks(taskList);
            this.container.appendChild(projectContainer.container);
        }
    }
}

class ProjectContainer extends DomManipulationTools {
    constructor(title, description) {
        super();
        this.project = new Project(title, description);
        this.content = {
            title: this.createParagraph("project-title", this.project.title),
            description: this.createParagraph(
                "project-description",
                this.project.description
            ),
        };
        this.container = this.createContainerWithChilds(
            "project-container",
            this.content
        );
        this.container.id = crypto.randomUUID();

        this.container.appendChild(buttons.removeProjectFromBoard(board, this));
        this.container.appendChild(buttons.addTaskToProject(this));
    }

    addTaskContainer(taskContainer) {
        this.project.addTask(taskContainer.task);
        this.loadTasks(this.project.taskList);
    }

    removeTaskContainer(taskContainer) {
        this.project.removeTask(taskContainer.task);
        this.loadTasks(this.project.taskList);
    }

    clearTaskContainers() {
        const containers = this.container.querySelectorAll(".task-container");
        containers.forEach((task) => {
            this.container.removeChild(task);
        });
    }

    loadTasks(taskList) {
        this.clearTaskContainers();
        taskList.forEach((task) => {
            let taskContainer = new TaskContainer(
                task.title,
                task.description,
                task.priorityTxt,
                task.dateObj,
                this
            );
            this.container.appendChild(taskContainer.container);
        });
    }
}

class TaskContainer extends DomManipulationTools {
    constructor(title, description, priority, dateObj, parentProject) {
        super();
        this.task = new Task(title, description, priority, dateObj);
        this.content = {
            title: this.createParagraph("task-title", this.task.title),
            description: this.createParagraph(
                "task-description",
                this.task.description
            ),
            priorityTxt: this.createParagraph("task-priority", this.task.priorityTxt),
            dueDate: this.createParagraph("task-dueDate", this.task.dueDate),
        };

        this.container = this.createContainerWithChilds(
            "task-container",
            this.content
        );
        this.container.appendChild(
            buttons.removeTaskFromProject(this, parentProject)
        );
    }
}

class ButtonMethods extends DomManipulationTools {
    constructor() {
        super();
    }

    addProjectToBoard(board) {
        const dialogBtn = this.createButton("add-project", "Add Project");
        const dialog = document.querySelector("#add-project-dialog");

        dialogBtn.addEventListener("click", (event) => {
            dialog.showModal();
        });

        const form = document.querySelector(".project-form");

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            const projectContainer = new ProjectContainer(
                formData.get("title"),
                formData.get("desc")
            );
            board.addProjectContainer(projectContainer);
            dialog.close();
        });
        return dialogBtn;
    }

    removeProjectFromBoard(board, projectContainer) {
        const removeBtn = this.createButton("remove-project", "Remove Project");
        removeBtn.addEventListener("click", (event) => {
            board.removeProjectContainer(projectContainer);
        });
        return removeBtn;
    }

    addTaskToProject(projectContainer) {
        const dialogBtn = this.createButton("add-task", "Add Task");
        const dialog = document.querySelector("#add-task-dialog");

        dialogBtn.addEventListener("click", (event) => {
            dialog.showModal();
            const form = document.querySelector(".task-form");
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);

            const dateSetter = new DateSetter();

            newForm.addEventListener("submit", (event) => {
                event.preventDefault();

                const formData = new FormData(newForm);
                const dateObj = dateSetter.createDateObj(formData);
                const args = {
                    title: formData.get("title"),
                    desc: formData.get("desc"),
                    priority: formData.get("priority"),
                    dateObj: dateObj,
                };
                const taskContainer = new TaskContainer(
                    args.title,
                    args.desc,
                    args.priority,
                    args.dateObj,
                    projectContainer
                );
                projectContainer.addTaskContainer(taskContainer);
                dialog.close();
            });
        });

        return dialogBtn;
    }

    removeTaskFromProject(taskContainer, projectContainer) {
        const removeBtn = this.createButton("remove-task", "Remove Task");
        removeBtn.addEventListener("click", (event) => {
            projectContainer.removeTaskContainer(taskContainer);
        });
        return removeBtn;
    }
}

class DateSetter {
    constructor() {
        const pickerInput = document.querySelector("#date-picker");
        const picker = datepicker(pickerInput, {
            formatter: (input, date, instance) => {
                const value = date.toLocaleDateString();
                input.value = value;
            },
        });
    }

    createDateObj(formData) {
        const dateComponents = formData.get("picker").split("/");
        return {
            day: dateComponents[1],
            month: dateComponents[0],
            year: dateComponents[2],
        };
    }
}

const buttons = new ButtonMethods();

const board = new BoardContainer("My Board");

export { BoardContainer, ProjectContainer, TaskContainer, ButtonMethods };
