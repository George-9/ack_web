import { ModalExpertise } from "./components/actions/modal.js";
import { MessegePopup } from "./components/actions/pop_up.js";
import { Button, Column, MondoBigH3Text, MondoText, Row, TextEdit, VerticalScrollView } from "./components/UI/cool_tool_ui.js";
import { TextEditError, TextEditValueValidator } from "./components/utils/textedit_value_validator.js";
import { promptAddDonationsView, showDonationsForUnrecognizedMembersReportsView, showDonationsWithOutstaionsReportsView } from "./components/view_callbacks/donations.js";
import { promptAddGroupView, showGroupsOverview } from "./components/view_callbacks/group.js";
import { showMembersReportsView as ShowMembersReportsView, promptRegiterMember, showMembersByMissionReportsView } from "./components/view_callbacks/member.js";
import { promptAddOffering, showOfferingReportsByDateAndTypeOutsationView, showOfferingReportView } from "./components/view_callbacks/offering.js";
import { promptAddMissionView, viewMissionsPage } from "./components/view_callbacks/mission.js";
import { showChurchEventsView } from "./components/view_callbacks/church_events.js";
import { promptAddStaffToChurch as promptAddChurchStaff, ViewAllChurchStaff, ViewChurchStaffByOutsation } from "./components/view_callbacks/church_staff.js";
import { promptAddProject, showProjectReportView } from "./components/view_callbacks/projects.js";
import { promptLogIn } from "./components/view_callbacks/prompt_login.js";
import { promptAddDisctrictView, showFilterebleDisctrictsPage, viewDisctrictsPage } from "./components/view_callbacks/district.js";
import { promptAddTitheView, showTitheReportsView } from "./components/view_callbacks/tithe.js";
import { ChurchDataHandle } from "./data_pen/church_data_handle.js";
import { getChurchDonationsRecords, getChurchGroupsRecords, getChurchMembers, getChurchOfferingsRecords, getChurchMissions, getChurchProjectsRecords, getChurchDisctricts, getChurchStaff, getChurchTitheRecords, churchEvents } from "./data_source/main.js";
import { PRIESTS_COMMUNITY_NAME } from "./data_source/other_sources.js";
import { domCreate, domQuery, domQueryById } from "./dom/query.js";
import { clearTextEdits } from "./dom/text_edit_utils.js";
import { work } from "./dom/worker.js";
import { Post } from "./net_tools.js";
import { DrawerMenu, Menu, populateDrawer, SubMenu } from "./populate_drawer.js";
import { LocalStorageContract } from "./storage/LocalStorageContract.js";

export const marginRuleStyles = [{ 'margin-top': '20px' }];
work(Main);

const registryClass = 'registry',
    reportsClass = 'reports',
    overView = 'overview',
    dataEntry = 'data-entry',
    admin = 'admin';

const drawerMenus = [
    new DrawerMenu('ADMIN',
        admin,
        [
            new Menu('HISTORY', 'bi-trash', admin),
            new Menu('EVENTS', 'bi-calendar', admin, showChurchEventsView),
        ],
        false
    ),
    new DrawerMenu(
        'REGISTRY',
        registryClass,
        [
            new Menu('members', 'bi-people', registryClass, promptRegiterMember),
            new Menu('Staff', 'bi-file-earmark-person', registryClass, promptAddChurchStaff),
            new Menu('Mission', 'bi-opencollective', registryClass, promptAddMissionView),
            new Menu('Disctrict', 'bi-collection', registryClass, promptAddDisctrictView),
            new Menu('Group', 'bi-plus-circle', registryClass, promptAddGroupView),
        ],
        false
    ),
    new DrawerMenu('FINANCE ENTRY',
        dataEntry,
        [
            new Menu('Offering', 'bi-cash', dataEntry, promptAddOffering),
            new Menu('Tithe', 'bi-gift', dataEntry, promptAddTitheView),
            new Menu('projects', 'bi-building-add', dataEntry, promptAddProject),
            new Menu('donations', 'bi-heart', dataEntry, promptAddDonationsView),
        ],
        false
    ),
    new DrawerMenu(
        'REPORTS',
        reportsClass,
        [
            new Menu('tithe', 'bi-cash-coin', reportsClass, showTitheReportsView),
            new Menu('offering', 'bi-cash-coin', reportsClass, showOfferingReportView,
                [
                    new SubMenu('advanced search', reportsClass, showOfferingReportsByDateAndTypeOutsationView)
                ],
            ),
            new Menu('projects', 'bi-building-add', reportsClass, showProjectReportView),
            new Menu('Disctricts (grouped)', 'bi-people', reportsClass, showFilterebleDisctrictsPage),
            new Menu('donations', 'bi-heart', reportsClass,
                showDonationsWithOutstaionsReportsView,
                [
                    new SubMenu('from outside', reportsClass, showDonationsForUnrecognizedMembersReportsView)
                ]
            ),
        ],
        false
    ),
    new DrawerMenu('OVERVIEW', overView,
        [
            new Menu('members', 'bi-people', overView, showMembersByMissionReportsView,
                [
                    new SubMenu('by Disctrict', overView, ShowMembersReportsView)
                ]
            ),
            new Menu('Staff', 'bi-people', overView, ViewAllChurchStaff,
                [
                    new SubMenu('by mission', overView, ViewChurchStaffByOutsation)
                ]
            ),
            new Menu('Missions', 'bi-collection', overView, viewMissionsPage),
            new Menu('Disctricts', 'bi-justify-right', overView, viewDisctrictsPage),
            new Menu('groups', 'bi-circle', overView, showGroupsOverview),
        ],
        false
    )
]

