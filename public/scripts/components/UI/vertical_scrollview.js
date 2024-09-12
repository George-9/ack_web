import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate } from "../../dom/query.js";
import { addClasslist, StyleView } from "../utils/stylus.js";


/**
 * A <strong>Scrollable</strong> Column that takes common values as params 
 * 
 * @returns { HTMLElement } an unopinionated vertical view of views
 * @author George Muigai Njau
 */
export function VerticalScrollView({ classlist = [], styles = {}, children = [], }) {
    const div = domCreate('div');
    div.classList.add('fx-col', 'scroll-y');

    addClasslist(div, classlist)
    StyleView(div, styles);

    addChildrenToView(div, children);

    return div;
}