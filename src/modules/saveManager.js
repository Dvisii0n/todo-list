

export default class SaveManager {
    constructor() {

    }

    storageIsEmpty() {
        return localStorage.length === 0 ? true : false;

    }

    deleteSave(key) {
        localStorage.removeItem(key);
    }

    save(key, obj) {
        localStorage.setItem(`${key}`, JSON.stringify(obj));
    }

    getSave(key) {
        return localStorage.getItem(key);
    }

}