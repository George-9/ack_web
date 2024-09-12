import { ChurchDataHandle } from "../../data_pen/church_data_handle.js";
import { getMissionMembers, getMissionDisctricts, getDisctrictMembersFromList, memberGetMission, memberGetDisctrict } from "../../data_pen/puppet.js";
import { getChurchMembers } from "../../data_source/main.js";
import { PRIESTS_COMMUNITY_NAME } from "../../data_source/other_sources.js";
import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate } from "../../dom/query.js";
import { clearTextEdits } from "../../dom/text_edit_utils.js";
import { Post } from "../../net_tools.js";
import { marginRuleStyles } from "../../church_profile.js";
import { LocalStorageContract } from "../../storage/LocalStorageContract.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { addPriestCommunityOptionToPicker, MissionPicker } from "../tailored_ui/mission_picker.js";
import { PDFPrintButton } from "../tailored_ui/print_button.js";
import { Column } from "../UI/column.js";
import { Button, MondoSelect, MondoText, Row, TextEdit } from "../UI/cool_tool_ui.js";
import { addClasslist, StyleView } from "../utils/stylus.js";
import { TextEditValueValidator } from "../utils/textedit_value_validator.js";


export function promptRegiterMember() {
    const marginRuleStyles = [{ 'margin-top': '15px' }]

    const nameI = TextEdit({ 'placeholder': 'name', 'styles': marginRuleStyles });
    const dobI = TextEdit({ 'placeholder': 'date of birth', 'type': 'date', 'styles': marginRuleStyles });
    const motherNameI = TextEdit({ 'placeholder': 'mother\'s name', 'styles': marginRuleStyles });
    const fatherNameI = TextEdit({ 'placeholder': 'father\'s name', 'styles': marginRuleStyles });
    const GodParentNameI = TextEdit({ 'placeholder': 'God parent\'s', 'styles': marginRuleStyles });
    const telephoneNumberI = TextEdit({ 'placeholder': 'telephone number', 'styles': marginRuleStyles });

    const genderPicker = MondoSelect({});
    genderPicker.innerHTML = `
        <option selected>MALE</option>
        <option>FEMALE</option>
    `

    const districtPicker = MondoSelect({
        'styles': marginRuleStyles,
        'onChange': function (ev) {
            ev.preventDefault();
        },
    });

    StyleView(districtPicker, [{ 'display': 'none' }]);

    const categoryPicker = MondoSelect({});
    StyleView(categoryPicker, [{ 'display': 'none' }]);

    categoryPicker.addEventListener('change', function (ev) {
        ev.preventDefault();
        console.log(categoryPicker.value);

        if (categoryPicker.value === 'WITH Disctrict') {
            StyleView(districtPicker, [{ 'display': 'block' }]);
        } else {
            StyleView(districtPicker, [{ 'display': 'none' }]);
        }
    })

    categoryPicker.innerHTML = `
        <option selected value="${PRIESTS_COMMUNITY_NAME}">${PRIESTS_COMMUNITY_NAME}</option>
        <option value="WITH Disctrict">WITH Disctrict</option>
    `;

    const missionPicker = MissionPicker({
        'missions': ChurchDataHandle.churchMissions,
        'styles': { ...marginRuleStyles },
        'onchange': function (ev) {
            ev.preventDefault();

            StyleView(categoryPicker, [{ 'display': 'block' }]);
            districtPicker.replaceChildren([]);

            const mission = JSON.parse(missionPicker.value);
            let districts = ChurchDataHandle.churchDisctricts.filter(function (district) {
                return district['mission_id'] === mission['_id']
            });

            for (let i = 0; i < districts.length; i++) {
                const district = districts[i];

                let option = domCreate('option');
                option.innerText = district['name']
                option.value = JSON.stringify(district);

                districtPicker.appendChild(option);
            }
            districtPicker.options[0].selected = true;
        }
    });

    missionPicker.addEventListener('click', function (ev) {
        ev.preventDefault();
        StyleView(categoryPicker, [{ 'display': 'block' }]);
    });

    const button = Button({
        'text': 'submit',
        'styles': marginRuleStyles,
        onclick: async function (ev) {
            try {
                TextEditValueValidator.validate('name', nameI);
                TextEditValueValidator.validate('date of birth', dobI);
                TextEditValueValidator.validate('gender', genderPicker);
                // TextEditValueValidator.validate('telephone number', motherNameI);
                // TextEditValueValidator.validate('father\'s name', fatherNameI);
                TextEditValueValidator.validate('GodParent\'s name', GodParentNameI);

                if (!missionPicker.value || !districtPicker.value) {
                    return MessegePopup.showMessegePuppy([
                        MondoText({ 'text': 'mission and Disctrict must not be empty' })
                    ]);
                }

                let theGodParents;
                if (GodParentNameI.value && GodParentNameI.value.includes(',')) {
                    theGodParents = [...(GodParentNameI.value.split(',') || [])];
                } else {
                    theGodParents = [`${GodParentNameI.value}`.trim()];
                }

                const body = {
                    member: {
                        'name': `${nameI.value}`.trim(),
                        'gender': genderPicker.value,
                        'date_of_birth': `${dobI.value}`.trim(),
                        'mother': `${motherNameI.value}`.trim(),
                        'father': `${fatherNameI.value}`,
                        'God_Parents': theGodParents,
                        'mission_id': (JSON.parse(missionPicker.value))['_id'],
                        'district_id': (districtPicker.style.display === 'block' && districtPicker.value) ? (JSON.parse(districtPicker.value))['_id'] : 'PRIEST COMMUNITY',
                        'telephone_number': telephoneNumberI.value,
                    }
                };

                Object.keys(body.member).forEach(function (key) {
                    if (!body.member[key] || `${body.member[key]}`.match('undefined')) {
                        body.member[key] = '_'
                    }
                });

                let result = await Post('/church/register/member', body, { 'requiresChurchDetails': true });

                const msg = result['response'];
                MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);

                if (msg.match('success') || msg.match('save')) {
                    clearTextEdits([nameI, dobI, motherNameI, fatherNameI, GodParentNameI]);
                    ChurchDataHandle.churchMembers = await getChurchMembers();
                }
            } catch (error) {
                MessegePopup.showMessegePuppy([MondoText({ 'text': error })]);
            }
        }
    });

    const column = Column({
        'styles': [{ 'padding': '20px' }],
        'classlist': ['f-w', 'f-w', 'a-c', 'scroll-y'],
        'children': [
            nameI,
            genderPicker,
            dobI,
            motherNameI,
            fatherNameI,
            GodParentNameI,
            missionPicker,
            categoryPicker,
            districtPicker,
            telephoneNumberI,
            button,
        ]
    });

    // const addFieldIconButton = domCreate('i');
    // addClasslist(addFieldIconButton, ['bi', 'bi-plus']);
    // addFieldIconButton.onclick = function (ev) {
    //     ev.preventDefault();

    //     let newFieldName = prompt('new field name');
    //     if (newFieldName) {
    //         addChildrenToView(column, TextEdit({ 'placeholder': newFieldName }))
    //     }
    // }

    ModalExpertise.showModal({
        'actionHeading': 'member registration',
        'modalHeadingStyles': [{ 'background-color': 'azure' }],
        'modalChildStyles': [{ 'width': 'fit-content' }, { 'height': 'max-content' }],
        // 'topRowUserActions': [addFieldIconButton],
        'children': [column],
        'fullScreen': false,
        'dismisible': true,
    });
}

