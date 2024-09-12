import { addChildrenToView } from "../../dom/addChildren.js";
import { addClasslist, StyleView } from "../utils/stylus.js";
import { domCreate } from "../../dom/query.js";

/**
 * A row that is scrollable and takes common
 *  values as params for further customization 
 * 
 * @returns { HTMLElement } an unopinionated horizontal view of scrollable views
 * @author George Muigai Njau
 */
export function HorizontalScrollView({ classlist = [], styles = {}, children = [], }) {
    const div = domCreate('div');
    div.classList.add('f-w', 'fx-row', 'scroll-x');

    addClasslist(div, classlist);
    StyleView(div, styles)
    addChildrenToView(div, children)

    return div;
}
