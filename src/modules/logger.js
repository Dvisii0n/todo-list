import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

export default class Logger {

    #getCurrentDate() {
        const timestamp = new TZDate(new Date(), "-07:00")
        return `${format(timestamp, "hh:mm:ss")}`
    }

    log(msg, obj) {
        console.log(`${this.#getCurrentDate()} - ${msg}`);
        if (obj) {
            console.log(obj);
        }


    }

}