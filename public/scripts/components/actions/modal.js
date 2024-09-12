import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate, domQueryById } from "../../dom/query.js";
import { Column } from "../UI/column.js";
import { MondoText } from "../UI/mondo_text.js";
import { Row } from "../UI/row.js";
import { addClasslist, StyleView } from "../utils/stylus.js";

export class ModalExpertise {
    static modalIsShowing = false;
    static modalElId = 'modal-component';

    constructor() { }

    static async showModal({
        actionHeading = '',
        topRowUserActions = [],
        children = [],
        fullScreen = false,
        modalChildStyles = [],
        dismisible = true,
        modalHeadingStyles = [],
        topRowStyles = [],
        topRowClasses = [],
    }) {
        let modalCloseEl = domCreate('i');
        modalCloseEl.classList.add('bi', 'fx-col', 'a-c', 'just-center');

        if (fullScreen && fullScreen === true) {
            addClasslist(modalCloseEl, ['bi-chevron-left'])
            modalCloseEl.title = 'back';
        } else {
            addClasslist(modalCloseEl, ['bi-x'])
            modalCloseEl.title = 'close';
        }
        modalCloseEl.onclick = ModalExpertise.#hideModal;

        var modalChildHeading = MondoText({
            text: actionHeading || '',
            styles: [{ 'fontSize': '18px' }, { 'font-weight': '400' }]
        });

        const modalHeaderTopRow = Row({
            'styles': [{ 'background-color': 'whitesmoke' }],
            'classlist': ['f-w',
                dismisible
                    ? 'space-between'
                    : 'just-center',
                'a-e',
                'm-pad',
                'border-bottom'
            ],
            children: [modalChildHeading],
        });

        StyleView(modalHeaderTopRow, modalHeadingStyles)

        if (fullScreen && fullScreen === true) {
            modalHeaderTopRow.insertBefore(modalCloseEl, modalChildHeading);
        } else {
            addChildrenToView(modalHeaderTopRow, [modalCloseEl]);
        }

        const userActionsRow = Row({
            'classlist': ['f-w', 'a-e', 'just-end', 'm-pad', 'border-bottom'],
            'styles': [{ 'background-color': 'whitesmoke' }],
            'children': topRowUserActions,
        });

        addClasslist(userActionsRow, topRowClasses);
        StyleView(userActionsRow, topRowStyles);

        var modalHeader = Column({
            'classlist': ['f-w', 'space-between'],
            'children': [
                modalHeaderTopRow,
                (topRowUserActions
                    && topRowUserActions.length
                    && topRowUserActions.length > 0)
                    ? userActionsRow
                    : ''
            ]
        });

        modalHeader.classList.add('h-fit-content');

        var modalChild = Column({
            'children': [modalHeader, ...children],
            'classlist': [
                ...((fullScreen && fullScreen === true)
                    ? ['f-w', 'f-h']
                    : ['not-full-screen-modal-child']),

                'modal-child'
            ]
        });

        StyleView(modalChild, modalChildStyles);
        var modal = Column({
            'classlist': [
                'modal',
                ...(fullScreen && fullScreen === true
                    ? ['a-c', 'just-center']
                    : ['md']
                )
            ],
            'children': [modalChild]
        });

        modal.onclick = function (ev) {
            ev.preventDefault();

            if (dismisible === true) {
                if (ev.target && ev.target === modal) {
                    ModalExpertise.#hideModal()
                }
            }
        }

        if (!fullScreen || !(fullScreen === true)) {
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
        }

        modal.id = ModalExpertise.modalElId;
        modal.style.zIndex = '100';

        if (ModalExpertise.modalIsShowing) {
            ModalExpertise.#hideModal()
            if (modal) {
                if (document.body.appendChild(modal)) {
                    ModalExpertise.modalIsShowing = false;
                }
            }
        } else {
            if (document.body.appendChild(modal)) {
                ModalExpertise.modalIsShowing = true;
                window.addEventListener('keydown', function (ev) {
                    switch (ev.key) {
                        case 'Escape':
                            if (dismisible && dismisible === true) {
                                ModalExpertise.#hideModal();
                            }
                            break;

                        default:
                            break;
                    }
                });
            }
        }
    }

    static #hideModal() {
        const modal = domQueryById(ModalExpertise.modalElId);

        if (modal) {
            document.body.removeChild(modal);
            ModalExpertise.modalIsShowing = false;
        }
    }
}