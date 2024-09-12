export class Logger {
    constructor() { }

    static log(data) {
        if (!process.env || !(process.env['debug'] && (process.env['debug'] === 'true'))) {
            return;
        }

        console.log(data);
    }
}