async function Main() {
    if (LocalStorageContract.churchNotLoggedIn()) {
        promptLogIn();
    } else {
        const drawer = domQuery('.drawer-container');

        ChurchDataHandle.churchMembers.push(...(await getChurchMembers()))
        ChurchDataHandle.churchMissions.push(...(await getChurchMissions()));
        ChurchDataHandle.churchDisctricts.push(...(await getChurchDisctricts()));
        ChurchDataHandle.churchGroups.push(...(await getChurchGroupsRecords()));
        ChurchDataHandle.churchOfferingRecords.push(...(await getChurchOfferingsRecords()));
        ChurchDataHandle.churchTitheRecords.push(...(await getChurchTitheRecords()));
        ChurchDataHandle.churchProjectsRecords.push(...(await getChurchProjectsRecords()));
        ChurchDataHandle.churchDonationRecords.push(...(await getChurchDonationsRecords()));
        ChurchDataHandle.churchStaff.push(...(await getChurchStaff()));

        ChurchDataHandle.churchDisctricts.push({
            '_id': PRIESTS_COMMUNITY_NAME,
            'name': PRIESTS_COMMUNITY_NAME
        });

        populateDrawer(drawer, drawerMenus);
        showChurchName();
        setCalendar();
        showEventsCount();


        setAnchors();
        // setProfileView();

        work(populateDrawer);
    }
}

function showProfileView() {
    ``
    let logOutView = Row({
        'styles': [
            { 'width': 'match-parent' },
        ],
        'classlist': ['f-w', 'a-c', 'txt-c', 'bi', 'c-p', 'just-end'],
        'children': [
            MondoText({
                'styles': [{ 'color': 'red' }],
                'text': 'Log Out',
            })
        ]
    })

    logOutView.onclick = LogOut;
    function LogOut() {
        localStorage.clear();
        window.location.reload()
    }

    const emailAnchor = domCreate('a');
    emailAnchor.innerText = `${LocalStorageContract.churchEmail()} MEMBERS`.toUpperCase();
    emailAnchor.href = `mailto:${LocalStorageContract.churchEmail()}`;

    const column = Column({
        'styles': [
            { 'min-width': '60%' },
            { 'padding': '10px' },
        ],
        'classlist': ['f-w', 'a-c', 'just-center'],
        'children': [
            MondoText({ 'text': `${ChurchDataHandle.churchMissions.length} MISSIONS`.toUpperCase() }),
            MondoText({ 'text': `${ChurchDataHandle.churchMembers.length} MEMBERS`.toUpperCase() }),
            emailAnchor
        ]
    });

    ModalExpertise.showModal({
        'actionHeading': `${LocalStorageContract.completeChurchName()} PARISH`.toUpperCase(),
        'topRowUserActions': [logOutView],
        'children': [column]
    });
}

async function setCalendar() {
    var calendarEl = domQueryById('calendar');

    let savedChurchEvents = await churchEvents();
    ChurchDataHandle.allChurchEvents.push(...savedChurchEvents);

    var calendar = new FullCalendar.Calendar(calendarEl, {
        headerToolbar: {
            left: '',
            center: 'title',
            right: ''
        },
        footerToolbar: false,
        events: ChurchDataHandle.allChurchEvents.map(function (ev) {
            ev['id'] = ev['_id'];
            return ev;
        }),
        dateClick: function (info) { handleDateClick(calendar, info) },
        eventClick: handleEventClick
    });

    calendar.render();

    document.getElementById('prev-button').addEventListener('click', function () {
        calendar.prev();
    });

    document.getElementById('next-button').addEventListener('click', function () {
        calendar.next();
    });

    document.getElementById('today-button').addEventListener('click', function () {
        calendar.today();
    });

    document.getElementById('month-view').addEventListener('click', function () {
        calendar.changeView('dayGridMonth');
    });

    document.getElementById('week-view').addEventListener('click', function () {
        calendar.changeView('timeGridWeek');
    });

    document.getElementById('day-view').addEventListener('click', function () {
        calendar.changeView('timeGridDay');
    });
}

