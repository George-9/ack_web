import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate } from "../../dom/query.js";
import { addClasslist, StyleView } from "../utils/stylus.js";


/**
 * A Column that takes common values as params 
 * 
 * @returns { HTMLElement } an unopinionated vertical view of views
 * @author George Muigai Njau
 */
export function Column({ classlist = [], styles = {}, children = [], }) {
    const div = domCreate('div');
    div.classList.add('fx-col');

    addClasslist(div, classlist);
    StyleView(div, styles);
    addChildrenToView(div, children);

    return div;
}
