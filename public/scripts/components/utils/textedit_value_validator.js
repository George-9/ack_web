import { IS_EMPTY_OR_WHITE } from "../../../global_tools/string_tools.js";

export class TextEditValueValidator {
    static validate(fieldName, textEdit) {
        if (IS_EMPTY_OR_WHITE(textEdit.value)) {
            throw new TextEditError(`empty field ${fieldName}`);
        }
    }
}

export class TextEditError extends Error {
    constructor(errorMessege) {
        super(errorMessege);
    }
}