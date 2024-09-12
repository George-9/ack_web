import { ChurchDataHandle } from "../../data_pen/church_data_handle.js";
import { getChurchOfferingsRecords } from "../../data_source/main.js";
import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate } from "../../dom/query.js";
import { clearTextEdits } from "../../dom/text_edit_utils.js";
import { Post } from "../../net_tools.js";
import { marginRuleStyles } from "../../church_profile.js";
import { LocalStorageContract } from "../../storage/LocalStorageContract.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { MissionPicker } from "../tailored_ui/mission_picker.js";
import { PDFPrintButton } from "../tailored_ui/print_button.js";
import { Column, Row, MondoText, TextEdit, Button, MondoSelect, HorizontalScrollView } from "../UI/cool_tool_ui.js";
import { GridView } from "../UI/grid.js";
import { addClasslist, StyleView } from "../utils/stylus.js";
import { TextEditValueValidator } from "../utils/textedit_value_validator.js";

export const OfferingTypes = { 'SUNDAY OFFERING': 'sunday_offering', 'OTHER OFFERING': 'other_offering' }

// ADD OFFERING REPORTS
export function promptAddOffering() {
    const missionPicker = MissionPicker({ 'missions': ChurchDataHandle.churchMissions });
    const dateI = TextEdit({ 'type': 'date' });
    const amountI = TextEdit({ 'placeholder': 'amount', 'keyboardType': 'number' });

    const sourceSelect = MondoSelect({});
    sourceSelect.innerHTML = `
        <option value="${OfferingTypes["SUNDAY OFFERING"]}" selected>Sunday Offering</option>
        <option value="${OfferingTypes["OTHER OFFERING"]}">Other Offering</option>
    `

    const button = Button({
        'text': 'submit', 'onclick': async function () {
            TextEditValueValidator.validate('mission', missionPicker);
            TextEditValueValidator.validate('amount', amountI);
            TextEditValueValidator.validate('date', dateI);

            const body = {
                offering: {
                    mission_id: JSON.parse(missionPicker.selectedOptions[0].value)['_id'],
                    source: sourceSelect.selectedOptions[0].value,
                    date: dateI.value,
                    amount: amountI.value,
                }
            }

            let result = await Post('/church/record/offering', body, { 'requiresChurchDetails': true })
            let msg = result['response'];
            MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);

            if (msg.match('success') || msg.match('save')) {
                clearTextEdits([amountI]);
                ChurchDataHandle.churchOfferingRecords = await getChurchOfferingsRecords();
            }
        }
    });

    const column = Column({
        'classlist': ['f-w', 'f-h', 'a-c', 'm-pad'],
        'children': [
            missionPicker,
            sourceSelect,
            dateI,
            amountI,
            button
        ]
    });

    ModalExpertise.showModal({
        'modalHeadingStyles': [{ 'background-color': 'rgb(161, 45, 136)' }, { 'color': 'white' }],
        'actionHeading': 'add offering records',
        'modalChildStyles': [{ 'height': '400px' }],
        'dismisible': true,
        'children': [column],
    });
}


