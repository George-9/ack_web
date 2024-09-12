/**
 * a class that runs every few seconds and runs a callback
 * with the required actions, say like updating the data of a grid
 */
export class RUNNER {
    callback = new Function('console.log', '"running runner"');
    constructor(callback) {
        this.callback = callback;

        if (callback && (typeof callback === 'function')) {
            setTimeout(() => {
                callback();
            }, 1200);
        }
    }
}