/**
 * Retrieves the first part of an email address
 * 
 * @param {string} email an email address string(what's expected)
 * @returns the first part of an email address
 * 
 * @author George Muigai Njau
 */
export function trimEmail(email = '') {
    if ((email.includes('@'))) {
        return email.substring(0, email.indexOf('@'));
    }
}


/**
 * Validates a string
 * 
 * @param {string} string the string to check
 * @returns true if string is null or is just whitespace
 * @author George Muigai Njau
 */
export function IS_EMPTY_OR_WHITE(string) {
    return (
        !string || ((typeof string === 'string') && string.trim().length < 1)
    )
}