// OFFERING REPORTS
export async function showOfferingReportView() {
    let missionTotal = 0;

    const offeringTypeOption = MondoSelect({});
    offeringTypeOption.innerHTML = `
        <option value="${OfferingTypes["SUNDAY OFFERING"]}" selected>Sunday Offering</option>
        <option value="${OfferingTypes["OTHER OFFERING"]}">Other Offering</option>
    `
    const missionPicker = MissionPicker({
        'missions': ChurchDataHandle.churchMissions,
        'styles': marginRuleStyles,
        'onchange': setRowsValue
    });

    StyleView(missionPicker, [{ 'padding': '10px' }]);

    const offeringTableId = 'offering-table';
    const table = domCreate('table');
    table.id = offeringTableId;
    StyleView(table, [{
        'margin': '20px',
        'min-width': '300px',
        'border-collapse': 'collapse'
    }]);

    const tableHeader = domCreate('thead');
    tableHeader.innerHTML = `
        <tr>
            <td>NO</td>
            <td>DATE</td>
            <td>MISSION</td>
            <td>AMOUNT</td>
        </tr>
    `
    const tbody = domCreate('tbody');
    addChildrenToView(table, [tableHeader, tbody]);

    function setRowsValue() {
        tbody.replaceChildren([]);

        missionTotal = 0;
        const existingFooter = table.querySelector('tfoot');
        if (existingFooter) {
            table.removeChild(existingFooter);
        }

        const mission = JSON.parse(missionPicker.value);
        let missionsOfferings = ChurchDataHandle.churchOfferingRecords.filter(function (offering) {
            return mission['_id'] === offering['mission_id'];
        });

        if (missionsOfferings && missionsOfferings.length < 1) {
            const emptyOfferingRow = domCreate('tr');
            const emptyOfferingView = Row({
                'children': [MondoText({ 'text': 'no offering records were found in this mission' })]
            });
            emptyOfferingRow.innerHTML = `<td colspan="4">
            ${emptyOfferingView.innerHTML}
            </td>`;
            tbody.appendChild(emptyOfferingRow);

            return
        }

        tbody.replaceChildren([]);
        for (let i = 0; i < missionsOfferings.length; i++) {
            const missionsOffering = missionsOfferings[i];
            const row = domCreate('tr');

            let missionAmount = missionsOffering['amount'];
            row.innerHTML = `
            <td> ${i + 1}</td>
            <td>${missionsOffering['date']}</td>
            <td style="text-align: center;">${ChurchDataHandle.churchMissions.find(function (o) {
                return o['_id'] === missionsOffering['mission_id']
            })['name']}</td>
            <td>${missionAmount}</td>
            `
            tbody.appendChild(row);

            missionTotal += parseFloat(missionAmount);
        }
        PDFPrintButton.printingHeading = `${mission['name']} MISSION OFFERING`;

        const tFooter = domCreate('tfoot');
        tFooter.innerHTML = `
            <tr>
                <td colspan="3">TOTAL</td>
                <td>${missionTotal}</td>
            </tr>
            `
        table.appendChild(tFooter);
    }

    // initialize view with a table
    setRowsValue();

    const offeringColumn = Column({
        'classlist': ['f-w', 'a-c'],
        'children': [
            offeringTypeOption,
            missionPicker,
            HorizontalScrollView({
                'classlist': ['scroll-y', 'f-w', 'just-center', 'a-c'],
                'children': [table]
            })
        ]
    });

    function showWholeChurchOfferingRecords() {
        PDFPrintButton.printingHeading = LocalStorageContract.completeChurchName() + ' TITHE RECORDS'

        const tableId = 'all-missions-offering';
        const table = domCreate('table');
        table.id = tableId;

        const tableHead = domCreate('thead');
        tableHead.innerHTML = `
            <tr>
                <td>NO</td>
                <td>MISSION</td>
                <td>AMOUNT</td>
            </tr>
        `
        const tbody = domCreate('tbody');
        const tfoot = domCreate('tfoot');
        addChildrenToView(table, [tableHead, tbody, tfoot]);

        const column = HorizontalScrollView({
            'classlist': ['f-w', 'a-c', 'just-center'],
            'styles': [{ 'margin': '20px' }],
            'children': [table],
        });

        let mappedData = {};
        for (let i = 0; i < ChurchDataHandle.churchMissions.length; i++) {
            const mission = ChurchDataHandle.churchMissions[i];
            mappedData[mission['_id']] = {
                'name': mission['name'],
                '_id': mission['_id'],
                'amount': 0
            }
        }

        let churchTotal = 0;
        const keys = Object.keys(mappedData)
        for (let i = 0; i < keys.length; i++) {
            const missionOfferingRecord = mappedData[keys[i]];
            for (let i = 0; i < ChurchDataHandle.churchOfferingRecords.length; i++) {
                const offeringRecord = ChurchDataHandle.churchOfferingRecords[i];
                if (missionOfferingRecord['_id'] === offeringRecord['mission_id']) {
                    churchTotal += missionOfferingRecord['amount'] += parseFloat(offeringRecord['amount'])
                }
            }
        }

        for (let i = 0; i < keys.length; i++) {
            const data = mappedData[keys[i]];

            const row = domCreate('tr');
            row.innerHTML = `
            <td>${i + 1}</td>
            <td>${data['name']}</td>
            <td>${data['amount']}</td>
            `
            addChildrenToView(tbody, [row]);
        }
        const row = domCreate('tr');
        row.innerHTML = `
        <td colspan="2">TOTAL</td>
            <td>${churchTotal}</td>
            `
        addChildrenToView(tfoot, [row]);
        // VERY USEFUL REDISH PINKISH COLOR
        // [{ 'background-color': '#ff9f9f' }]
        // ALSO THIS
        // #8000003d
        const bgStyles = [{ 'background-color': '#d5d3db' }]
        ModalExpertise.showModal({
            'modalHeadingStyles': [{ 'background-color': 'conrflowerblue' }, { 'color': 'white' }],
            'actionHeading': 'church offering records',
            'modalHeadingStyles': bgStyles,
            'modalChildStyles': [{ 'min-width': '50%' }],
            'topRowUserActions': [new PDFPrintButton(tableId)],
            'children': [column]
        });
    }

    const showWholeChurchOfferingRecordsButton = domCreate('i')
    showWholeChurchOfferingRecordsButton.title = 'whole church records'
    addClasslist(showWholeChurchOfferingRecordsButton, ['bi', 'bi-wallet2'])
    showWholeChurchOfferingRecordsButton.onclick = showWholeChurchOfferingRecords;

    // StyleView(showWholeChurchOfferingRecordsButton,
    //     [
    //         { 'background-color': 'gainsboro' },
    //         { 'color': 'black' },
    //         { 'width': 'auto' },
    //         { 'border-radius': '120px' },
    //     ])

    ModalExpertise.showModal({
        'actionHeading': 'offering reports',
        'modalHeadingStyles': [{ 'background-color': 'rgb(161, 45, 136)' }, { 'color': 'white' }],
        'children': [offeringColumn],
        'topRowUserActions': [showWholeChurchOfferingRecordsButton, new PDFPrintButton(offeringTableId)],
        'fullScreen': true,
        'dismisible': true,
    });
}