function handleDateClick(calendar, info) {
    if (new Date(info.dateStr) < new Date(Date.UTC()) + 1) {
        return;
    }
    let date = info.dateStr;
    //  let delete = await Post('/church/delete/event',{

    // })

    var titleInput = TextEdit({ 'placeholder': 'enter reminder title' });
    var descInput = TextEdit({ 'placeholder': 'enter reminder description' });
    var button = Button({
        'styles': [],
        'classlist': [],
        'text': 'save',
        'onclick': async function (ev) {
            try {
                TextEditValueValidator.validate('event title', titleInput);
                TextEditValueValidator.validate('event details', descInput);

                const eventAsBody = {
                    'start': date,
                    'title': titleInput.value,
                    'description': descInput.value
                }

                let result = await Post(
                    '/church/add/event',
                    { event: eventAsBody },
                    { 'requiresChurchDetails': true }
                );
                const msg = result['response'];
                MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);

                if (msg && (msg.match('success') || msg.match('save'))) {
                    calendar.addEvent({
                        'title': eventAsBody.title,
                        'start': eventAsBody.start,
                        'description': eventAsBody.description
                    });

                    clearTextEdits([titleInput, descInput]);
                }
            } catch (err) {
                if (err instanceof TextEditError) {
                    MessegePopup.showMessegePuppy(err.message);
                }
            }
        }
    });

    button.style.marginTop = '50px';

    const column = VerticalScrollView({
        'children': [titleInput, descInput, button],
        'classlist': ['m-pad', 'f-w', 'a-c'],
        'styles': []
    });


    ModalExpertise.showModal({
        'children': [column],
        'topRowUserActions': [],
        'modalHeadingStyles': [
            // { 'background-color': 'goldenrod' },
            { 'background-color': '#263e41' },
            { 'color': 'lightgoldenrodyellow' },
        ],
        'actionHeading': 'create new event for date: ' + date,
        'modalChildStyles': [
            { 'max-width': '400px' },
            { 'height': '600px' }
        ],
    });
}

function handleEventClick(info) {
    console.log(info);

    let clickedEvent = (ChurchDataHandle.allChurchEvents.find(function (event) {
        return event._id === info.event.extendedProps._id
    }));

    const column = Column({
        'classlist': ['txt-c'],
        'styles': [{ 'padding': '10px' }],
        'children': [
            MondoBigH3Text({ 'text': clickedEvent.title }),
            MondoText({ 'text': clickedEvent.description }),
        ]
    });

    ModalExpertise.showModal({
        'actionHeading': clickedEvent.start,
        'modalChildStyles': [
            { 'width': '300px' },
            { 'height': '300px' },
        ],
        'topRowUserActions': [],
        'children': [column],
        'dismisible': true,
    });
}

function showChurchName() {
    domQueryById('church-name').innerText = `${LocalStorageContract.completeChurchName()} church`
}

function showEventsCount() {
    churchEvents().then(function (events) {
        domQueryById('events-count').innerText = (!events || !events.length || events.length < 1)
            ? 'no events have been added'
            : `${events.length} events`
    });
}

function setAnchors() {
    domQueryById('profile-setting-view').onclick = showProfileView;

    const fullscreenButton = domQueryById('v-mode');
    fullscreenButton.title = 'enter fullscreen';

    fullscreenButton.onclick = function (ev) {
        if (!window.document.fullscreenElement) {
            window.document.documentElement.requestFullscreen();
            fullscreenButton.title = 'exit fullscreen'
        } else if (document.exitFullscreen) {
            window.document.exitFullscreen();
            fullscreenButton.title = 'enter fullscreen'
        }
    };
}

// function openRegistryActionsOptions() {
//     const buttonStyles = [{ 'margin-top': '15px' }]

