import {Comick} from "../comick/comick";

class Main {
    static main() {
        const test = new Comick();
        test.search('one piece').then(data => {
            console.log(data);
        });
    }
}

Main.main();
