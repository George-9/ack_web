import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate } from "../../dom/query.js";
import { addClasslist, StyleView } from "../utils/stylus.js";


/**
 * A row that takes common values as params 
 * @returns { HTMLElement } an unopinionated horizontal view of views
 */
export function Row({ classlist = [], styles = {}, children = [], }) {
    const div = domCreate('div');
    div.classList.add('fx-row');

    addClasslist(div, classlist)
    StyleView(div, styles);
    addChildrenToView(div, children);

    return div;
}
