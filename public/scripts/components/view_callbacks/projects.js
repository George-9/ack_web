import { ChurchDataHandle } from "../../data_pen/church_data_handle.js";
import { getDisctrictById, getMissionDisctricts, memberGetMission, memberGetDisctrict, getMemberById, getMissionMembers } from "../../data_pen/puppet.js";
import { getChurchProjectsRecords } from "../../data_source/main.js";
import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate, domQueryById } from "../../dom/query.js";
import { clearTextEdits } from "../../dom/text_edit_utils.js";
import { Post } from "../../net_tools.js";
import { LocalStorageContract } from "../../storage/LocalStorageContract.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { MissionPicker } from "../tailored_ui/mission_picker.js";
import { PDFPrintButton } from "../tailored_ui/print_button.js";
import { Column, Row, MondoText, TextEdit, Button, MondoSelect, VerticalScrollView, MondoBigH3Text, HorizontalScrollView } from "../UI/cool_tool_ui.js";
import { addClasslist, StyleView } from "../utils/stylus.js";
import { TextEditValueValidator } from "../utils/textedit_value_validator.js";

export class ProjectSizeLeveCategories {
    static MAJOR = 'MAJOR';
    static MEDIUM = 'MEDIUM';
    static SMALL = 'SMALL';
}

export class ProjectContributionModes {
    static MISSION = 'MISSION';
    static Disctrict = 'Disctrict';
    static MEMBER = 'MEMBER';

    static ALL_MODES = [ProjectContributionModes.MEMBER, ProjectContributionModes.Disctrict, ProjectContributionModes.MISSION];
}

const projectLeveCategories = ['PARISH', 'MISSION'];

