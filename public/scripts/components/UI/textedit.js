import { domCreate } from "../../dom/query.js";
import { StyleView } from "../utils/stylus.js";

/**
 * A simplified and somehow opinionated text entry view
 * 
 * @version 1.0.0
 * @author George Muigai Njau
 */
export function TextEdit({
    placeholder = '',
    width,
    styles = [],
    onType = new Function(),
    onSubmit = new Function(),
    type = '',
    keyboardType = ''
}) {
    const input = domCreate('input');
    input.setAttribute('type', type ?? 'text');
    input.placeholder = placeholder ?? '';
    input.style.width = width || '-webkit-fill-available';
    input.style.padding = '10px';
    input.style.margin = '5px';

    // null better than undefined, rule of the thumb
    StyleView(input, styles);

    if (type) {
        input.setAttribute('type', `${type}`);
    }

    // if (type === 'checkbox') {
    //     input.style = 'none';

    //     input.addEventListener('change', function (ev) {
    //         if (input.checked) {
    //             input.checked = false;
    //             input.setAttribute('checked', false);
    //         } else {
    //             input.checked = true;
    //             input.setAttribute('checked', false);
    //         }
    //     });

    //     input.addEventListener('click', function (ev) {
    //         ev.preventDefault();
    //         if (input.checked) {
    //             input.setAttribute('checked', false);
    //         } else {
    //             input.setAttribute('checked', true);
    //         }
    //         console.log(input.checked);
    //     });

    //     return input;
    // }

    if (type === 'date' || input.getAttribute('type') === 'date') {
        input.addEventListener('click', function () {
            input.focus();
            input.showPicker();
        });
    }

    if (type === 'number') {
        input.addEventListener('input', function (ev) {
            ev.preventDefault();
            function reset() {
                if (!input.value && isNaN(parseFloat(input.value)) || input.value.length === 1) {
                    input.value = '';
                }
                input.value = input.value.substring(0, (input.value.length - 1))
            }
            if (keyboardType && keyboardType === 'number') {
                if (input.value) {
                    if (input.value[input.value.length - 1] === '.' && input.value[input.value.length - 2] === '.') {
                        reset();
                    }
                    if (parseFloat(input.value) && ((`${parseFloat(input.value)}`.length !== input.value.length))) {
                        reset();
                    }
                }
                input.value = parseFloat(input.value) || '';
            }
            onType(ev);
        });
        input.addEventListener('submit', onSubmit ?? null);
        return input;
    }

    return input;
}