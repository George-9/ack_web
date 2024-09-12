import { domCreate } from "../../dom/query.js";
import { StyleView } from "../utils/stylus.js";


/**
 * A simple text element
 * @returns { HTMLElement } an unopinionated paragraph
 * @author George Muigai Njau
 */
export function MondoText({ text = '', styles = [] }) {
    var par = domCreate('p');
    par.style.margin = '3px';
    par.innerText = text;

    StyleView(par, styles)

    return par;
}

export function MondoBigH3Text({ text = '', styles = [] }) {
    var par = domCreate('h3');
    par.style.margin = '3px';
    par.innerText = text;

    StyleView(par, styles)

    return par;
}


