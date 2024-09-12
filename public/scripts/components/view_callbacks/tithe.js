import { ChurchDataHandle } from "../../data_pen/church_data_handle.js";
import { getMissionDisctricts, getDisctrictMembers, memberGetMission, memberGetDisctrict } from "../../data_pen/puppet.js";
import { getChurchMissions } from "../../data_source/main.js";
import { PRIESTS_COMMUNITY_NAME } from "../../data_source/other_sources.js";
import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate, domQueryById } from "../../dom/query.js";
import { clearTextEdits } from "../../dom/text_edit_utils.js";
import { Post } from "../../net_tools.js";
import { LocalStorageContract } from "../../storage/LocalStorageContract.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { addPriestCommunityOptionToPicker, MissionPicker } from "../tailored_ui/mission_picker.js";
import { ExcelExportButton, PDFPrintButton } from "../tailored_ui/print_button.js";
import { Column, MondoText, TextEdit, Button, Row, MondoSelect, VerticalScrollView, HorizontalScrollView } from "../UI/cool_tool_ui.js";
import { HIDDEN_STYLE, VIEWING_STYLE } from "../UI/view_standards.js";
import { addClasslist, StyleView } from "../utils/stylus.js";
import { TextEditValueValidator } from "../utils/textedit_value_validator.js";

export const TitheCategory = { 'member': 'member', 'unknown_member': 'unkown_member' };
export function promptAddTitheView() {
    let selectedMemberId, searchResultViewContainer;
    const dateId = 'date-el';


    const titheCategoryPicker = MondoSelect({
        'styles': [{
            'margin-bottom': '4px'
        }]
    });
    titheCategoryPicker.innerHTML = `
        <option selected value=${TitheCategory.member}>${TitheCategory.member}</option>
        <option  value=${TitheCategory.unknown_member}>${TitheCategory.unknown_member}</option>
    `

    const memberSearchI = TextEdit({ 'placeholder': 'member name' });
    const unRecognizedMemberNameI = TextEdit({ 'styles': [HIDDEN_STYLE], 'placeholder': 'name' });
    const missionPicker = MissionPicker({ 'missions': ChurchDataHandle.churchMissions });

    titheCategoryPicker.addEventListener('change', function (ev) {
        if (titheCategoryPicker.value === TitheCategory.unknown_member) {
            StyleView(memberSearchI, [HIDDEN_STYLE]);
            StyleView(unRecognizedMemberNameI, [VIEWING_STYLE]);
            StyleView(missionPicker, [VIEWING_STYLE]);
        } else {
            StyleView(memberSearchI, [VIEWING_STYLE]);
            StyleView(unRecognizedMemberNameI, [HIDDEN_STYLE]);
            StyleView(missionPicker, [HIDDEN_STYLE]);
        }
    })


    const dateI = TextEdit({ 'type': 'date' });
    dateI.id = dateId;

    const amountI = TextEdit({ 'placeholder': 'amount' }, { 'keyboardType': 'number' });
    async function saveTitheRecord() {
        try {
            let body;
            TextEditValueValidator.validate('date', dateI);
            TextEditValueValidator.validate('amount', amountI);
            if (titheCategoryPicker.value === TitheCategory.member) {
                if (!selectedMemberId) {
                    return MessegePopup.showMessegePuppy([MondoText({ 'text': 'select a member to continue' })])
                }
                body = {
                    tithe: {
                        'member_id': selectedMemberId,
                        'date': dateI.value,
                        'amount': parseFloat(amountI.value),
                        'category': TitheCategory.member
                    }
                }
            } else {
                TextEditValueValidator.validate('unknown member name', unRecognizedMemberNameI);
                TextEditValueValidator.validate('unknown member name', missionPicker);
                body = {
                    tithe: {
                        'name': unRecognizedMemberNameI.value,
                        'mission_id': missionPicker.value['id'],
                        'date': dateI.value,
                        'amount': parseFloat(amountI.value),
                        'category': TitheCategory.unknown_member
                    }
                }
            }

            let result = await Post('/church/record/tithe', body, { 'requiresChurchDetails': true })
            let msg = result['response'];

            MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);
            if (msg.match('success') || msg.match('save')) {
                clearTextEdits([memberSearchI, dateI, amountI]);
            }
        } catch (error) {
            MessegePopup.showMessegePuppy([MondoText({ 'text': error })]);
        }
    }

    const submitButton = Button({ 'text': 'submit', onclick: saveTitheRecord });

    searchResultViewContainer = Column({ 'classlist': ['f-h', 'f-w', 'scroll-y'], 'children': [] });

    const memberSearchView = Column({
        'styles': [{ 'padding-top': '50px' }, { 'min-width': '60vh' }],
        'classlist': ['f-w', 'a-c'],
        'children': [
            titheCategoryPicker,
            missionPicker,
            memberSearchI,
            unRecognizedMemberNameI,
            dateI,
            amountI,
            submitButton,
            searchResultViewContainer
        ]
    });

    ModalExpertise.showModal({
        'actionHeading': 'add tithe record',
        'fullScreen': false,
        'dismisible': true,
        'modalChildStyles': [{ 'min-height': '90vh' }],
        'modalHeadingStyles': [{ 'background-color': 'green' }, { 'color': 'white' }],
        'children': [memberSearchView]
    });


    memberSearchI.addEventListener('input', function (ev) {
        ev.preventDefault();

        const searchKey = memberSearchI.value;
        let match = ChurchDataHandle.churchMembers.filter(function (member) {
            return (
                `${member['name']}`.match(searchKey)
                || `${member['member_number']}`.match(searchKey)
            )
        });

        if (match) {
            match = match.map(function (member) {
                let mission = memberGetMission(member);
                const district = memberGetDisctrict(member);

                return {
                    _id: member['_id'],
                    'name': member['name'],
                    'telephone_number': member['telephone_number'] || '_',
                    'mission': mission ? mission['name'] : PRIESTS_COMMUNITY_NAME,
                    'district': district['name'],
                }
            });
        }

        const styles = [{ 'font-weight': '700' }];
        const matchViews = match.map(function (member) {
            let view = Column({
                'classlist': ['f-w', 'a-c', 'c-p', 'highlightable'],
                'children': [
                    Row({
                        'children': [
                            MondoText({ 'text': 'name', 'styles': styles }),
                            MondoText({ 'text': member['name'] }),
                        ]
                    }),
                    Row({
                        'children': [
                            MondoText({ 'text': 'telephone number', 'styles': styles }),
                            MondoText({ 'text': member['telephone_number'] }),
                        ]
                    }),
                    Row({
                        'children': [
                            MondoText({ 'text': 'mission', 'styles': styles }),
                            MondoText({ 'text': member['mission'] }),
                        ]
                    }),
                    Row({
                        'children': [
                            MondoText({ 'text': 'district', 'styles': styles }),
                            MondoText({ 'text': member['district'] }),
                        ]
                    })
                ]
            });

            view.style.borderBottom = '1px solid grey';
            view.style.margin = '3px';

            let cloneId = 'tth-clone';
            view.onclick = function (ev) {
                ev.preventDefault();

                selectedMemberId = member['_id'];
                let existingClone = domQueryById(cloneId);
                if (existingClone) {
                    memberSearchView.removeChild(existingClone);
                }

                let clone = view.cloneNode(true);
                clone.id = cloneId;

                memberSearchView.insertBefore(clone, domQueryById(dateId));
                searchResultViewContainer.replaceChildren([]);
            }

            return view;
        });

        searchResultViewContainer.replaceChildren([]);
        addChildrenToView(searchResultViewContainer, matchViews);
    });
}

