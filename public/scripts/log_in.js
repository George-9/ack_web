import { Post } from "./net_tools.js";

/**
 * Logs in the Church
 * 
 * @param {string} detail either email or church-code
 * @param {string} password church password
 */
export function ChurchLogIn(email, password) {
    return Post('/church/log/in', {
        email: email,
        password: password
    },
        { 'requiresChurchDetails': false }
    );
}