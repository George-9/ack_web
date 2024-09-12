import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate } from "../../dom/query.js";
import { addClasslist, StyleView } from "../utils/stylus.js";


/**
 * A Grid that takes common values as params 
 * 
 * @returns { HTMLElement } an unopinionated Grid-View of views
 * @author George Muigai Njau
 */
export function GridView({ classlist = [], styles = {}, children = [], }) {
    const div = domCreate('div');
    div.classList.add('grid');

    addClasslist(div, classlist);
    StyleView(div, styles);
    addChildrenToView(div, children);

    return div;
}