// ADD PROJECT REPORTS
export function promptAddProject() {
    const projectNameI = TextEdit({ 'placeholder': 'project name' });

    const missionPicker = MissionPicker({
        'styles': [{ 'display': 'none' }],
        'missions': ChurchDataHandle.churchMissions,
    });

    missionPicker.addEventListener('change', function (ev) {
        ev.preventDefault();
        setProjectBudget();
    })

    // const missionOptionContributionMode = domCreate('option');
    // missionOptionContributionMode.value = ProjectContributionModes.MISSION;

    // const districtPicker = MondoSelect({});

    // LEVEL OF PROJECT
    const projectChurchLevelCategoryPicker = MondoSelect({});
    projectLeveCategories.forEach(function (category, index) {
        const option = domCreate('option');
        option.innerText = category
        option.value = category
        projectChurchLevelCategoryPicker.appendChild(option);
    });
    projectChurchLevelCategoryPicker.addEventListener('change', resetViews);

    const projectContributionModePicker = MondoSelect({});

    const projectAmountPerModeBudgetI = TextEdit({
        'placeholder': 'IN KSH',
        'keyboardType': 'number'
    });

    let projectBudget = 0;
    // DISPLAYS THE AMOUNT EXPECTED PER CONTRIBUTION MODE
    const projecBudgetDisp = MondoText({
        'styles': [{ 'font-weight': '800' }],
        'text': 'amount expected'
    });

    // DISPLAY THE DEFAULT SELECTION PROJECT BUDGET
    setProjectBudget();

    function setProjectBudget() {
        switch (projectContributionModePicker.value) {
            case ProjectContributionModes.MEMBER:
                projectBudget = projectAmountPerModeBudgetI.value *
                    (projectChurchLevelCategoryPicker.value === projectLeveCategories[0]
                        ? ChurchDataHandle.churchMembers.length
                        : getMissionMembers(missionPicker.value).length);
                projecBudgetDisp.innerHTML = projectBudget;
                break;

            case ProjectContributionModes.Disctrict:
                projectBudget = projectAmountPerModeBudgetI.value * (getMissionDisctricts(missionPicker.value).length)
                projecBudgetDisp.innerHTML = projectBudget;
                break;

            case ProjectContributionModes.MISSION:
                if (projectContributionModePicker.value === ProjectContributionModes.MISSION) {
                    projectBudget = projectAmountPerModeBudgetI.value * 1;
                    projecBudgetDisp.innerHTML = projectBudget;
                } else {
                    projectBudget = projectAmountPerModeBudgetI.value * ChurchDataHandle.churchMissions.length;
                    projecBudgetDisp.innerHTML = projectBudget;
                }
                break;
            default:
                break;
        }
    }

    projectAmountPerModeBudgetI.addEventListener('input', function (ev) {
        ev.preventDefault();
        setProjectBudget();
    });

    const modeIdentityView = MondoText({ 'text': 'amount per member' });
    const amountEntryColumn = Column({
        'classlist': ['f-a-w', 'a-c'],
        'children': [
            modeIdentityView,
            projectAmountPerModeBudgetI
        ]
    })

    ProjectContributionModes.ALL_MODES.forEach(function (mode) {
        const option = domCreate('option');
        option.innerText = mode;
        option.value = mode;

        projectContributionModePicker.appendChild(option);
    });

    function resetViews(ev) {
        setProjectBudget();
        if (projectChurchLevelCategoryPicker.value === projectLeveCategories[0]) {
            StyleView(missionPicker, [{ 'display': 'none' }]);
        } else {
            StyleView(missionPicker, [{ 'display': 'block' }]);
        }

        // have the first mission as the default
        missionPicker.options[0].selected = true;
    }

    resetViews();
    const startDateI = TextEdit({ 'type': 'date' });
    const startDateRow = Column({
        'classlist': ['f-a-w', 'a-c'],
        'children': [MondoText({ 'text': 'start date' }), startDateI,]
    })

    const endDateI = TextEdit({ 'type': 'date' });
    const endDateRow = Column({
        'classlist': ['f-a-w', 'a-c'],
        'children': [MondoText({ 'text': 'end date' }), endDateI]
    });


    projectContributionModePicker.addEventListener('change', function (ev) {
        setAmountPerContributor();
    });

    function setAmountPerContributor() {
        // if (projectContributionModePicker.value === ProjectContributionModes.MEMBER) {
        //     StyleView(projectAmountPerModeBudgetI, [{ 'display': 'block' }]);
        //     StyleView(amountEntryColumn, [{ 'display': 'block' }]);
        // } else {
        //     StyleView(projectAmountPerModeBudgetI, [{ 'display': 'none' }]);
        //     StyleView(amountEntryColumn, [{ 'display': 'none' }]);
        // }
        setProjectBudget();
        modeIdentityView.innerText = 'amount per ' + projectContributionModePicker.value;
    }

    setAmountPerContributor();

    const button = Button({
        'styles': [{ 'margin-top': '20px' }],
        'text': 'submit',
        'onclick': async function () {
            try {
                TextEditValueValidator.validate('start date', startDateI);
                TextEditValueValidator.validate('end date', endDateI);

                let projetcDuration = parseInt(new Date(`${endDateI.value}`) - new Date(`${startDateI.value}`));
                if (projetcDuration < 1) {
                    return MessegePopup.showMessegePuppy([
                        MondoText({ 'text': 'end date cannot be lower than the start date' })
                    ]);
                }

                console.log(projectBudget);
                if (projectBudget <= 1000) {
                    return MessegePopup.showMessegePuppy([MondoText({ 'text': 'please check the orject details again, the project has a very low budget' })])
                }

                TextEditValueValidator.validate('amount', projectNameI);
                TextEditValueValidator.validate('project category', projectChurchLevelCategoryPicker);
                const body = {
                    project: {
                        'name': projectNameI.value,
                        'level': projectChurchLevelCategoryPicker.value,
                        'contribution_mode': projectContributionModePicker.value,
                        'budget': parseFloat(projectBudget),
                        'start_date': startDateI.value,
                        'end_date': endDateI.value,
                        'mode_amount': projectAmountPerModeBudgetI.value,

                        // the selected level of the project
                        'host': (missionPicker.style.display === 'block' && missionPicker.value)
                            ? {
                                '_id': JSON.parse(missionPicker.value)['_id'],
                                'name': (JSON.parse(missionPicker.value)['name']) + ' mission'
                            }
                            : { 'name': `${LocalStorageContract.completeChurchName()} ${projectLeveCategories[0]}` }
                    }
                }

                if (projectContributionModePicker.value === ProjectContributionModes.MEMBER) {
                    if (projectAmountPerModeBudgetI.style.display === 'block') {
                        if (!projectAmountPerModeBudgetI.value) {
                            return MessegePopup.showMessegePuppy([MondoText({ 'text': 'please enter amount per member to continue' })])
                        } else {
                            body.project.mode_amount = parseFloat(projectAmountPerModeBudgetI.value);
                        }
                    }
                }

                let result = await Post('/church/add/project/record',
                    body,
                    { 'requiresChurchDetails': true })
                let msg = result['response'];

                MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);
                if (msg.match('success') || msg.match('save')) {
                    clearTextEdits([projectNameI, projecBudgetDisp, startDateI, endDateI]);
                    ChurchDataHandle.churchProjectsRecords = await getChurchProjectsRecords();
                }
            } catch (error) {
                MessegePopup.showMessegePuppy([MondoText({ 'text': error })]);
            }
        }
    })

    const column = Column({
        'styles': [{ 'padding': '30px' }],
        'classlist': ['f-h', 'f-a-w', 'a-c', 'just-center', 'scroll-y'],
        'children': [
            projectNameI,
            Column({
                'classlist': ['f-a-w', 'a-c'],
                'children': [
                    MondoText({ 'text': 'project level' }),
                    projectChurchLevelCategoryPicker,
                ]
            }),
            missionPicker,
            Column({
                'classlist': ['f-a-w', 'a-c'],
                'children': [
                    MondoText({ 'text': 'contribution mode' }),
                    projectContributionModePicker,
                ]
            }),
            amountEntryColumn,
            Column({
                'classlist': ['f-a-w', 'a-c'],
                'children': [
                    MondoText({ 'text': 'project budget' }),
                    projecBudgetDisp,
                ]
            }),
            startDateRow,
            endDateRow,
            button
        ]
    });
    // LOOKS GOOD WITHOUT DISPLAY FLEX
    // column.classList.remove('fx-col');

    ModalExpertise.showModal({
        'modalChildStyles': [{ 'min-width': '60%' }, { 'min-height': '500px' }],
        'actionHeading': 'add Project records',
        'fullScreen': false,
        'modalChildStyles': [{ 'min-height': '600px' }, { 'min-width': '300px' }],
        'dismisible': true,
        'children': [column],
    });
}