export function showTitheReportsView() {
    let selectedMissionDisctricts = [];
    const tableId = 'tithe-table';

    const viewTotalsForEachDisctrictButton = domCreate('i');
    StyleView(viewTotalsForEachDisctrictButton, [{ 'color': 'rgb(161, 45, 136)' }])
    addClasslist(viewTotalsForEachDisctrictButton, ['bi', 'bi-opencollective']);

    let selectedMission, selectedDisctrict, missionTotalTithe = 0, selectedDisctrictTotalTithe = 0;

    const missionPicker = MissionPicker({ 'missions': ChurchDataHandle.churchMissions });
    const districtPicker = MondoSelect({});


    const table = domCreate('table');
    table.id = tableId;
    StyleView(table, [{ 'width': '80%' }]);
    addClasslist(table, ['txt-c', 'f-w']);
    StyleView(table, [{ 'width': 'max-content' }]);

    const tableHeader = domCreate('thead');
    const topRow = domCreate('tr');
    topRow.innerHTML = `
            <td>NO</t>
            <td>DATE</t>
            <td>MEMBER NAME</t>
            <td>AMOUNT</t>
            `
    tableHeader.appendChild(topRow);

    const tbody = domCreate('tbody');
    const tFooter = domCreate('tfoot');

    addChildrenToView(table, [tableHeader, tbody, tFooter]);

    showMissionTotalTithe();
    setViews();

    districtPicker.addEventListener('change', function (ev) {
        ev.preventDefault();

        PDFPrintButton.printingHeading = LocalStorageContract.completeChurchName() + ' ' + (JSON.parse(districtPicker.value))['name'] + ' Disctrict tithe records'

        selectedDisctrictTotalTithe = 0;
        const thiDisctrictMembers = getDisctrictMembers(districtPicker.value, missionPicker.value);

        const DisctrictTitheRecords = [];
        for (let i = 0; i < ChurchDataHandle.churchTitheRecords.length; i++) {
            const titheRecord = ChurchDataHandle.churchTitheRecords[i];
            for (let i = 0; i < thiDisctrictMembers.length; i++) {
                const member = thiDisctrictMembers[i];

                if (titheRecord['member_id'] === member['_id']) {
                    DisctrictTitheRecords.push({
                        'date': titheRecord['date'],
                        'member': member['name'],
                        'amount': titheRecord['amount']
                    });
                }
            }
        }

        tbody.replaceChildren([]);
        tFooter.replaceChildren([]);

        for (let i = 0; i < DisctrictTitheRecords.length; i++) {
            const titheRecord = DisctrictTitheRecords[i];
            let amount = titheRecord['amount'];

            const row = domCreate('tr');
            row.innerHTML = `
            <td>${i + 1}</td>
            <td>${titheRecord['date']}</td>
            <td>${titheRecord['member']}</td>
            <td>${amount}</td>
            `

            selectedDisctrictTotalTithe += amount;
            tbody.appendChild(row)
        }

        // const row = domCreate('tr');
        // row.innerHTML = `
        //     <td colspan="3">TOTAL</td>
        //     <td>${selectedDisctrictTotalTithe}</td>
        // `
        // tFooter.appendChild(row);
    });

    function setViews() {
        selectedMissionDisctricts = getMissionDisctricts(missionPicker.value);

        districtPicker.replaceChildren([]);
        tbody.replaceChildren([]);

        for (let i = 0; i < selectedMissionDisctricts.length; i++) {
            const Disctrict = selectedMissionDisctricts[i];
            const option = domCreate('option');
            option.innerText = Disctrict['name'];
            option.value = JSON.stringify(Disctrict);

            districtPicker.appendChild(option);

            selectedMission = missionPicker.value;
            selectedDisctrict = districtPicker.value;
        }

        addPriestCommunityOptionToPicker(districtPicker);
        PDFPrintButton.printingHeading = `${JSON.parse(selectedMission)['name']} . ${JSON.parse(selectedDisctrict)['name']} TITHE RECORDS`
    }

    function showMissionTotalTithe() {
        missionTotalTithe = 0;

        for (let i = 0; i < ChurchDataHandle.churchTitheRecords.length; i++) {
            const titheRecord = ChurchDataHandle.churchTitheRecords[i];
            for (let j = 0; j < ChurchDataHandle.churchMembers.length; j++) {
                const member = ChurchDataHandle.churchMembers[j];

                const amount = parseFloat(titheRecord['amount']);
                if (titheRecord['member_id'] === member['_id'] && (member['mission_id'] === missionPicker.value['_id']
                    || (member['mission_id'] === JSON.parse(missionPicker.value)['_id']))) {
                    missionTotalTithe += amount;
                }
            }
        }
        // missionTotalTitheDispensor.innerText = `${(JSON.parse(missionPicker.value))['name']} mission total ${missionTotalTithe}`.toUpperCase();
    }

    missionPicker.addEventListener('change', function (ev) {
        ev.preventDefault();
        showMissionTotalTithe();
        setViews();
    });

    const printButton = new PDFPrintButton(tableId);

    const containerColumn = Column({
        'classlist': ['f-w', 'a-c', 'scroll-y'],
        'children': [
            HorizontalScrollView({
                'classlist': ['a-c', 'just-center'],
                'children': [table]
            }),
            // missionTotalTitheDispensor,
        ]
    });

    const mainColumn = Column({
        'children': [
            Column({
                'classlist': ['f-w', 'just-center', 'a-c'],
                'children': [
                    missionPicker,
                    districtPicker,
                ]
            }),
            containerColumn
        ]
    });

    viewTotalsForEachDisctrictButton.onclick = function (ev) {
        const districtInnerTbaleId = 'district-inner-table-id';
        const printIcon = new PDFPrintButton(districtInnerTbaleId);

        PDFPrintButton.printingHeading = LocalStorageContract.completeChurchName() + ' missions tithe records\''

        const table = domCreate('table');
        table.id = districtInnerTbaleId;
        const tableHeader = domCreate('thead');

        const scrollView = VerticalScrollView({
            'styles': [{ 'margin': '30px' }],
            'children': [table]
        });

        tableHeader.innerHTML = `
        <tr>
            <th>NO</th>
            <th>Disctrict</th>
            <th>amount</th>
            </tr>
            `
        addChildrenToView(table, [tableHeader]);
        let churchTotalTithe = 0;
        for (let l = 0; l < ChurchDataHandle.churchMissions.length; l++) {
            let missionTotalTithe = 0;
            const mission = ChurchDataHandle.churchMissions[l];
            for (let j = 0; j < ChurchDataHandle.churchTitheRecords.length; j++) {
                const titheRecord = ChurchDataHandle.churchTitheRecords[j];
                let amount = parseFloat(titheRecord['amount']);

                for (let k = 0; k < ChurchDataHandle.churchMembers.length; k++) {
                    const member = ChurchDataHandle.churchMembers[k];
                    if (member && member['mission_id'] === mission['_id'] && member['_id'] === titheRecord['member_id']) {
                        missionTotalTithe += amount;
                    }
                }
            }
            churchTotalTithe += missionTotalTithe;
            const row = domCreate('tr');
            if (l % 2 === 0) {
                StyleView(row, [{ 'background-color': '#ffebeb' }])
            }

            row.innerHTML = `
                <td>${l + 1}</td>
                <td>${mission['name']}</td>
                <td style={ color: 'rgb(161, 45, 136)'; }>${missionTotalTithe}</td>
            `
            addChildrenToView(table, [row]);
        }
        const row = domCreate('tr');
        row.innerHTML = `
            <td colspan="2">TOTAL</td>
            <td style={ color: 'rgb(161, 45, 136)'; }>${churchTotalTithe}</td>
        `
        addChildrenToView(tFooter, [row]);
        addChildrenToView(table, [tFooter]);

        const tbody = domCreate('tbody');
        addChildrenToView(table, [tableHeader, tbody]);
        const excelExportButton = ExcelExportButton(tableId, ChurchDataHandle.churchTitheRecords)

        ModalExpertise.showModal({
            'fullScreen': false,
            'dismisible': true,
            'topRowUserActions': [excelExportButton, printIcon],
            'actionHeading': 'church tithe records',
            'children': [scrollView]
        });
    }

    const viewUrecognizedMembersTitheButton = domCreate('i');
    viewUrecognizedMembersTitheButton.title = 'view for unrecognized members';
    addClasslist(viewUrecognizedMembersTitheButton, ['bi', 'bi-incognito'])
    viewUrecognizedMembersTitheButton.onclick = function (ev) {
        const unkownMmebersTitheRecords = ChurchDataHandle.churchTitheRecords.filter(function (titheRecord) {
            return titheRecord['category'] === TitheCategory.unknown_member;
        });
        PDFPrintButton.printingHeading = LocalStorageContract.completeChurchName() + ' missions tithe records\''

        const tableId = 'unrecognized-members-tithe-table';
        const table = domCreate('table');
        table.id = tableId;
        const tableHeader = domCreate('thead');
        tableHeader.appendChild(topRow);

        const tbody = domCreate('tbody');
        const tFooter = domCreate('tfoot');

        addChildrenToView(table, [tableHeader, tbody, tFooter]);
        const scrollView = VerticalScrollView({
            'styles': [{ 'margin': '30px' }],
            'children': [table]
        });

        tableHeader.innerHTML = `
            <tr>
                <td>NAME</td>
                <td>DATE</td>
                <td>AMOUNT</td>
            </tr>    
            `

        let totalTitheForUnknownMembers = 0;
        for (let i = 0; i < unkownMmebersTitheRecords.length; i++) {
            const row = domCreate('tr');
            const titheRecord = unkownMmebersTitheRecords[i];

            const amount = parseFloat(titheRecord['amount'] || 0);

            row.innerHTML = `
            <td>${titheRecord['name']}</td>
            <td>${titheRecord['date']}</td>
            <td>${amount}</td>
            `
            tbody.appendChild(row)
            totalTitheForUnknownMembers += amount;
        }

        tFooter.innerHTML = `
            <tr>
                <td colspan="2">TOTAL</td>
                <td>${totalTitheForUnknownMembers}</td>
            </tr>
        `
        const printIcon = new PDFPrintButton(tableId);
        ModalExpertise.showModal({
            'actionHeading': 'tithe records for Unrecognized Members',
            'topRowUserActions': [printIcon],
            'children': [scrollView]
        })

    }

    viewTotalsForEachDisctrictButton.title = 'print whole church';
    printButton.title = 'print selection';
    // MAIN MODAL/VIEW
    ModalExpertise.showModal({
        'actionHeading': 'tithe records',
        'fullScreen': true,
        'topRowUserActions': [
            viewUrecognizedMembersTitheButton,
            viewTotalsForEachDisctrictButton,
            printButton
        ],
        'children': [mainColumn],
    })
}
