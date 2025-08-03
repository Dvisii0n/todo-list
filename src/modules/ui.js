import DomManipulationTools from "./domTools.js";
import datepicker from "js-datepicker";
import { SaveHandler, Board, Task, Project } from "./taskboard.js";
import buildTemplate from "./template.js";

class ContainerFactory extends DomManipulationTools {
    constructor() {
        super();
    }

    createBoardContainer() {
        return this.createDiv("board-container");
    }

    createProjectContainer(project) {
        const content = {
            title: this.createParagraph("project-title", `${project.title}`),
            desc: this.createParagraph("project-desc", `${project.description}`),
        };
        return this.createContainerWithChilds("project-container", content);
    }

    createButtonsContainer() {
        return this.createDiv("taskboard-buttons");
    }

    createProjectButtonsContainer() {
        return this.createDiv("project-buttons");
    }

    createTaskButtonsContainer() {
        return this.createDiv("task-buttons");
    }

    createTaskContainer(task) {
        const content = {
            priority: this.createParagraph(
                "task-priority",
                `${task.priority === "high" ? "High" : "Low"} priority`
            ),
            title: this.createParagraph("task-title", `${task.title}`),
            desc: this.createParagraph("task-desc", `${task.description}`),
            date: this.createParagraph(
                "task-date",
                `Due on
                 ${task.dueDate}`
            ),
        };
        return this.createContainerWithChilds("task-container", content);
    }
}

class UiHandler extends DomManipulationTools {
    constructor(containerFactory, buttonFactory) {
        super();
        this.containerFactory = containerFactory;
        this.buttonFactory = buttonFactory;
    }

    clearBoard() {
        const boardContainer = document.querySelector(".board-container");
        if (boardContainer) {
            container.removeChild(boardContainer);
        }
    }

    initialize() {
        const buttonsContainer = this.containerFactory.createButtonsContainer();
        buttonsContainer.appendChild(this.buttonFactory.createAddProjectButton());
        container.appendChild(buttonsContainer);
    }

    renderBoard(board) {
        this.clearBoard();
        const data = board.boardData;
        const boardContainer = this.containerFactory.createBoardContainer();

        const projects = Object.values(data);

        projects.forEach((project) => {
            //project container creation
            const projectContainer =
                this.containerFactory.createProjectContainer(project);

            const projectButtons =
                this.containerFactory.createProjectButtonsContainer();

            projectContainer.setAttribute("id", project.id);
            projectButtons.appendChild(this.buttonFactory.createAddTaskButton());
            projectButtons.appendChild(
                this.buttonFactory.createRemoveProjectButton()
            );
            projectButtons.appendChild(this.buttonFactory.createEditProjectButton());

            projectContainer.appendChild(projectButtons);

            //task container creation
            const taskList = project.taskList;
            taskList.forEach((task) => {
                const taskContainer = this.containerFactory.createTaskContainer(task);
                const taskButtons = this.containerFactory.createTaskButtonsContainer();
                taskContainer.setAttribute("index", task.index);
                taskContainer.classList.add(`${task.priority}-priority`);
                if (task.done) {
                    taskContainer.classList.add(`done`);
                }

                taskButtons.appendChild(
                    this.buttonFactory.createMarkAsDoneCheckbox(task.index, task.done)
                );
                taskButtons.appendChild(this.buttonFactory.createRemoveTaskButton());
                taskButtons.appendChild(this.buttonFactory.createEditTaskButton());

                taskContainer.appendChild(taskButtons);

                projectContainer.appendChild(taskContainer);
            });
            boardContainer.appendChild(projectContainer);
        });

        container.appendChild(boardContainer);
    }
}

class ButtonFactory extends DomManipulationTools {
    constructor(saveHandler, formHandler, board) {
        super();
        this.saveHandler = saveHandler;
        this.formHandler = formHandler;
        this.board = board;
        this.body = document.querySelector("body");
    }