// Project REPORTS
export async function showProjectReportView() {
    // the selected contributor id
    let selectedContributorId = '';

    const projectsColumn = Column({
        'children': []
    });

    /**
     * @todo IMPLEMENT AND MAKE GLOBAL TO THIS FILE [MODULE]
    */
    // function getProjectToTalContribution() {
    //     for (let i = 0; i < pro.length; i++) {
    //         const element = pro[i];
    //     }
    // }

    function showProjectView(projectRecord = {
        name: '',
        budget: '',
        level: '',
        mode_amount: 0,
        contribution_mode: ProjectContributionModes.ALL_MODES[0],
        contributions: []
    }) {
        const budgetColumn = Column({
            // 'styles': [{ 'margin-right': '10px' }, { 'border': '1px solid grey' }],
            'children': [
                MondoText({ 'text': 'budget' }),
                MondoText({ 'text': projectRecord['budget'] }),
            ]
        });

        const levelView = Column({
            // 'styles': [{ 'border': '1px solid grey' }],
            'children': [
                MondoText({ 'text': 'Level' }),
                MondoText({ 'text': projectRecord['level'] }),
            ]
        })

        const addProjectContributionButton = domCreate('i');
        addClasslist(addProjectContributionButton, ['bi', 'bi-plus']);
        const viewAddProjectContibutionColumn = Row({
            'styles': [{ 'border': '1px solid grey' }],
            'classlist': ['fx-row', 'a-c', 'just-center', 'c-p'],
            'children': [
                addProjectContributionButton,
                MondoText({ 'text': 'add contribution' }),
            ]
        });

        const memberSearchNameEditI = TextEdit({ 'placeholder': 'member name' });
        const searchResultViewContainer = Column({ 'children': [] });

        // DISPLAYS MEMBERS WHO MATCH SEARCH
        memberSearchNameEditI.addEventListener('input', function (ev) {
            ev.preventDefault();

            const searchKey = memberSearchNameEditI.value;
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

                    selectedContributorId = member['_id'];
                    let existingClone = domQueryById(cloneId);
                    if (existingClone) {
                        memberContributionView.removeChild(existingClone);
                    }

                    let clone = view.cloneNode(true);
                    clone.id = cloneId;

                    memberContributionView.insertBefore(clone, memberSearchNameEditI);
                    searchResultViewContainer.replaceChildren([]);
                }

                return view;
            });

            searchResultViewContainer.replaceChildren([]);
            addChildrenToView(searchResultViewContainer, matchViews);
        });

        const missionContributionPicker = MissionPicker({ 'missions': ChurchDataHandle.churchMissions })
        missionContributionPicker.addEventListener('change', function (ev) {
            selectedContributorId = (JSON.parse(missionContributionPicker.value))['_id'];
        })
        // if (projectRecord.contribution_mode === ProjectContributionModes.Disctrict) {
        //     StyleView(memberSearchNameEditI, [{ 'display': 'none' }]);
        // } else if (projectRecord.contribution_mode !== ProjectContributionModes.MISSION) {
        //     StyleView(missionPicker, [{ 'display': 'none' }]);
        // }


        const districtContributionMissionPicker = MissionPicker({ 'missions': ChurchDataHandle.churchMissions })
        districtContributionMissionPicker.addEventListener('change', function (ev) {
            districtPicker.replaceChildren([]);
            const districts = getMissionDisctricts(districtContributionMissionPicker.value);
            for (let i = 0; i < districts.length; i++) {
                const district = districts[i];
                const option = domCreate('option');
                option.innerText = district['name'];
                option.value = JSON.stringify(district);
                districtPicker.appendChild(option);
            }
            districtPicker.options[0].selected = true;
            selectedContributorId = (JSON.parse(districtPicker.value))['_id'];
        });

        const districtPicker = MondoSelect({});
        districtPicker.addEventListener('change', function (ev) {
            selectedContributorId = (JSON.parse(districtPicker.value))['_id'];
            console.log(selectedContributorId);
        });

        const districtContributionView = Column({
            'classlist': ['fx-col'],
            'styles': [{ 'display': 'none' }],
            'children': [
                MondoBigH3Text({ 'text': 'select Disctrict' }),
                districtContributionMissionPicker,
                districtPicker,
            ]
        });

        const memberContributionView = Column({
            'children': [
                MondoText({ 'text': 'search member' }),
                memberSearchNameEditI,
                searchResultViewContainer,
            ]
        })

        const projectContributionModePicker = MondoSelect({});
        ProjectContributionModes.ALL_MODES.forEach(function (mode) {
            const option = domCreate('option');
            option.innerText = mode;
            option.value = mode;
            projectContributionModePicker.appendChild(option);
        });
        projectContributionModePicker.options[0].selected = true;


        // HIDE OR DISPLAY THE RELEVANT VIEW TO ADD THE CONTRIBUTION
        projectContributionModePicker.addEventListener('change', resetContributionViews)
        function resetContributionViews() {
            if (projectContributionModePicker.value === ProjectContributionModes.MEMBER) {
                StyleView(memberContributionView, [{ 'display': 'block' }]);
                StyleView(districtContributionView, [{ 'display': 'none' }]);
                StyleView(missionContributionPicker, [{ 'display': 'none' }]);
            } else if (projectContributionModePicker.value === ProjectContributionModes.MISSION) {
                StyleView(missionContributionPicker, [{ 'display': 'block' }]);
                StyleView(districtContributionView, [{ 'display': 'none' }]);
                StyleView(memberContributionView, [{ 'display': 'none' }]);
                missionContributionPicker.options.selectedIndex = true;
                selectedContributorId = (JSON.parse(missionContributionPicker.value))['_id'];
            } else {
                StyleView(districtContributionView, [{ 'display': 'block' }]);
                StyleView(missionContributionPicker, [{ 'display': 'none' }]);
                StyleView(memberContributionView, [{ 'display': 'none' }]);
            }
        }

        resetContributionViews();

        const amountEditor = TextEdit({ 'placeholder': 'amount', 'keyboardType': 'number' });
        const submitContributionButton = Button({
            'text': 'submit',
            'onclick': async function (ev) {
                if (!selectedContributorId) {
                    return MessegePopup.showMessegePuppy([MondoText({ 'text': 'select contributor to continue' })]);
                }

                if (!amountEditor.value) {
                    return MessegePopup.showMessegePuppy([MondoText({ 'text': 'enter amount to continue' })]);
                }

                try {
                    let result = await Post('/church/add/project/contribution',
                        {
                            'contribution': {
                                'project_id': projectRecord['_id'],
                                'amount': parseFloat(amountEditor.value),

                                // can be a church, member or mission
                                'contributor_id': selectedContributorId,
                            },
                        },
                        {
                            'requiresChurchDetails': true
                        }
                    );
                    const msg = result['response'];
                    MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);
                    if (msg.match('success') || msg.match('save') || msg.match('update')) {
                        ChurchDataHandle.churchProjectsRecords = await getChurchProjectsRecords();
                        await showProjectReportView()
                    }
                } catch (err) {
                    MessegePopup.showMessegePuppy([MondoText({ 'text': err })]);
                }
            }
        })

        const col = Column({
            'classlist': ['f-w', 'a-c'],
            'children': [
                Column({
                    'children': [
                        MondoText({ 'text': 'contributor mode' }),
                        projectContributionModePicker,
                    ]
                }),
                memberContributionView,
                missionContributionPicker,
                districtContributionView,
                Column({ 'children': [MondoText({ 'text': 'amount' }), amountEditor] }),
                submitContributionButton
            ]
        });

        viewAddProjectContibutionColumn.onclick = function (ev) {
            ModalExpertise.showModal({
                'actionHeading': projectRecord.name,
                'children': [col],
            })

            return console.log(projectRecord['_id']);
        };

        // RETRIEVE A SIMPLIFIED COLLECTION OF EVERY CONTRIBUTION AND THEIR AMOUNT[SUMMED UP AMOUNT]
        function ProjectContributionData(projectRecord = { contributions: [{ contributor_id: '', amount: 0 }] }) {
            let actualContributions = {};
            for (let i = 0; i < projectRecord.contributions.length; i++) {
                const contribution = projectRecord.contributions[i];
                if (!actualContributions[contribution.contributor_id]) {
                    actualContributions[contribution.contributor_id] = {
                        'contributor_id': contribution.contributor_id,
                        'amount': parseFloat(contribution.amount),
                        'contributor_name': (getMemberById(contribution.contributor_id)
                            || getDisctrictById(contribution.contributor_id))['name']
                    }
                } else {
                    actualContributions[contribution.contributor_id]['amount'] += parseFloat(contribution.amount)
                }
            }
            return actualContributions;
        }


        const contributionsTableId = 'projects-contributions-table-1';
        function ProjectContributionViewTable(contributions) {
            const keys = Object.keys(contributions);
            const table = domCreate('table');
            const thead = domCreate('thead');
            const tbody = domCreate('tbody');
            const tfooter = domCreate('tfoot');

            let projectTotalContribution = 0;
            table.id = contributionsTableId;

            thead.innerHTML = `
            <tr>
                    <td>NO</td>
                    <td>NAME</td>
                    <td>EXPECTED</td>
                    <td>CONTRIBUTION</td>
                    <td>BAL/SURPLUS</td>
            </tr>
            `
            let balanceOrSurplusTotal = 0
            addChildrenToView(table, [thead, tbody, tfooter])
            for (let i = 0; i < keys.length; i++) {
                let modeBalOrSurplus = 0;
                const contribution = contributions[keys[i]];
                modeBalOrSurplus = parseFloat(projectRecord['mode_amount']) - contribution['amount'];
                const row = domCreate('tr');
                row.innerHTML = `
                    <td>${i + 1}</td>
                    <td>${contribution['contributor_name']}</td>
                    <td>${projectRecord['mode_amount']}</td>
                    <td>${contribution['amount']}</td>
                    <td>${modeBalOrSurplus}</td>
                `
                projectTotalContribution += parseFloat(contribution['amount']);
                addChildrenToView(table, [row]);
                balanceOrSurplusTotal += modeBalOrSurplus;
            }

            const row = domCreate('tr');
            row.innerHTML = `
                <td colspan="2">TOTAL</td>
                <td>${keys.length * parseFloat(projectRecord['mode_amount'])}</td>
                <td>${projectTotalContribution}</td>
                <td>${balanceOrSurplusTotal}</td>
            `
            addChildrenToView(tfooter, [row]);

            const column = Column({
                'styles': [{ 'margin': '30px' }],
                'children': [
                    MondoText({ 'text': `${getProjectRemainingDays(projectRecord)}` }),
                    HorizontalScrollView({
                        'children': [table]
                    })
                ]
            });

            // ModalExpertise.showModal({
            //     'actionHeading': projectRecord['name'] + ' contributions',
            //     'children': [column],
            //     'fullScreen': true,
            // })
            return column;
        }

        function getProjectRemainingDays(projectRecord) {
            const dateDifferenceInDays = ((new Date(projectRecord['end_date']) - new Date()) / (1000 * 60 * 60 * 24)).toFixed(0);
            return dateDifferenceInDays > 0 ? `${dateDifferenceInDays} days to go` : `past by ${dateDifferenceInDays} days`;
        }

        PDFPrintButton.printingHeading = `
        ${LocalStorageContract.completeChurchName()} church
        ${projectRecord.name + ' project contributions'}`.toUpperCase();

        ModalExpertise.showModal({
            'actionHeading': `${projectRecord['name']} . ${projectStartEndDateString(projectRecord)})`,
            'topRowUserActions': [
                viewAddProjectContibutionColumn,
                levelView,
                budgetColumn,
                new PDFPrintButton(contributionsTableId)
            ],
            'children': [ProjectContributionViewTable(ProjectContributionData(projectRecord))],
            'fullScreen': true,
        });
    }

    function projectStartEndDateString(projectRecord) {
        return `Starts ${new Date(projectRecord['start_date']).toDateString()} . Ends ${new Date(projectRecord['end_date']).toDateString()}`
    }

    if (ChurchDataHandle.churchProjectsRecords && ChurchDataHandle.churchProjectsRecords.length > 0) {

        ChurchDataHandle.churchProjectsRecords.forEach(function (projectRecord) {
            const column = Column({
                'styles': [{ 'outline': '1px solid grey' }, { 'width': '100%' }, { 'margin-top': '3px' }],
                'classlist': ['f-w', 'txt-c', 'a-c', 'highlightable', 'c-p'],
                'children': [
                    MondoBigH3Text({ 'text': projectRecord['name'] }),
                    MondoText({ 'text': `budget ${projectRecord['budget']}` }),
                    Row({ 'children': [MondoText({ 'text': projectStartEndDateString(projectRecord) })] }),
                ]
            });
            column.onclick = (_ev) => showProjectView(projectRecord);
            projectsColumn.appendChild(column);
        });
    } else {
        projectsColumn.appendChild(
            Column({
                'styles': [{ 'padding': '20px' }],
                'children': [
                    MondoText({
                        'text': 'no added projects'
                    })
                ]
            }));
    }

    ModalExpertise.showModal({
        'actionHeading': 'Select Project',
        'modalChildStyles': [],
        'children': [projectsColumn],
        'dismisible': true,
    });
}
