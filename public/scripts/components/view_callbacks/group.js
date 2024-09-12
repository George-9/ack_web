import { ChurchDataHandle } from "../../data_pen/church_data_handle.js";
import { getMissionMembers, getMissionDisctricts, getDisctrictMembersFromList } from "../../data_pen/puppet.js";
import { getChurchGroupsRecords, getChurchDisctricts } from "../../data_source/main.js";
import { PRIESTS_COMMUNITY_NAME } from "../../data_source/other_sources.js";
import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate } from "../../dom/query.js";
import { clearTextEdits } from "../../dom/text_edit_utils.js";
import { Post } from "../../net_tools.js";
import { marginRuleStyles } from "../../church_profile.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { MissionPicker } from "../tailored_ui/mission_picker.js";
import { PDFPrintButton } from "../tailored_ui/print_button.js";
import { Column, MondoText, TextEdit, Button, HorizontalScrollView, Row } from "../UI/cool_tool_ui.js";
import { StyleView } from "../utils/stylus.js";
import { TextEditValueValidator } from "../utils/textedit_value_validator.js";

export function promptAddGroupView() {
    const groupNameI = TextEdit({ 'placeholder': 'name, please use the initials, don\'t use acronymes' });
    const groupAgeMinAgeSetI = TextEdit({
        'placeholder': 'group min age (inclusive)',
        'type': 'number'
    });

    const groupMaxAgeSetI = TextEdit({
        'placeholder': 'group max age (inclusive)',
        'type': 'number'
    });

    const button = Button({
        'styles': marginRuleStyles,
        'text': 'submit',
        'onclick': async function (ev) {
            try {
                TextEditValueValidator.validate('group name', groupNameI);
                TextEditValueValidator.validate('minimum age', groupAgeMinAgeSetI);
                TextEditValueValidator.validate('maximum age', groupMaxAgeSetI);

                const body = {
                    'group': {
                        'name': groupNameI.value,
                        'min_age': parseInt(groupAgeMinAgeSetI.value),
                        'max_age': parseInt(groupMaxAgeSetI.value),
                    }
                };

                let result = await Post('/church/register/group', body, { 'requiresChurchDetails': true });
                let msg = result['response'];

                MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);
                if (msg.match('success' || msg.match('save'))) {
                    clearTextEdits([groupNameI, groupAgeMinAgeSetI, groupMaxAgeSetI]);
                    ChurchDataHandle.churchGroups = await getChurchGroupsRecords();
                }
            } catch (error) {
                MessegePopup.showMessegePuppy([MondoText({ 'text': error })]);
            }
        }
    })

    const column = Column({
        'styles': marginRuleStyles,
        'classlist': ['f-w', 'f-c', 'a-c', 'm-pad'],
        'children': [
            groupNameI,
            groupAgeMinAgeSetI,
            groupMaxAgeSetI,
            button
        ]
    });
    StyleView(column, [{ 'padding': '10px' }]);

    ModalExpertise.showModal({
        'actionHeading': 'add an Disctrict',
        'modalHeadingStyles': [{ 'background-color': '#ff9999' }, { 'color': 'cornsilk' }],
        'modalChildStyles': [{ 'height': '300px' }],
        'children': [column],
        'fullScreen': false,
        'dismisible': true
    });
}

export function viewDisctrictsPage() {
    const tableId = 'districts-table';

    const table = domCreate('table');
    table.id = tableId;

    const thead = domCreate('thead');
    const tbody = domCreate('tbody');
    const tfoot = domCreate('tfoot');

    thead.innerHTML = `
        <tr>
            <td>NO</td>
            <td>Disctrict</td>
            <td>MISSION</td>
            <td>MEMBER COUNT</td>
        </tr>
    `
    addChildrenToView(table, [thead, tbody, tfoot]);
    const data = [];

    ChurchDataHandle.churchDisctricts.forEach(function (district, i) {
        let mission = ChurchDataHandle.churchMissions.find(function (o) {
            return o['_id'] === district['mission_id']
        }) || { 'name': 'EVERY MISSION' };

        let membersCount = ChurchDataHandle.churchMembers.filter(function (m) {
            return m['district_id'] === district['_id']
        }).length;

        data.push({
            district_name: district['name'],
            mission_name: mission['name'],
            members_count: membersCount
        });
    });

    let sortedData = data.sort(function (a, b) {
        return `${b['mission_name']}`.localeCompare(a['mission_name']);
    });

    function loadView() {
        sortedData.forEach(function (data, i) {
            const row = domCreate('tr');
            row.innerHTML = `
            <td>${i + 1}</td>
            <td>${data['district_name']}</td>
            <td>${data['mission_name']}</td>
            <td>${data['members_count']}</td>
            `
            table.appendChild(row);
        });
    }

    loadView()

    const lastRow = domCreate('tr');
    lastRow.innerHTML = `
        <td colspan="3">TOTAL</td>
        <td>${ChurchDataHandle.churchMembers.length}</td>
    `
    tfoot.appendChild(lastRow)

    const column = Column({
        'classlist': ['f-w', 'a-c', 'scroll-y'],
        'styles': [{ 'padding': '10px' }],
        'children': [table]
    });

    ModalExpertise.showModal({
        'actionHeading': `small Christian Communities (${ChurchDataHandle.churchDisctricts.length})`,
        'modalHeadingStyles': [{ 'background': '#4788fd' }, { 'color': 'white' }],
        'topRowUserActions': [new PDFPrintButton(tableId)],
        'children': [column],
        'modalChildStyles': [{ 'width': 'fit-content' }, { 'height': '90%' }],
        'fullScreen': false,
        'dismisible': true,
    });
}

export function showGroupsOverview() {
    const tableId = 'districts-table';

    const table = domCreate('table');
    table.id = tableId;

    const tbody = domCreate('tbody');
    const tfoot = domCreate('tfoot');
    const thead = domCreate('thead');

    thead.innerHTML = `
        <tr>
            <td>NO</td>
            <td>NAME</td>
            <td>MIN AGE</td>
            <td>MAX AGE</td>
        </tr>
            `
    addChildrenToView(table, [thead, tbody, tfoot]);


    function setGroups() {
        tbody.replaceChildren([]);
        tfoot.replaceChildren([]);

        let count;
        ChurchDataHandle.churchGroups.forEach(function (group, i) {
            const row = domCreate('tr');
            row.innerHTML = `
                <td>${i + 1}</td>
                <td>${group['name']}</td>
                <td>${group['min_age']}</td>
                <td>${group['max_age']}</td>
            `
            tbody.appendChild(row);
            count = i;
        });
    }

    // set default Groups
    setGroups();

    const column = Column({
        'classlist': ['f-w', 'a-c', 'just-center', 'scroll-y'],
        'styles': [{ 'padding': '10px' }],
        'children': [
            Column({
                'styles': [{ 'height': '20px' }]
            }),
            HorizontalScrollView({
                'children': [table]
            }),
        ]
    });

    ModalExpertise.showModal({
        'actionHeading': `PARISH GROUPS (${ChurchDataHandle.churchGroups.length})`,
        'modalHeadingStyles': [{ 'background': 'gainsboro' }, { 'color': 'white' }],
        'topRowUserActions': [new PDFPrintButton(tableId)],
        'children': [column],
        'modalChildStyles': [{ 'width': 'fit-content' }, { 'height': '90%' }],
        'fullScreen': false,
        'dismisible': true,
    });
}
