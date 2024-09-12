import { ChurchDataHandle } from "../../data_pen/church_data_handle.js";
import { getMissionById } from "../../data_pen/puppet.js";
import { getChurchStaff } from "../../data_source/main.js";
import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate } from "../../dom/query.js";
import { clearTextEdits } from "../../dom/text_edit_utils.js";
import { Post } from "../../net_tools.js";
import { LocalStorageContract } from "../../storage/LocalStorageContract.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { MissionPicker } from "../tailored_ui/mission_picker.js";
import { PDFPrintButton } from "../tailored_ui/print_button.js";
import { Button, Column, HorizontalScrollView, MondoSelect, MondoText, TextEdit, VerticalScrollView } from "../UI/cool_tool_ui.js";
import { TextEditValueValidator } from "../utils/textedit_value_validator.js";

export function promptAddStaffToChurch() {
    const missionPicker = MissionPicker({ 'missions': ChurchDataHandle.churchMissions });
    const nameEntry = TextEdit({ 'placeholder': 'name' });
    const telephoneEntry = TextEdit({ 'placeholder': 'telephone' });
    const idNumberEntry = TextEdit({ 'placeholder': 'id number' });
    const kraNumberEntry = TextEdit({ 'placeholder': 'KRA number' });
    const employmentDate = TextEdit({ 'type': 'date' });
    const homeAddressEntry = TextEdit({ 'placeholder': 'home address' });
    const positionEntry = TextEdit({ 'placeholder': 'position, e.g; gardener, cook' });
    const commentEntry = TextEdit({ 'placeholder': 'comment e.g. Asthmatic, no illness' });
    const genderEntry = MondoSelect({});
    const categoryPicker = MondoSelect({});
    const saveButton = Button({ 'text': 'submit' });

    genderEntry.innerHTML = `
        <option>MALE</option>
        <option>FEMALE</option>
        `;

    categoryPicker.innerHTML = `
        <option selected>${'ADMINISTRATIVE AND OFFICE STAFF'.toLowerCase()}</option>
        <option>support and operational staff</option>
    `

    const parent = VerticalScrollView({
        'styles': [{ 'padding': '20px' }],
        'children': [
            missionPicker,
            Column({
                'children': [
                    MondoText({ 'text': 'employment date' })
                    , employmentDate,
                ]
            }),
            nameEntry,
            genderEntry,
            idNumberEntry,
            telephoneEntry,
            homeAddressEntry,
            kraNumberEntry,
            categoryPicker,
            positionEntry,
            commentEntry,
            saveButton
        ]
    });

    saveButton.onclick = async function (ev) {
        ev.preventDefault();
        const mission = JSON.parse(missionPicker.value);
        try {
            TextEditValueValidator.validate('name', nameEntry);
            TextEditValueValidator.validate('gender', genderEntry);
            TextEditValueValidator.validate('ID number', idNumberEntry);
            TextEditValueValidator.validate('home address', homeAddressEntry);
            TextEditValueValidator.validate('position', positionEntry);
            TextEditValueValidator.validate('category', categoryPicker);
            TextEditValueValidator.validate('comment', commentEntry);

            const body = {
                'staff': {
                    'mission_id': mission['_id'],
                    'name': nameEntry.value,
                    'gender': genderEntry.value,
                    'id_number': idNumberEntry.value,
                    'telephone': telephoneEntry.value,
                    'kra_number': kraNumberEntry.value,
                    'category': categoryPicker.value,
                    'home_address': homeAddressEntry.value,
                    'position': positionEntry.value,
                    'comment': commentEntry.value,
                }
            }

            const result = await Post(
                '/church/register/staff',
                body,
                { 'requiresChurchDetails': true }
            );

            let msg = result['response'];
            MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);

            if (msg.match('success') || msg.match('save')) {
                clearTextEdits(
                    [
                        nameEntry,
                        idNumberEntry,
                        homeAddressEntry,
                        positionEntry,
                        commentEntry
                    ]
                )
                ChurchDataHandle.churchStaff = await getChurchStaff();
            }
        } catch (error) {
            MessegePopup.showMessegePuppy([MondoText({ 'text': error })]);
            throw error
        }
    }

    ModalExpertise.showModal({
        'actionHeading': 'staff registry',
        'fullScreen': false,
        'children': [parent],
    })
}

