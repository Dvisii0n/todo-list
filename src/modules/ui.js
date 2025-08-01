import DomManipulationTools from "./domTools.js";
import datepicker from "js-datepicker";
import { SaveHandler, Board, Task, Project } from "./taskboard.js";
import { isThisQuarter } from "date-fns";

const placeHolderDate = { day: 31, month: 7, year: 2025 };

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

    createTaskContainer(task) {
        const content = {
            title: this.createParagraph("task-title", `${task.title}`),
            desc: this.createParagraph("task-desc", `${task.description}`),
            priority: this.createParagraph("task-priority", `${task.priority}`),
            date: this.createParagraph("task-date", `${task.dueDate}`),
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
        if (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }

    renderBoard(board) {
        this.clearBoard();
        const data = board.boardData;
        const boardContainer = this.containerFactory.createBoardContainer();
        boardContainer.appendChild(this.buttonFactory.createAddProjectButton());
        const projects = Object.values(data);

        projects.forEach((project) => {
            const taskList = project.taskList;

            const projectContainer =
                this.containerFactory.createProjectContainer(project);

            projectContainer.setAttribute("id", project.id);
            projectContainer.appendChild(this.buttonFactory.createAddTaskButton());
            projectContainer.appendChild(
                this.buttonFactory.createRemoveProjectButton()
            );
            projectContainer.appendChild(
                this.buttonFactory.createEditProjectButton()
            );

            taskList.forEach((task) => {
                const taskContainer = this.containerFactory.createTaskContainer(task);
                taskContainer.setAttribute("index", task.index);
                taskContainer.classList.add(`.${task.priority}-priority`);

                taskContainer.appendChild(this.buttonFactory.createRemoveTaskButton());
                taskContainer.appendChild(this.buttonFactory.createEditTaskButton());

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
        const button = this.createButton("add-project", "Add project");

        button.addEventListener("click", (event) => {
            projectDialog.showModal();
            const form = document.querySelector(".project-form");
            const newForm = this.#refreshForm(form);

            newForm.addEventListener("submit", (event) => {
                event.preventDefault();
                const data = this.formHandler.getProjectData(newForm);
                const project = new Project(
                    data.title,
                    data.description,
                    this.saveHandler
                );
                this.board.addProject(project);
                projectDialog.close();
                uiHandler.renderBoard(this.board);
            });
        });
        return button;
    }

    createEditProjectButton() {
        const projectDialog = document.querySelector("#add-project-dialog");
        const button = this.createButton("edit-project", "Edit project");

        button.addEventListener("click", (event) => {
            projectDialog.showModal();
            const form = document.querySelector(".project-form");
            const newForm = this.#refreshForm(form);

            const projectID = event.target.parentNode.id;

            newForm.addEventListener("submit", (event) => {
                event.preventDefault();
                const newData = this.formHandler.getProjectData(newForm);
                this.board.editProject(projectID, {
                    title: newData.title,
                    description: newData.description,
                });
                projectDialog.close();
                uiHandler.renderBoard(this.board);
            });
        });
        return button;
    }

    createRemoveProjectButton() {
        const button = this.createButton("remove-project", "Remove project");
        button.addEventListener("click", (event) => {
            this.board.removeProject(event.target.parentNode.id);
            uiHandler.renderBoard(this.board);
        });
        return button;
    }

    createAddTaskButton() {
        const taskDialog = document.querySelector("#add-task-dialog");
        const button = this.createButton("add-task", "Add task");

        button.addEventListener("click", (event) => {
            taskDialog.showModal();

            const form = document.querySelector(".task-form");
            const newForm = this.#refreshForm(form, true);

            const projectID = event.target.parentNode.id;
            newForm.addEventListener("submit", (event) => {
                event.preventDefault();
                const data = this.formHandler.getTaskData(newForm);
                const task = new Task(
                    data.title,
                    data.description,
                    data.priority,
                    data.dueDate
                );
                this.board.addTaskToProject(task, projectID);
                taskDialog.close();
                uiHandler.renderBoard(this.board);
            });
        });
        return button;
    }

    createEditTaskButton() {
        const taskDialog = document.querySelector("#add-task-dialog");
        const button = this.createButton("edit-task", "Edit task");
        button.addEventListener("click", (event) => {
            taskDialog.showModal();

            const form = document.querySelector(".task-form");
            const newForm = this.#refreshForm(form, true);

            const projectID = event.target.parentNode.parentNode.id;
            const taskIndex = event.target.parentNode.getAttribute("index");

            newForm.addEventListener("submit", (event) => {
                event.preventDefault();
                const newData = this.formHandler.getTaskData(newForm);

                this.board.editTaskFromProject(taskIndex, projectID, {
                    title: newData.title,
                    description: newData.description,
                    priority: newData.priority,
                    dueDate: newData.dueDate,
                });
                taskDialog.close();

                uiHandler.renderBoard(this.board);
            });
        });
        return button;
    }

    createRemoveTaskButton() {
        const button = this.createButton("remove-task", "Remove task");
        button.addEventListener("click", (event) => {
            const projectID = event.target.parentNode.parentNode.id;
            const taskIndex = event.target.parentNode.getAttribute("index");
            this.board.removeTaskFromProject(taskIndex, projectID);
            uiHandler.renderBoard(this.board);
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

const board = new Board(new SaveHandler(), "My board");
const uiHandler = new UiHandler(
    new ContainerFactory(),
    new ButtonFactory(new SaveHandler(), new FormHandler(), board)
);

uiHandler.renderBoard(board);

export {
    SaveHandler,
    FormHandler,
    Board,
    UiHandler,
    ContainerFactory,
    ButtonFactory,
};
