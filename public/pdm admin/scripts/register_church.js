import { ModalExpertise } from "../../scripts/components/actions/modal.js";
import { MessegePopup } from "../../scripts/components/actions/pop_up.js";
import { Button, Column, MondoText, TextEdit } from "../../scripts/components/UI/cool_tool_ui.js";
import { TextEditError, TextEditValueValidator } from "../../scripts/components/utils/textedit_value_validator.js";
import { clearTextEdits } from "../../scripts/dom/text_edit_utils.js";
import { work } from "../../scripts/dom/worker.js";
import { Post } from "../../scripts/net_tools.js";

work(RegisterChurch);

function RegisterChurch() {
    let column,
        adminCodeI,
        adminPasswordI,
        churchNameI,
        churchCodeI,
        churchEmailI,
        churchPasswordI,
        button;

    adminCodeI = TextEdit({ 'placeholder': 'admin code' });
    adminPasswordI = TextEdit({ 'placeholder': 'admin password' });
    churchNameI = TextEdit({ 'placeholder': 'church name' });
    churchEmailI = TextEdit({ 'placeholder': 'church email' });
    churchCodeI = TextEdit({ 'placeholder': 'church code' });
    churchPasswordI = TextEdit({ 'placeholder': 'church password' });

    button = Button({
        'text': 'submit', 'onclick': async function (ev) {
            try {
                TextEditValueValidator.validate('admin code', adminCodeI);
                TextEditValueValidator.validate('admin password', adminPasswordI);
                TextEditValueValidator.validate('church name', churchNameI);
                TextEditValueValidator.validate('church email', churchEmailI);
                TextEditValueValidator.validate('church code', churchCodeI);
                TextEditValueValidator.validate('church password', churchPasswordI);

                const body = {
                    'admin_code': adminCodeI.value,
                    'admin_password': adminPasswordI.value,
                    'church_name': churchNameI.value,
                    'church_email': churchEmailI.value,
                    'church_code': churchCodeI.value,
                    'church_password': churchPasswordI.value,
                }

                column.replaceChildren(...[MondoText({ 'text': 'on it' })]);

                let result = await Post('/register/church', body, { 'requiresChurchDetails': false });
                setTimeout(() => {
                    column.replaceChildren([]);
                    column.append(...children);
                }, 1200);

                const msg = result['response'];
                MessegePopup.showMessegePuppy([new MondoText({ 'text': msg })]);

                if (msg && msg.match('success')) {
                    clearTextEdits([
                        adminCodeI,
                        adminPasswordI,
                        churchNameI,
                        churchEmailI,
                        churchCodeI,
                        churchPasswordI
                    ]);
                }
            } catch (error) {
                if (error instanceof TextEditError) {
                    MessegePopup.showMessegePuppy([new MondoText({ 'text': error.message })])
                }
            }
        }
    });
    button.style.marginTop = '40px';

    let children = [
        adminCodeI,
        adminPasswordI,
        churchNameI,
        churchCodeI,
        churchEmailI,
        churchPasswordI,
        button
    ];

    column = Column({ 'classlist': ['fx-col', 'f-w', 'f-h', 'a-c'], 'children': children });
    column.style.paddingTop = '30px';

    ModalExpertise.showModal({
        'actionHeading': 'register church',
        'children': [column],
        'modalChildStyles': [],
        'dismisible': false
    });
}