export function ViewChurchStaffByOutsation() {
    const missionPicker = MissionPicker({ 'missions': ChurchDataHandle.churchMissions });
    missionPicker.addEventListener('change', setView);

    const table = domCreate('table');
    const tableId = 'staff-table';
    table.id = tableId;

    const tableHeader = domCreate('thead');
    const tbody = domCreate('tbody');
    const tfooter = domCreate('tfoot');

    tableHeader.innerHTML = `
    <tr>
    <td>NO</td>
    <td>NAME</td>
    <td>ID NUMBER</td>
    <td>POSITION</td>
    <td>TELEPHONE</td>
    <td>KRA NUMBER</td>
    </tr>
    `

    const printButton = new PDFPrintButton(tableId)
    addChildrenToView(table, [tableHeader, tbody, tfooter]);

    function setView() {
        tbody.replaceChildren([]);

        const selectedMission = missionPicker.value;

        let mission = JSON.parse(selectedMission);
        let selectedMissionId = mission['_id'];
        PDFPrintButton.printingHeading = `${LocalStorageContract.completeChurchName()} . ${mission['name']} mission staff`.toUpperCase()

        let filteredStaffByMission = ChurchDataHandle.churchStaff.filter(function (staff) { return staff['mission_id'] === selectedMissionId; });

        for (let i = 0; i < filteredStaffByMission.length; i++) {
            const staff = filteredStaffByMission[i];
            const row = domCreate('tr');

            row.innerHTML = `
            <td>${i + 1}</td>
            <td>${staff['name']}</td>
            <td>${staff['id_number']}</td>
            <td>${staff['position']}</td>
            <td>${staff['telephone']}</td>
        <td>${staff['kra_number']}</td>
        `
            tbody.appendChild(row);
        }
    }

    setView();

    const parent = Column({
        'classlist': ['f-w', 'a-c'],
        'styles': [{ 'padding': '20px' }],
        'children': [
            HorizontalScrollView({
                'classlist': ['a-c', 'just-center'],
                'children': [table]
            })
        ]
    });

    ModalExpertise.showModal({
        'modalHeadingStyles': [{ 'background-color': '#002079' }, { 'color': 'white' }],
        'topRowStyles': [{ 'background-color': '#002079' }, { 'color': 'white' }],
        'actionHeading': 'church staff',
        'topRowClasses': ['a-c'],
        'topRowUserActions': [missionPicker, printButton],
        'children': [parent],
        'fullScreen': true
    })
}

export function ViewAllChurchStaff() {
    const table = domCreate('table');
    const tableId = 'staff-table';
    table.id = tableId;

    const tableHeader = domCreate('thead');
    const tbody = domCreate('tbody');
    const tfooter = domCreate('tfoot');

    tableHeader.innerHTML = `
        <tr>
            <td>NO</td>
            <td>MISSION</td>
            <td>NAME</td>
            <td>ID NUMBER</td>
            <td>POSITION</td>
            <td>TELEPHONE</td>
            <td>KRA NUMBER</td>
            </tr>
            `

    const printButton = new PDFPrintButton(tableId)
    addChildrenToView(table, [tableHeader, tbody, tfooter]);

    function setView() {
        PDFPrintButton.printingHeading = `${LocalStorageContract.completeChurchName()} staff`.toUpperCase();

        tbody.replaceChildren([]);
        for (let i = 0; i < ChurchDataHandle.churchStaff.length; i++) {
            const staff = ChurchDataHandle.churchStaff[i];
            const row = domCreate('tr');

            row.innerHTML = `
            <td>${i + 1}</td>
            <td>${getMissionById(staff['mission_id'])['name']}</td>
            <td>${staff['name']}</td>
        <td>${staff['id_number']}</td>
        <td>${staff['position']}</td>
        <td>${staff['telephone']}</td>
        <td>${staff['kra_number']}</td>
        `
            tbody.appendChild(row);
        }
    }

    setView();

    const parent = Column({
        'classlist': ['f-w', 'a-c'],
        'styles': [{ 'padding': '20px' }],
        'children': [
            HorizontalScrollView({
                'classlist': ['a-c', 'just-center'],
                'children': [table]
            })
        ]
    });

    ModalExpertise.showModal({
        'modalHeadingStyles': [{ 'background-color': '#002079' }, { 'color': 'white' }],
        'topRowStyles': [{ 'background-color': '#002079' }, { 'color': 'white' }],
        'actionHeading': 'church staff',
        'topRowClasses': ['a-c'],
        'topRowUserActions': [printButton],
        'children': [parent],
        'fullScreen': true
    })
}