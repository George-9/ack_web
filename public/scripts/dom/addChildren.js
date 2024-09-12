/**
 * A simplified way of appending one or more child to an
 * HTMLElement  
 * 
 * @param {HTMLElement | Node} view an html element [parent in this scope]
 * @param {HTMLElement[] | Node[]} children a list of elements to append to view
 * @version 1.0.0
 * @author George Muigai Njau
 */
export function addChildrenToView(view, children) {
    if (view && (view instanceof HTMLElement || view instanceof Node)) {
        if (children && children.length && children.length > 0) {
            for (let i = 0; i < children.length; i++) {
                const element = children[i];
                if (element && (element instanceof HTMLElement || element instanceof Node)) {
                    view.appendChild(element);
                }
            }
        }
    }
}