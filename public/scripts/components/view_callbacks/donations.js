import { ChurchDataHandle } from "../../data_pen/church_data_handle.js";
import { getMemberById, getMissionById, getMissionDisctricts, getDisctrictMembers, memberGetMission, memberGetDisctrict } from "../../data_pen/puppet.js";
import { PRIESTS_COMMUNITY_NAME } from "../../data_source/other_sources.js";
import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate, domQueryById } from "../../dom/query.js";
import { clearTextEdits } from "../../dom/text_edit_utils.js";
import { Post } from "../../net_tools.js";
import { LocalStorageContract } from "../../storage/LocalStorageContract.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { MissionPicker } from "../tailored_ui/mission_picker.js";
import { PDFPrintButton } from "../tailored_ui/print_button.js";
import { Column, MondoText, TextEdit, Button, Row, MondoSelect, VerticalScrollView, HorizontalScrollView } from "../UI/cool_tool_ui.js";
import { HIDDEN_STYLE, VIEWING_STYLE } from "../UI/view_standards.js";
import { addClasslist, StyleView } from "../utils/stylus.js";
import { TextEditValueValidator } from "../utils/textedit_value_validator.js";

export const donationCategory = { 'member': 'member', 'unknown_member': 'unkown_member' };

export function promptAddDonationsView() {
    let selectedMemberId, searchResultViewContainer;
    const dateId = 'date-el';

    const donationCategoryPicker = MondoSelect({ 'styles': [{ 'margin-bottom': '4px' }] });
    donationCategoryPicker.innerHTML = `
        <option selected value=${donationCategory.member}>${donationCategory.member}</option>
        <option  value=${donationCategory.unknown_member}>${donationCategory.unknown_member}</option>
    `

    const memberSearchI = TextEdit({ 'placeholder': 'member name' });
    const donationCommentI = TextEdit({ 'placeholder': 'comment e.g; cash, cheque, a lorry of furniture' });
    const unRecognizedMemberNameI = TextEdit({ 'styles': [HIDDEN_STYLE], 'placeholder': 'name' });
    const missionPicker = MissionPicker({ 'missions': ChurchDataHandle.churchMissions });

    donationCategoryPicker.addEventListener('change', function () {
        if (donationCategoryPicker.value === donationCategory.unknown_member) {
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

    const worthAmountI = TextEdit({ 'placeholder': 'worth/amount in KSH' }, { 'keyboardType': 'number' });
    async function saveTitheRecord() {
        try {
            let body;
            TextEditValueValidator.validate('date', dateI);
            TextEditValueValidator.validate('amount', worthAmountI);
            if (donationCategoryPicker.value === donationCategory.member) {
                if (!selectedMemberId) {
                    return MessegePopup.showMessegePuppy([MondoText({ 'text': 'select a member to continue' })])
                }
                body = {
                    donation: {
                        'member_id': selectedMemberId,
                        'date': dateI.value,
                        'worth': parseFloat(worthAmountI.value),
                        'comment': donationCommentI.value || '',
                        'category': donationCategory.member
                    }
                }
            } else {
                TextEditValueValidator.validate('member name', unRecognizedMemberNameI);
                TextEditValueValidator.validate('mission', missionPicker);
                body = {
                    donation: {
                        'name': unRecognizedMemberNameI.value,
                        'mission_id': (JSON.parse(missionPicker.value))['_id'],
                        'comment': donationCommentI.value || '',
                        'date': dateI.value,
                        'worth': parseFloat(worthAmountI.value),
                        'category': donationCategory.unknown_member
                    }
                }
            }

            let result = await Post('/church/add/donation/record', body, { 'requiresChurchDetails': true })
            let msg = result['response'];

            MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);
            if (msg.match('success') || msg.match('save')) {
                clearTextEdits([memberSearchI, worthAmountI, unRecognizedMemberNameI, dateI, worthAmountI]);
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
            donationCategoryPicker,
            missionPicker,
            memberSearchI,
            unRecognizedMemberNameI,
            donationCommentI,
            dateI,
            worthAmountI,
            submitButton,
            searchResultViewContainer
        ]
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


    ModalExpertise.showModal({
        'actionHeading': 'add donation record',
        'fullScreen': false,
        'dismisible': true,
        'modalChildStyles': [{ 'min-height': '90vh' }],
        'modalHeadingStyles': [{ 'background-color': '#ff647f' }, { 'color': 'white' }],
        'children': [memberSearchView]
    });
}

export function showDonationsWithOutstaionsReportsView() {
    const tableId = 'tithe-table';
    var missionTotalDonationWorth = 0;

    console.log(ChurchDataHandle.churchDonationRecords);

    const viewTotalsForEachDisctrictButton = domCreate('i');
    StyleView(viewTotalsForEachDisctrictButton, [{ 'color': 'rgb(161, 45, 136)' }])
    addClasslist(viewTotalsForEachDisctrictButton, ['bi', 'bi-opencollective']);

    let selectedMission;

    const missionPicker = MissionPicker({ 'missions': ChurchDataHandle.churchMissions });
    selectedMission = missionPicker.value;

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
    <td>CONTRIBUTOR</t>
    <td>KNOWN MEMBER</t>
    <td>COMMENT</t>
    <td>WORTH</t>
            `
    tableHeader.appendChild(topRow);

    const tbody = domCreate('tbody');
    const tFooter = domCreate('tfoot');

    addChildrenToView(table, [tableHeader, tbody, tFooter]);

    showMissionTotalTithe();
    setViews();

    function setViews() {
        tbody.replaceChildren([]);
        PDFPrintButton.printingHeading = `${JSON.parse(selectedMission)['name']} DONATIONS' RECORDS`
    }

    function showMissionTotalTithe() {
        let filteredWithMissions;
        missionTotalDonationWorth = 0;

        setViews();
        selectedMission = missionPicker.value;

        // DONATIONS FROM PARISH MEMBERS
        filteredWithMissions = ChurchDataHandle.churchDonationRecords.filter(function (donationRecord) {
            return (donationRecord['member_id'] && donationRecord['member_id'].length > 0);
        });

        filteredWithMissions = filteredWithMissions.filter(function (record) {
            const mission = memberGetMission(getMemberById(record['member_id']));
            record.mission = mission['name']
            return mission['_id'] === (JSON.parse(selectedMission))['_id'];
        });

        for (let i = 0; i < filteredWithMissions.length; i++) {
            const donationRecord = filteredWithMissions[i];
            const worth = parseFloat(donationRecord['worth'] || 0);

            const row = domCreate('tr');
            row.innerHTML = `
                <td>${i + 1}</td>
                <td>${donationRecord['date']}</td>
                <td>${donationRecord['name'] || getMemberById(donationRecord['member_id'])['name'] || 'unknown member'}</td>
                <td>${donationRecord['comment']}</td>
                <td>${worth}</td>
            `
            tbody.appendChild(row);
            missionTotalDonationWorth += worth;
        }
    }

    tFooter.innerHTML = `
        <tr>
            <td colspan="3">NET WORTH</td>
            <td> ${missionTotalDonationWorth}</td>
        </tr>
    `

    missionPicker.addEventListener('change', function (ev) {
        ev.preventDefault();
        setViews();
        showMissionTotalTithe();
    });

    const printButton = new PDFPrintButton(tableId);
    const containerColumn = Column({
        'classlist': ['f-w', 'a-c', 'scroll-y'],
        'styles': [{ 'margin': '10px' }],
        'children': [
            HorizontalScrollView({
                'classlist': ['a-c', 'just-center'],
                'children': [table]
            }),
        ]
    });

    const mainColumn = Column({
        'children': [
            Column({
                'classlist': ['f-w', 'just-center', 'a-c'],
                'children': [
                    missionPicker,
                ]
            }),
            containerColumn
        ]
    });


    viewTotalsForEachDisctrictButton.title = 'print whole church';
    printButton.title = 'print selection';

    // MAIN MODAL/VIEW
    ModalExpertise.showModal({
        'actionHeading': 'donations',
        'fullScreen': true,
        'topRowUserActions': [printButton],
        'children': [mainColumn],
    })
}

export function showDonationsForUnrecognizedMembersReportsView() {
    let outsideDonationTotalWorth = 0;

    const tableId = 'tithe-table';

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
            <td>CONTRIBUTOR</t>
            <td>GIVEN IN (MISSION)</t>
            <td>COMMENT</t>
            <td>MISSION</t>
            <td>WORTH</t>
            `
    tableHeader.appendChild(topRow);

    const tbody = domCreate('tbody');
    const tFooter = domCreate('tfoot');

    addChildrenToView(table, [tableHeader, tbody, tFooter]);

    function setViews() {
        PDFPrintButton.printingHeading = `${LocalStorageContract.completeChurchName()} DONATIONS' RECORDS`.toUpperCase()
    }

    setViews();
    showMissionTotalTithe();

    function showMissionTotalTithe() {
        // DONATIONS FROM PARISH MEMBERS
        const filteredWithMissions = ChurchDataHandle.churchDonationRecords.filter(function (donationRecord) {
            return !(donationRecord['member_id']);
        });

        for (let i = 0; i < filteredWithMissions.length; i++) {
            const donationRecord = filteredWithMissions[i];
            const worth = parseFloat(donationRecord['worth'] || 0);

            const row = domCreate('tr');
            row.innerHTML = `
                <td>${i + 1}</td>
                <td>${donationRecord['date']}</td>
                <td>${donationRecord['name']}</td>
                <td>${getMissionById(donationRecord['mission_id'])['name']}</td>
                <td>${donationRecord['comment']}</td >
                <td>${(getMissionById(donationRecord['mission_id']))['name']}</td >
                <td>${worth}</td>
        `
            tbody.appendChild(row);
            outsideDonationTotalWorth += worth;
        }
    }

    const row = domCreate('tr');
    row.innerHTML = `
        <td colspan="6">TOTAL</td>
        <td>${outsideDonationTotalWorth}</td>
    `
    tFooter.appendChild(row);

    const printButton = new PDFPrintButton(tableId);

    const containerColumn = Column({
        'classlist': ['f-w', 'a-c', 'scroll-y'],
        'styles': [{ 'margin': '10px' }],
        'children': [
            HorizontalScrollView({
                'classlist': ['a-c', 'just-center'],
                'children': [table]
            }),
        ]
    });

    const mainColumn = Column({
        'children': [containerColumn]
    });

    printButton.title = 'print';
    // MAIN MODAL/VIEW
    ModalExpertise.showModal({
        'actionHeading': 'donations',
        'fullScreen': true,
        'topRowUserActions': [printButton],
        'children': [mainColumn],
    })
}
