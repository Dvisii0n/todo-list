import DomManipulationTools from "./domTools.js";
import datepicker from "js-datepicker";
import { SaveHandler, Board, Task, Project } from "./taskboard.js";

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
        container.removeChild(container.firstChild);
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

            projectContainer.appendChild(
                this.buttonFactory.createRemoveProjectButton()
            );

            taskList.forEach((task) => {
                const taskContainer = this.containerFactory.createTaskContainer(task);
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
    }

    createAddProjectButton() {
        const projectDialog = document.querySelector("#add-project-dialog");
        const button = this.createButton("add-project", "Add project");
        const form = document.querySelector(".project-form");

        button.addEventListener("click", (event) => {
            projectDialog.showModal();

            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);

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

    createRemoveProjectButton() {
        const button = this.createButton("remove-project", "Remove project");
        button.addEventListener("click", (event) => {
            this.board.removeProject(event.target.parentNode.id);
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

    getTaskData(form) {
        const formData = new FormData(form);
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
