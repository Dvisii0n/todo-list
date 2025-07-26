import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

export default class Logger {

    #getCurrentDate() {
        const timestamp = new TZDate(new Date(), "-07:00")
        return `${format(timestamp, "hh:mm:ss")}`
    }

    log(obj, msg) {
        console.log(`${this.#getCurrentDate()} - ${msg}`);
        console.log(obj);
        console.log("---------------------------------------------")

    }

}