/**
 * adds a given list of style objects to an element
 * @param { HTMLElement | Node } view the element to add styles to
 * @param { object<string, string>[] } styles the styles
 * 
 * @version 1.0.0
 * @author George Muigai Njau
 */
export function StyleView(view, styles = []) {
    if (view && (view instanceof HTMLElement || view instanceof Node)) {
        if (styles && styles.length && styles.length > 0) {
            for (let i = 0; i < styles.length; i++) {
                const style = styles[i];
                const styleProperty = Object.keys(style)[0];

                view.style[styleProperty] = style[styleProperty];
            }
        }
    }
}


/**
 * adds all the provided classes to a view
 * 
 * @version 1.0.0 
 * @author George Muigai Njau
 */
export function addClasslist(view, classlist = []) {
    if (classlist) {
        if (classlist.length && classlist.length > 0) {
            for (let i = 0; i < classlist.length; i++) {
                view.classList.add(classlist[i])
            }
        }
    }
}