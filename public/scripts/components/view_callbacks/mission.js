import { ChurchDataHandle } from "../../data_pen/church_data_handle.js";
import { getChurchMissions } from "../../data_source/main.js";
import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate } from "../../dom/query.js";
import { clearTextEdits } from "../../dom/text_edit_utils.js";
import { Post } from "../../net_tools.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { PDFPrintButton } from "../tailored_ui/print_button.js";
import { Column } from "../UI/column.js";
import { Button, MondoBigH3Text, MondoText, Row, TextEdit, VerticalScrollView } from "../UI/cool_tool_ui.js";
import { TextEditValueValidator } from "../utils/textedit_value_validator.js";

export function promptAddMissionView() {
    const nameTextEdit = TextEdit({ 'placeholder': 'mission name' });

    const button = Button({ 'text': 'submit' });
    button.onclick = async function (ev) {
        ev.preventDefault();
        try {
            TextEditValueValidator.validate('mission name', nameTextEdit);

            let result = await Post('/church/add/mission',
                { mission: { 'name': nameTextEdit.value } },
                { 'requiresChurchDetails': true });
            let msg = result['response'];

            MessegePopup.showMessegePuppy([new MondoText({ 'text': msg })])
            if (msg.match('success') || msg.match('save')) {
                clearTextEdits([nameTextEdit]);
                ChurchDataHandle.churchMissions = await getChurchMissions();
            }
        } catch (error) {
            MessegePopup.showMessegePuppy([MondoText({ 'text': error })])
        }
    }

    const column = Column({
        'children': [nameTextEdit, button],
        'classlist': ['f-w', 'a-c']
    });
    column.style.padding = '30px';

    ModalExpertise.showModal({
        'actionHeading': 'add missions to your church',
        'children': [column],
        'fullScreen': false,
        'modalChildStyles': [{ 'width': '400px', 'height': '50%' }]
    });
}

export function viewMissionsPage() {
    const tableId = 'missions-table';

    const table = domCreate('table');
    table.id = tableId;

    const thead = domCreate('thead');
    const tbody = domCreate('tbody');
    const tfoot = domCreate('tfoot');

    thead.innerHTML = `
        <tr>
            <td>NO</td>
            <td>MISSION</td>
            <td>Disctricts</td>
            <td>MEMBER COUNT</td>
        </tr>
    `
    addChildrenToView(table, [thead, tbody, tfoot]);
    ChurchDataHandle.churchMissions.forEach(function (mission, i) {
        let districtCount = ChurchDataHandle.churchDisctricts.filter(function (district) {
            return district['mission_id'] === mission['_id']
        }).length;

        let membersCount = ChurchDataHandle.churchMembers.filter(function (m) {
            return m['mission_id'] === mission['_id']
        }).length;

        const row = domCreate('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${mission['name']}</td>
            <td>${districtCount}</td>
            <td>${membersCount}</td>
        `
        table.appendChild(row);
    });
    const lastRow = domCreate('tr');
    lastRow.innerHTML = `
        <td colspan="2">TOTAL</td>
        <td>${ChurchDataHandle.churchDisctricts.length}</td>
        <td>${ChurchDataHandle.churchMembers.length}</td>
    `
    table.appendChild(lastRow)

    const column = Column({
        'styles': [{ 'margin': '10px' }, { 'padding': '10px' }],
        'classlist': ['f-w', 'a-c', 'just-center', 'scroll-y'],
        'children': [table]
    });

    ModalExpertise.showModal({
        'topRowUserActions': [new PDFPrintButton(tableId)],
        'modalHeadingStyles': [{ 'background': 'rgb(161, 45, 136)' }, { 'color': 'white' }],
        'actionHeading': `church missions (${ChurchDataHandle.churchMissions.length})`,
        'children': [column],
        'modalChildStyles': [{}],
        'fullScreen': false,
        'dismisible': true,
    });
}