export function showMembersReportsView() {

    const tableId = 'members-table';
    const printButton = new PDFPrintButton(tableId);
    const missionPicker = MissionPicker({
        'missions': ChurchDataHandle.churchMissions,
        'styles': marginRuleStyles
    });

    StyleView(missionPicker, [{ 'padding': '10px' }]);

    const districtPicker = MondoSelect({ 'styles': marginRuleStyles });
    StyleView(districtPicker, [{ 'padding': '10px' }]);

    const table = domCreate('table');
    table.id = tableId;

    StyleView(table, [{ 'margin': '10px' }, { 'max-width': '440px' }]);
    addClasslist(table, ['txt-c', 'f-a-w']);

    const tableHeader = domCreate('thead');
    tableHeader.innerHTML = `
        <tr>
            <td>NO</td>
            <td>NAME</td>
            <td>TELEPHONE</td>
        </tr>
    `
    const tbody = domCreate('tbody');
    addChildrenToView(table, [tableHeader, tbody]);

    missionPicker.addEventListener('change', function (ev) {
        ev.preventDefault();

        districtPicker.replaceChildren([]);

        const mission = JSON.parse(missionPicker.value);
        let districts = getMissionDisctricts(mission);

        for (let i = 0; i < districts.length; i++) {
            const district = districts[i];

            let option = domCreate('option');
            option.innerText = district['name']
            option.value = JSON.stringify(district);

            districtPicker.appendChild(option);
        }

        addPriestCommunityOptionToPicker(districtPicker);

        districtPicker.options[0].selected = true;
        // set the heading of the currently selected mission
        PDFPrintButton.printingHeading = `${LocalStorageContract.completeChurchName()}
         ${JSON.parse(missionPicker.value)['name']} Mission . ${JSON.parse(districtPicker.value)['name']} Disctrict members`.toUpperCase();

        const setViews = function () {
            PDFPrintButton.printingHeading = `${LocalStorageContract.completeChurchName()}
             ${JSON.parse(missionPicker.value)['name']} Mission . ${JSON.parse(districtPicker.value)['name']} Disctrict members`.toUpperCase();

            let missionMembers = getMissionMembers(missionPicker.value);
            missionMembers = getDisctrictMembersFromList(missionMembers, districtPicker.value);
            tbody.replaceChildren([]);

            for (let i = 0; i < missionMembers.length; i++) {
                const member = missionMembers[i];
                const row = domCreate('tr');

                let telephoneNumber = member['telephone_number'];
                row.innerHTML = `
                    <td>${i + 1}</td>
                    <td>${member['name']}</td>
                    <td><a href="${'tel:' + telephoneNumber}">${telephoneNumber}</a></td>
                `
                addClasslist(row, ['highlightable'])
                // const viewMemberTd = domCreate('td');
                // const tdContent = domCreate('i');
                // addClasslist(tdContent, ['bi', 'bi-arrows-angle-expand']);

                row.onclick = function (ev) {
                    if (ev.target === row) {
                        ModalExpertise.showModal({
                            'actionHeading': `${member['name']}`.toUpperCase(),
                            'modalHeadingStyles': [{ 'background-color': 'rgb(161, 45, 136)' }, { 'color': 'white' }],
                            'modalChildStyles': [{ 'width': '60%' }],
                            'children': [memberView(member)]
                        })
                    }
                }

                // addChildrenToView(viewMemberTd, [tdContent]);
                // const printMemberView = domCreate('td');
                // const printTdContent = new PDFPrintButton('');
                // addChildrenToView(printMemberView, [printTdContent]);
                // addChildrenToView(row, [viewMemberTd]);

                tbody.appendChild(row);
            }
        }

        setViews()

        districtPicker.addEventListener('change', setViews);
    });

    const rowStyle = [{ 'width': '100%' }], classlist = ['a-c', 'space-between'],
        styles = [
            { 'font-size': '12px' },
            { 'font-weight': '800' }
        ]

    const pickersRow = Column({
        'styles': [{ 'width': 'fit-content' }],
        'classlist': ['a-c', 'a-bl'],
        'children': [
            Row({
                'children': [
                    Row({
                        'classlist': [...classlist, 'a-c', 'a-bl'],
                        'styles': rowStyle,
                        'children': [
                            MondoText({ 'text': 'MISSION ', 'styles': styles }),
                            missionPicker,
                        ]
                    }),
                    Row({
                        'classlist': [...classlist, 'a-c', 'a-bl'],
                        'styles': rowStyle,
                        'children': [
                            MondoText({ 'text': 'Disctrict', 'styles': styles }),
                            districtPicker
                        ],
                    })
                ]
            })
        ]
    });

    const membersColumn = Column({
        children: ChurchDataHandle.churchMembers.map(function (m) {
            return Column({
                'classlist': ['f-w', 'a-c', 'scroll-y'],
                'children': [
                    pickersRow,
                    table
                ]
            })
        })
    });

    ModalExpertise.showModal({
        'actionHeading': 'members reports',
        'modalHeadingStyles': [{ 'background-color': '#e2e1ef', }],
        'children': [membersColumn],
        'topRowUserActions': [printButton],
        'fullScreen': true,
    });
}

