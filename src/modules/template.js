import { Task, Project } from "./taskboard"

export default function buildTemplate(board, saveHandler) {

    const project = new Project('My project', 'Do something', saveHandler);
    const task = new Task('My task', 'Do this', 'high', '31/08/2025');
    const task2 = new Task('My task', 'Do this', 'high', '31/08/2025');
    const task3 = new Task('My task', 'Do this', 'low', '31/08/2025');

    board.addProject(project);
    board.addTaskToProject(task, project.id);
    board.addTaskToProject(task2, project.id);
    board.addTaskToProject(task3, project.id);

    const project2 = new Project('My project', 'Do something', saveHandler);
    const task4 = new Task('My task', 'Do this', 'high', '31/08/2025');
    const task5 = new Task('My task', 'Do this', 'low', '31/08/2025');

    board.addProject(project2);
    board.addTaskToProject(task4, project2.id);
    board.addTaskToProject(task5, project2.id);
}