export async function showOfferingReportsByDateAndTypeOutsationView() {
    const missionPicker = MissionPicker({
        'missions': ChurchDataHandle.churchMissions,
        'styles': marginRuleStyles,
        'onchange': setRowsValue
    });

    const dateSpanPicker = MondoSelect({ onChange: setRowsValue });
    dateSpanPicker.innerHTML = `
        <option selected value="equal">equal</option>
        <option value="before">before</option>
        <option value="after">after</option>
        <option value="between">between</option>
    `

    const viewing = { 'display': 'block' },
        notViewing = { 'display': 'none' };

    const offeringTypeOptionPicker = MondoSelect({});

    const dateEntryElStyles = [{ 'padding': '10px' }];
    const startDateSelect = TextEdit({ 'type': 'date', 'styles': dateEntryElStyles },);
    const endDateSelect = TextEdit({ 'type': 'date', 'styles': dateEntryElStyles });

    startDateSelect.addEventListener('change', setRowsValue);
    startDateSelect.addEventListener('input', setRowsValue)

    endDateSelect.addEventListener('change', setRowsValue);
    endDateSelect.addEventListener('input', setRowsValue);

    offeringTypeOptionPicker.addEventListener('change', function (ev) {
        ev.preventDefault();
        setRowsValue();
    });

    offeringTypeOptionPicker.innerHTML = `
    <option value="${OfferingTypes["SUNDAY OFFERING"]}">Sunday Offering</option>
    <option value="${OfferingTypes["OTHER OFFERING"]}">Other Offering</option>
    <option value="ALL" selected>ALL</option>
    `

    StyleView(missionPicker, [{ 'padding': '10px' }]);

    const offeringTableId = 'offering-table';
    const table = domCreate('table');
    table.id = offeringTableId;
    StyleView(table, [{
        'margin': '20px',
        'min-width': '300px',
        'border-collapse': 'collapse'
    }]);

    const tableHeader = domCreate('thead');
    tableHeader.innerHTML = `
    <tr>
        <td>NO</td>
        <td>DATE</td>
        <td>SOURCE</td>
        <td>MISSION</td>
    </tr>
    `
    const tbody = domCreate('tbody');
    const tFooter = domCreate('tfoot');

    addChildrenToView(table, [tableHeader, tbody, tFooter]);

    function setRowsValue() {
        tbody.replaceChildren([]);
        tFooter.replaceChildren([]);

        const mission = JSON.parse(missionPicker.value);
        const missionId = mission['_id'];

        PDFPrintButton.printingHeading = `${mission['name']} MISSION OFFERING`;

        let selectedMissionOfferings = ChurchDataHandle.churchOfferingRecords.filter(function (offering) {
            return offering['mission_id'] === missionId;
        });

        let filteredOfferings = selectedMissionOfferings;

        if (offeringTypeOptionPicker.value !== 'ALL') {
            filteredOfferings = selectedMissionOfferings.filter(function (offering) {
                return offering['source'] === offeringTypeOptionPicker.value;
            });
        }

        /**
         * APPLY DATE FILTERS
        */

        if (dateSpanPicker.value === "between") {
            StyleView(endDateSelect, [viewing]);
            filteredOfferings = filteredOfferings.filter(function (offering) {
                const date = new Date(offering['date']);
                if (!endDateSelect.value) {
                    return (date > new Date(startDateSelect.value || new Date().toDateString()));
                } else {
                    return (date > new Date(startDateSelect.value || new Date().toDateString()))
                        &&
                        (date < new Date(endDateSelect.value || new Date().toDateString()));
                }
            });
        } else {
            StyleView(endDateSelect, [notViewing]);
        }

        if (dateSpanPicker.value === "before") {
            filteredOfferings = filteredOfferings.filter(function (offering) {
                const date = new Date(offering['date']);
                const diff = (new Date(new Date(startDateSelect.value).toDateString() || new Date().toDateString()) - date);
                console.log(`start${new Date(startDateSelect.value)} - date ${new Date(date)}`, new Date(date) - new Date(startDateSelect.value), '::', 'before diff', new Date(startDateSelect.value) > date);
                return (new Date(startDateSelect.value) > date);
            });
        }

        if (dateSpanPicker.value === "after") {
            filteredOfferings = filteredOfferings.filter(function (offering) {
                const date = new Date(offering['date']);
                return (date > new Date(startDateSelect.value || new Date().toDateString()));
            });
        }

        if (dateSpanPicker.value === "equal") {
            filteredOfferings = filteredOfferings.filter(function (offering) {
                const date = new Date(offering['date']);
                return (new Date(startDateSelect.value || new Date().toDateString()) - date === 0);
            });
        }

        if (selectedMissionOfferings && selectedMissionOfferings.length < 1) {
            const emptyOfferingRow = domCreate('tr');
            const emptyOfferingView = Row({
                'children': [MondoText({ 'text': 'no offering records were found in this mission' })]
            });
            emptyOfferingRow.innerHTML = `<td colspan="4">
            ${emptyOfferingView.innerHTML}
            </td>`;
            tbody.appendChild(emptyOfferingRow);

            return
        }

        if (filteredOfferings && filteredOfferings.length < 1) {
            const emptyOfferingRow = domCreate('tr');
            const emptyOfferingView = Row({
                'children': [
                    MondoText({
                        'styles': [{ 'width': 'max-content' }],
                        'text': 'no offering records matching your query were found in this mission'
                    })
                ]
            });
            emptyOfferingRow.innerHTML = `<td colspan="4">
            ${emptyOfferingView.innerHTML}
            </td>`;
            tbody.appendChild(emptyOfferingRow);

            return
        }

        let missionTotal;
        for (let i = 0; i < filteredOfferings.length; i++) {
            const offeringRecord = filteredOfferings[i];
            const row = domCreate('tr');

            missionTotal = 0;
            let offeringAmount = offeringRecord['amount'],
                source = offeringRecord['source'],
                date = new Date(offeringRecord['date']).toDateString();

            row.innerHTML = `
            <td> ${i + 1}</td>
            <td>${date}</td>
            <td>${Object.entries(OfferingTypes).find(function (entry) {
                return entry[1] === source;
            })[0]}
            </td>
            <td>${offeringAmount}</td>
            `
            tbody.appendChild(row);

            missionTotal += parseFloat(offeringAmount);
        }

        tFooter.innerHTML = `
            <tr>
                <td colspan="3">TOTAL</td>
                <td>${missionTotal}</td>
            </tr>
            `
    }

    // initialize view with a table
    setRowsValue();

    const offeringColumn = Column({
        'classlist': ['f-w', 'a-c', 'scroll-y', 'hide-scroll-x'],
        'children': [

            HorizontalScrollView({
                'classlist': ['f-w', 'a-c', 'just-center'],
                'children': [table]
            })
        ]
    });

    dateSpanPicker.addEventListener('change', setRowsValue);
    const dateCheckersRow = Row({
        'styles': [{ 'align-items': 'baseline' }],
        'classlist': ['a-c', 'just-center'],
        'children': [
            MondoText({ 'text': 'date' }),
            dateSpanPicker,
            endDateSelect,
            startDateSelect,
        ]
    });

    ModalExpertise.showModal({
        'actionHeading': 'offering reports',
        'modalHeadingStyles': [{ 'background-color': 'rgb(161, 45, 136)' }, { 'color': 'white' }],
        'topRowClasses': ['a-c', 'space-around', 'scroll-x'],
        'topRowUserActions': [
            dateCheckersRow,
            new PDFPrintButton(offeringTableId)
        ],
        'children': [
            GridView({
                'classlist': ['f-w', 'a-c', 'just-center'],
                'children': [
                    offeringTypeOptionPicker,
                    missionPicker,
                ]
            }),
            offeringColumn
        ],
        'fullScreen': true,
        'dismisible': true,
    });
}