    #refreshForm(form, isTask) {
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        if (isTask) {
            datepicker("#date-picker", {
                formatter: (input, date) => {
                    const value = date.toLocaleDateString("en-GB");
                    console.log(value);
                    input.value = value; // => 'dd/mm/yyyy'
                },
            });
        }
        return newForm;
    }

    createAddProjectButton() {
        const projectDialog = document.querySelector("#add-project-dialog");
        const button = this.createButton("add-project", "Add Project");
        button.addEventListener("click", (event) => {
            projectDialog.showModal();
            const form = document.querySelector(".project-form");
            const newForm = this.#refreshForm(form);

            const cancelButton = document.querySelector(".project-cancel");
            cancelButton.addEventListener("click", (event) => {
                projectDialog.close();
            });

            newForm.addEventListener("submit", (event) => {
                event.preventDefault();
                const data = this.formHandler.getProjectData(newForm);
                const project = new Project(
                    data.title,
                    data.description,
                    this.saveHandler
                );
                board.addProject(project);
                projectDialog.close();
                uiHandler.renderBoard(board);
            });
        });
        return button;
    }

    createEditProjectButton() {
        const projectDialog = document.querySelector("#add-project-dialog");
        const button = this.createButton("edit-project");

        button.addEventListener("click", (event) => {
            projectDialog.showModal();
            const form = document.querySelector(".project-form");
            const newForm = this.#refreshForm(form);

            const cancelButton = document.querySelector(".project-cancel");
            cancelButton.addEventListener("click", (event) => {
                projectDialog.close();
            });

            const projectID = event.target.parentNode.parentNode.id;

            newForm.addEventListener("submit", (event) => {
                event.preventDefault();
                const newData = this.formHandler.getProjectData(newForm);
                board.editProject(projectID, {
                    title: newData.title,
                    description: newData.description,
                });
                projectDialog.close();
                uiHandler.renderBoard(board);
            });
        });
        return button;
    }

    createRemoveProjectButton() {
        const button = this.createButton("remove-project");

        button.addEventListener("click", (event) => {
            const projectID = event.target.parentNode.parentNode.id;
            board.removeProject(projectID);
            uiHandler.renderBoard(board);
        });
        return button;
    }

    createAddTaskButton() {
        const taskDialog = document.querySelector("#add-task-dialog");
        const button = this.createButton("add-task");

        button.addEventListener("click", (event) => {
            taskDialog.showModal();

            const form = document.querySelector(".task-form");
            const newForm = this.#refreshForm(form, true);

            const cancelButton = document.querySelector(".task-cancel");
            cancelButton.addEventListener("click", (event) => {
                taskDialog.close();
            });

            const projectID = event.target.parentNode.parentNode.id;
            newForm.addEventListener("submit", (event) => {
                event.preventDefault();
                const data = this.formHandler.getTaskData(newForm);
                const task = new Task(
                    data.title,
                    data.description,
                    data.priority,
                    data.dueDate
                );
                board.addTaskToProject(task, projectID);
                taskDialog.close();
                uiHandler.renderBoard(board);
            });
        });
        return button;
    }

    createMarkAsDoneCheckbox(taskIndex, doneStatus) {
        const checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("name", "checkbox");

        if (doneStatus) {
            checkbox.setAttribute("checked", "");
        } else {
            checkbox.removeAttribute("checked");
        }

        checkbox.setAttribute("index", `${taskIndex}`);

        checkbox.addEventListener("change", (event) => {
            const projectID = event.target.parentNode.parentNode.parentNode.id;
            const taskIndex = event.target.getAttribute("index");
            if (checkbox.checked) {
                board.markTaskAsDone(taskIndex, projectID);
                uiHandler.renderBoard(board);
            } else {
                board.markTaskAsUndone(taskIndex, projectID);
                uiHandler.renderBoard(board);
            }
        });
        return checkbox;
    }

    createEditTaskButton() {
        const taskDialog = document.querySelector("#add-task-dialog");
        const button = this.createButton("edit-task");
        button.addEventListener("click", (event) => {
            taskDialog.showModal();

            const form = document.querySelector(".task-form");
            const newForm = this.#refreshForm(form, true);

            const cancelButton = document.querySelector(".task-cancel");
            cancelButton.addEventListener("click", (event) => {
                taskDialog.close();
            });

            const projectID = event.target.parentNode.parentNode.parentNode.id;
            const taskIndex =
                event.target.parentNode.parentNode.getAttribute("index");

            newForm.addEventListener("submit", (event) => {
                event.preventDefault();
                const newData = this.formHandler.getTaskData(newForm);

                board.editTaskFromProject(taskIndex, projectID, {
                    title: newData.title,
                    description: newData.description,
                    priority: newData.priority,
                    dueDate: newData.dueDate,
                });
                taskDialog.close();

                uiHandler.renderBoard(board);
            });
        });
        return button;
    }

    createRemoveTaskButton() {
        const button = this.createButton("remove-task");
        button.addEventListener("click", (event) => {
            const projectID = event.target.parentNode.parentNode.parentNode.id;
            const taskIndex =
                event.target.parentNode.parentNode.getAttribute("index");
            board.removeTaskFromProject(taskIndex, projectID);
            uiHandler.renderBoard(board);
        });
        return button;
    }
}

class FormHandler {
    constructor() { }

    getProjectData(newForm) {
        const formData = new FormData(newForm);
        return {
            title: formData.get("title"),
            description: formData.get("desc"),
        };
    }

    getTaskData(newForm) {
        const formData = new FormData(newForm);
        return {
            title: formData.get("title"),
            description: formData.get("desc"),
            priority: formData.get("priority"),
            dueDate: formData.get("date"),
        };
    }
}

const container = document.querySelector(".taskboard");
const saveHandler = new SaveHandler();

const board = new Board(saveHandler, "User board");
const uiHandler = new UiHandler(
    new ContainerFactory(),
    new ButtonFactory(saveHandler, new FormHandler())
);

if (localStorage.length === 0) {
    buildTemplate(board, saveHandler);
}

uiHandler.initialize();
uiHandler.renderBoard(board);

export { Board, UiHandler };
