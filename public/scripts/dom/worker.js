export function work(callback = new Function()) {
    document.addEventListener('DOMContentLoaded', function () {
        if (callback && typeof callback === 'function') {
            callback();
        }
    })
}