// function showWholeChurchOfferingRecords() {
//     PDFPrintButton.printingHeading = LocalStorageContract.churchName() + ' PARISH TITHE RECORDS'

//     const tableId = 'all-missions-offering';
//     const table = domCreate('table');
//     table.id = tableId;

//     const tableHead = domCreate('thead');
//     tableHead.innerHTML = `
//         <tr>
//             <td>NO</td>
//             <td>MISSION</td>
//             <td>AMOUNT</td>
//         </tr>
//     `
//     const tbody = domCreate('tbody');
//     const tfoot = domCreate('tfoot');
//     addChildrenToView(table, [tableHead, tbody, tfoot]);

//     const column = Column({
//         'styles': [{ 'margin': '20px' }],
//         'children': [table],
//     });

//     let mappedData = {};
//     for (let i = 0; i < ChurchDataHandle.churchMissions.length; i++) {
//         const mission = ChurchDataHandle.churchMissions[i];
//         mappedData[mission['_id']] = {
//             'name': mission['name'],
//             '_id': mission['_id'],
//             'amount': 0
//         }
//     }

//     let churchTotal = 0;
//     const keys = Object.keys(mappedData)
//     for (let i = 0; i < keys.length; i++) {
//         const missionOfferingRecord = mappedData[keys[i]];
//         for (let i = 0; i < ChurchDataHandle.churchOfferingRecords.length; i++) {
//             const offeringRecord = ChurchDataHandle.churchOfferingRecords[i];
//             if (missionOfferingRecord['_id'] === offeringRecord['mission_id']) {
//                 churchTotal += missionOfferingRecord['amount'] += parseFloat(offeringRecord['amount'])
//             }
//         }
//     }

