export default class DomManipulationTools {
    constructor() {
        this.body = document.querySelector('body');

    }

    createButton(className, textContent) {
        const button = document.createElement('button');
        button.className = className;
        button.textContent = textContent;
        return button;
    }

    appendToBody(element) {
        this.body.appendChild(element);
    }

    createParagraph(nameOfClass, textContent) {
        const paragraph = document.createElement("p");
        paragraph.className = nameOfClass;
        paragraph.textContent = textContent;
        return paragraph;
    }

    createDiv(nameOfClass) {
        const div = document.createElement("div");
        div.className = nameOfClass;
        return div;
    }

    createContainerWithChilds(containerClass, content) {
        const container = this.createDiv(containerClass);
        const values = Object.values(content);
        values.forEach(val => {
            container.appendChild(val);
        })
        return container;
    }
}
