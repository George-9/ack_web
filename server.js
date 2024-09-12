import { Logger } from './debug_tools/Log.js';
import { faviconCallBack } from './routes_callbacks/faviconCallBack.js';
import { requestRegisterChurchPageCallback } from './routes_callbacks/admin/post/request_register_church.js';
import { homeCallBack } from './routes_callbacks/church/get/homeCallBack.js';
import { churchLogInCallback } from './routes_callbacks/church/post/log_in.js';
import { app as server } from './server_app/app.js';
import { ServerDetails } from './server_data/server_jug.js';
import { RegisterChurch as registerChurch } from './routes_callbacks/admin/post/register_church.js';
import { addChurchEvent, deleteChurchEvent, loadChurchEvents } from './routes_callbacks/church/post/church_events.js';
import { getAllChurchMembers } from './routes_callbacks/church/post/get_church_members.js';
import { addMember } from './routes_callbacks/church/post/add_member.js';
import { addMission } from './routes_callbacks/church/post/add_mission.js';
import { addDisctrict } from './routes_callbacks/church/post/add_district.js';
import { getMissions } from './routes_callbacks/church/post/get_missions.js';
import { getSmallChristianCommunities } from './routes_callbacks/church/post/get_districts.js';
import { getMembersFiltered } from './routes_callbacks/church/post/get_members_filtered.js';
import { addTitheRecord } from './routes_callbacks/church/post/record_tithe.js';
import { updateMemberDetails } from './routes_callbacks/church/post/update_member.js';
import { loadAllOfferingRecords } from './routes_callbacks/church/post/get_all_offering_records.js';
import { loadAllTitheRecords } from './routes_callbacks/church/post/get_tithe_records.js';
import { addContributionToProjectRecord, addProjectRecord, loadChurchProjectRecords } from './routes_callbacks/church/post/church_projects.js';
import { addOfferingRecord } from './routes_callbacks/church/post/add_offering.js';
import { addDonationRecord, loadAllDonationsRecords } from './routes_callbacks/church/post/donations.js';
import { addChurchStaff, loadAllChurchStaff } from './routes_callbacks/church/post/staff.js';
import { addGroups, getChurchGroups } from './routes_callbacks/church/post/groups.js';
import { churchGetCredentials } from './routes_callbacks/church/post/get_credentials.js';

// __________________ADMIN

/**
 * GET
 */
server.get('/rgr/psh', requestRegisterChurchPageCallback);

/**
 * POST
*/
server.post('/register/church', registerChurch);


// __________________________________PARISH

/**
 * GET REQUESTS
 */
server.get('/', homeCallBack);
server.get('/favicon.ico', faviconCallBack);


/**
 * POST REQUESTS
 */
server.post('/church/log/in', churchLogInCallback);
server.post('/church/details', churchGetCredentials);


// MEMBERS
server.post('/church/register/member', addMember);
server.post('/church/update/member/', updateMemberDetails);
server.post('/church/load/all/members', getAllChurchMembers);
server.post('/church/load/members/filtered', getMembersFiltered);

// STAFF
server.post('/church/register/staff', addChurchStaff);
server.post('/church/load/all/staff', loadAllChurchStaff);

// MISSIONS, Disctricts and GROUPS
server.post('/church/add/mission', addMission);
server.post('/church/load/all/missions', getMissions);

server.post('/church/register/group', addGroups);
server.post('/church/load/all/groups/records', getChurchGroups);

server.post('/church/add/district', addDisctrict);
server.post('/church/load/all/districts', getSmallChristianCommunities);


// TITHE
server.post('/church/record/tithe', addTitheRecord);
server.post('/church/load/all/tithe/records', loadAllTitheRecords);


// OFFERING
server.post('/church/record/offering', addOfferingRecord);
server.post('/church/load/all/offering/records', loadAllOfferingRecords);

// EVENTS | HOLIDAYS
server.post('/church/add/event', addChurchEvent);
server.post('/church/events', loadChurchEvents);
server.post('/church/delete/event', deleteChurchEvent);

// PROJECTS
server.post('/church/add/project/record', addProjectRecord);
server.post('/church/load/all/projects/records', loadChurchProjectRecords);
server.post('/church/add/project/contribution', addContributionToProjectRecord);

// DONATIONS
server.post('/church/add/donation/record', addDonationRecord);
server.post('/church/load/all/donations/records', loadAllDonationsRecords);

/**
 * safely the start server
 */
try {
    server.listen(ServerDetails.PORT, function () { Logger.log('server running'); });
} catch (error) { Logger.log(error); }