//     for (let i = 0; i < keys.length; i++) {
//         const data = mappedData[keys[i]];

//         const row = domCreate('tr');
//         row.innerHTML = `
//             <td>${i + 1}</td>
//             <td>${data['name']}</td>
//             <td>${data['amount']}</td>
//             `
//         addChildrenToView(tbody, [row]);
//     }
//     const row = domCreate('tr');
//     row.innerHTML = `
//         <td colspan="2">TOTAL</td>
//         <td>${churchTotal}</td>
//         `
//     addChildrenToView(tfoot, [row]);
//     // VERY USEFUL REDISH PINKISH COLOR
//     // [{ 'background-color': '#ff9f9f' }]
//     // ALSO THIS
//     // #8000003d
//     const bgStyles = [{ 'background-color': '#9fffb4' }]
//     ModalExpertise.showModal({
//         'actionHeading': 'church offering records',
//         'modalHeadingStyles': bgStyles,
//         'topRowUserActions': [new PDFPrintButton(tableId)],
//         'children': [column]
//     });
// }

// const showWholeChurchOfferingRecordsButton = domCreate('i')
// showWholeChurchOfferingRecordsButton.title = 'whole church records'
// addClasslist(showWholeChurchOfferingRecordsButton, ['bi', 'bi-wallet2'])
// showWholeChurchOfferingRecordsButton.onclick = showWholeChurchOfferingRecords;

// StyleView(showWholeChurchOfferingRecordsButton,
//     [
//         { 'background-color': 'gainsboro' },
//         { 'color': 'black' },
//         { 'width': 'auto' },
//         { 'border-radius': '120px' },
//     ])