//     const regstrationButtons = [
//         Button({ 'text': 'register a member', 'styles': buttonStyles, 'onclick': promptRegiterMember }),
//         Button({ 'text': 'add mission', 'styles': buttonStyles, onclick: promptAddMissionView }),
//         Button({ 'text': 'add district', 'styles': buttonStyles, 'onclick': promptAddDisctrictView }),
//         Button({ 'text': 'add group', 'styles': buttonStyles }),
//         Button({ 'text': 'add tithe record', 'styles': buttonStyles, 'onclick': promptAddTitheView }),
//         Button({ 'text': 'add offering record', 'styles': buttonStyles, 'onclick': promptAddOffering }),
//     ]

//     const column = Column({
//         'children': regstrationButtons,
//         'classlist': ['f-w', 'f-h', 'just-center', 'a-c', 'scroll-y'],
//         'styles': [{ 'background-color': 'gainsboro' }]
//     });

//     ModalExpertise.showModal({
//         'actionHeading': 'registry',
//         'children': [column],
//         'fullScreen': true,
//         'dismisible': true,
//         'modalChildStyles': []
//     });
// }

// function showMembersReportsPage() {
//     let agridApi;

//     const membersGridDiv = domCreate('div');
//     addClasslist(membersGridDiv, ['ag-theme-alpine']);
//     StyleView(membersGridDiv, [{ 'height': '500px' }]);

//     const column = Column({
//         'children': [membersGridDiv],
//         'styles': [{ 'padding': '20px' }]
//     });

//     let gridOptions = {
//         'columnDefs': [
//             {
//                 'field': 'member_number',
//                 'headerName': 'NO',
//                 'filter': true,
//             },
//             {
//                 'field': 'name',
//                 'headerName': 'NAME',
//                 'filter': true,
//             },
//             {
//                 'field': 'date_of_birth',
//                 'headerName': 'DATE OF BIRTH',
//             },
//         ],
//         'rowData': churchMembers,
//         'pagination': true,
//         'onRowClicked': function (ev) {
//             const member = ev.data;

//             const updateIcon = domCreate('i');
//             addClasslist(updateIcon, ['bi', 'bi-save'])

//             updateIcon.onclick = async function (ev) {
//                 ev.preventDefault();

//                 let newDetails = member;

//                 delete newDetails['mission']
//                 delete newDetails['district']

//                 let updateResult = await Post('/church/update/member',
//                     { member: newDetails },
//                     { 'requiresChurchDetails': true });

//                 MessegePopup.showMessegePuppy([
//                     MondoText({ 'text': updateResult['response'] })
//                 ]);
//             }

//             ModalExpertise.showModal({
//                 'actionHeading': member['name'],
//                 'topRowUserActions': [updateIcon],
//                 'children': [memberView(member)],
//                 'modalChildStyles': [{ 'width': '400px', 'height': '600px' }]
//             });
//         }
//     };

//     agridApi = agGrid.createGrid(membersGridDiv, gridOptions);

//     const resizedView = Column({
//         'classlist': ['f-w', 'f-h', 'scroll-y'],
//         'children': [column]
//     });

//     ModalExpertise.showModal({
//         'actionHeading': 'MEMBERS',
//         'fullScreen': true,
//         'children': [resizedView]
//     });
// }


// function showAllReportsMenuPage() {
//     const membersIcon = domCreate('i');
//     membersIcon.title = 'members';
//     addClasslist(membersIcon, ['bi', 'bi-people', 'bi-pad']);

//     const offeringsIcon = domCreate('i');
//     offeringsIcon.title = 'offering';
//     addClasslist(offeringsIcon, ['bi', 'bi-cash-coin', 'bi-pad']);

//     const titheIcon = domCreate('i');
//     titheIcon.title = 'tithe';
//     addClasslist(titheIcon, ['bi', 'bi-gift', 'bi-pad']);


//     const membersColumn = MembersReportsView();
//     const offeringReportView = OfferingReportView();
//     const mainView = Column({ 'classlist': ['f-w', 'a-c'], 'children': [membersColumn] });

//     membersIcon.onclick = function () {
//         mainView.replaceChildren([]);
//         addChildrenToView(mainView, [membersColumn]);
//     }

//     offeringsIcon.onclick = function () {
//         mainView.replaceChildren([]);
//         addChildrenToView(mainView, [offeringReportView]);
//     }

//     // membersIcon.onclick = function () {
//     //     mainView.replaceChildren([]);
//     //     addChildrenToView(mainView, [membersColumn]);
//     // }


//     ModalExpertise.showModal({
//         'actionHeading': `reports`,
//         'modalHeadingStyles': [{ 'background-color': '#aebdeb' }],
//         'children': [mainView],
//         'fullScreen': true,
//         'topRowUserActions': [membersIcon, offeringsIcon, titheIcon]
//     });

// }
