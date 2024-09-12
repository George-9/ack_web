import { domQueryById } from "../../dom/query.js";
import { Row } from "../UI/cool_tool_ui.js";

/**
 * UI for displaying views for that display important
 * shortlived messeges 
 */
export class MessegePopup {
    static #showingPopUps = false;

    constructor() { }

    static showMessegePuppy(children = []) {
        const popupId = 'msg-pop-up';

        function hidePopup() {
            let showingPopUp = domQueryById(popupId);

            if (showingPopUp) {
                document.body.removeChild(showingPopUp);
            }
        }

        if (MessegePopup.#showingPopUps) {
            setTimeout(function () {
                hidePopup();
                MessegePopup.#showingPopUps = false;
            }, 100);
        } else {
            let row = Row({ 'children': children });
            row.id = popupId;
            row.style.width = '300px'
            row.style.height = '50px';
            row.style.backgroundColor = 'black';
            row.style.color = 'white';
            row.style.borderRadius = '12px';
            row.style.position = 'absolute';
            row.style.outline = '1px solid grey';
            row.style.zIndex = '100';
            row.classList.add('fx-col', 'just-center', 'txt-c', 'a-e')
            row.style.left = `${(parseInt(window.innerWidth) / 2) - (parseFloat(row.style.width) / 2)}px`;
            row.style.bottom = `${(parseFloat(row.style.height) / 2)}px`;

            if (document.body.appendChild(row)) {
                setTimeout(function () {
                    hidePopup();
                    MessegePopup.#showingPopUps = true;
                    setTimeout(() => {
                        MessegePopup.#showingPopUps = false;
                    }, 100);
                }, 3000);
            }
        }
    }
}