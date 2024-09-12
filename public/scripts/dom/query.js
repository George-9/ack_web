export function domQuery(tag) {
    if (tag && typeof tag === 'string') {
        return document.querySelector(tag)
    }
}

export function domQueryAll(tag) {
    if (tag && typeof tag === 'string') {
        return document.querySelectorAll(tag)
    }
}

export function domQueryById(id) {
    if (id && typeof id === 'string') {
        return document.getElementById(id)
    }
}

export function domCreate(tag) {
    if (tag && typeof tag === 'string') {
        return document.createElement(tag);
    }
}