export function showMembersByMissionReportsView() {
    const tableId = 'members-table';
    const printButton = new PDFPrintButton(tableId);
    const missionPicker = MissionPicker({
        'missions': ChurchDataHandle.churchMissions,
        'styles': marginRuleStyles
    });

    StyleView(missionPicker, [{ 'padding': '10px' }]);

    const districtPicker = MondoSelect({ 'styles': marginRuleStyles });
    StyleView(districtPicker, [{ 'padding': '10px' }]);

    const table = domCreate('table');
    table.id = tableId;

    StyleView(table, [{ 'margin': '10px' }, { 'max-width': '440px' }]);
    addClasslist(table, ['txt-c', 'f-a-w']);

    const tableHeader = domCreate('thead');
    tableHeader.innerHTML = `
        <tr>
            <td>NO</td>
            <td>NAME</td>
            <td>TELEPHONE</td>
        </tr>
    `
    const tbody = domCreate('tbody');
    addChildrenToView(table, [tableHeader, tbody]);

    missionPicker.addEventListener('change', function (ev) {
        ev.preventDefault();
        setViews();
    });

    function setViews() {
        const mission = JSON.parse(missionPicker.value);
        let districts = getMissionDisctricts(mission);

        districtPicker.replaceChildren([]);

        for (let i = 0; i < districts.length; i++) {
            const district = districts[i];

            let option = domCreate('option');
            option.innerText = district['name']
            option.value = JSON.stringify(district);

            districtPicker.appendChild(option);
        }

        addPriestCommunityOptionToPicker(districtPicker);

        districtPicker.options[0].selected = true;
        // set the heading of the currently selected mission
        PDFPrintButton.printingHeading = `${LocalStorageContract.completeChurchName()}
         ${JSON.parse(missionPicker.value)['name']} Mission members`.toUpperCase();

        let missionMembers = getMissionMembers(missionPicker.value);

        tbody.replaceChildren([]);

        for (let i = 0; i < missionMembers.length; i++) {
            const member = missionMembers[i];
            const row = domCreate('tr');

            let telephoneNumber = member['telephone_number'];
            row.innerHTML = `
                            <td>${i + 1}</td>
                            <td class="txt-s">${member['name']}</td>
                            <td><a href="${'tel:' + telephoneNumber}">${telephoneNumber}</a></td>
                        `;
            addClasslist(row, ['highlightable']);
            // const viewMemberTd = domCreate('td');
            // const tdContent = domCreate('i');
            // addClasslist(tdContent, ['bi', 'bi-arrows-angle-expand']);
            row.onclick = function (ev) {
                if (ev.target === row) {
                    ModalExpertise.showModal({
                        'actionHeading': `${member['name']}`.toUpperCase(),
                        'modalHeadingStyles': [{ 'background-color': 'rgb(161, 45, 136)' }, { 'color': 'white' }],
                        'modalChildStyles': [{ 'width': '60%' }],
                        'children': [memberView(member)]
                    });
                }
            };

            // addChildrenToView(viewMemberTd, [tdContent]);
            // const printMemberView = domCreate('td');
            // const printTdContent = new PDFPrintButton('');
            // addChildrenToView(printMemberView, [printTdContent]);
            // addChildrenToView(row, [viewMemberTd]);
            tbody.appendChild(row);
        }
    }

    setViews();

    const rowStyle = [{ 'width': '100%' }], classlist = ['a-c', 'space-between'],
        styles = [
            { 'font-size': '18px' },
            { 'font-weight': '300' }
        ]

    const pickersRow = Row({
        'styles': [{ 'width': 'fit-content' }],
        'classlist': ['a-c'],
        'children': [
            Column({
                'children': [
                    Column({
                        'classlist': classlist,
                        'styles': rowStyle,
                        'children': [
                            MondoText({ 'text': 'MISSION ', 'styles': styles }),
                            missionPicker,
                        ]
                    })
                ]
            })
        ]
    });

    const membersColumn = Column({
        'classlist': ['f-w', 'a-c', 'f-a-w'],
        'children': [
            pickersRow,
            Column({
                'styles': [{ 'padding-bottom': '30px' }, { 'height': '80vh' }],
                'classlist': ['f-w', 'f-a-w', 'a-c', 'scroll-y'],
                'children': [table],
            }),
        ]
    });

    ModalExpertise.showModal({
        'actionHeading': 'members reports',
        'modalHeadingStyles': [{ 'background-color': '#e2e1ef', }],
        'children': [membersColumn],
        'topRowUserActions': [printButton],
        'fullScreen': true,
    });
}

export function memberView(member) {
    const mission = memberGetMission(member, ChurchDataHandle.churchMissions)
    const district = memberGetDisctrict(member, ChurchDataHandle.churchDisctricts);

    member['mission'] = mission['name'];
    member['district'] = district['name'];

    return Column({
        'classlist': ['f-w', 'a-c', 'scroll-y'],
        'children': Object.keys(member).map(function (key) {
            if (key !== '_id' && !`${key}`.match('_id')) {
                const valueEditor = TextEdit({ 'placeholder': key })
                valueEditor.value = member[key];

                valueEditor.addEventListener('input', function (ev) {
                    ev.preventDefault();

                    member[key] = valueEditor.value;
                })

                return Column({
                    'children': [
                        MondoText({ 'text': key.toUpperCase().split('_').join(' ') }),
                        valueEditor
                    ]
                })
            }
            return ''
        })
    });
}