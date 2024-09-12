import { TextEdit } from "../components/UI/cool_tool_ui.js";

/**
 * clears the values of a TextEdit
 * @param {TextEdit []} textEdits
 * @author George Muigai Njau
 */
export function clearTextEdits(textEdits = []) {
    if (textEdits && textEdits.length && textEdits.length > 0) {
        for (let i = 0; i < textEdits.length; i++) {
            const textEdit = textEdits[i];
            if (textEdit && (textEdit instanceof HTMLInputElement || textEdit instanceof HTMLSelectElement)) {
                textEdit.innerText = ''
                textEdit.value = ''
            }
        }
    }
}