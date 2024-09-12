import { PRIESTS_COMMUNITY_NAME } from "../data_source/other_sources.js";
import { ChurchDataHandle } from "./church_data_handle.js";

export function memberGetMission(member) {
    return ChurchDataHandle
        .churchMissions
        .find(function (o) { return o['_id'] === member['mission_id'] });
}

export function memberGetDisctrict(member) {
    return ChurchDataHandle
        .churchDisctricts
        .find(function (district) { return district['_id'] === member['district_id'] })
        ||
    {
        '_id': PRIESTS_COMMUNITY_NAME,
        'name': PRIESTS_COMMUNITY_NAME
    };
}

/**
 * Retrieves all the Disctricts of a given Mission
 * 
 * @param {string} missionId the mission
 * @returns {object[]} list of Disctricts
 */
export function getMissionDisctricts(mission = '') {
    return ChurchDataHandle.churchDisctricts.filter(function (Disctrict) {
        return Disctrict['mission_id'] === (mission['_id'] || (JSON.parse(mission))['_id']);
    })
}

/**
 * returns the mebers of a given mission
 * @param {object | string} missionId
 */
export function getMissionMembers(mission = '') {
    return ChurchDataHandle
        .churchMembers
        .filter(function (member) {
            return member['mission_id'] === (mission['_id'] || (JSON.parse(mission))['_id']);
        });
}

/**
 * Retrieves al the members of a given Disctrict
 * 
 * @param {string} districtId 
 * @returns {object[]} list of members
 */
export function getDisctrictMembers(district, mission) {
    let missionMmebers = getMissionMembers(mission);
    let DisctrictId = (district['_id'] || (JSON.parse(district))['_id'])

    return missionMmebers.filter(function (member) {
        return member['district_id'] === DisctrictId;
    });
}


/**
 * Retrieves al the members of a given Disctrict from a specific list of members
 * 
 * @param {string} districtId 
 * @param {object[]} [members=[]] 
 * @returns {object[]} list of members
 */
export function getDisctrictMembersFromList(members = [], district) {
    let DisctrictId = (district['_id'] || (JSON.parse(district))['_id'])

    return members.filter(function (member) {
        return member['district_id'] === DisctrictId;
    });
}

/**
 * retrieves an mission by it's id
 * @param {string} id mission id
 * @returns {object} mission
 */
export function getMissionById(id = '') {
    return ChurchDataHandle.churchMissions.find(function (mission) {
        return (mission['_id'] || (JSON.parse(mission))['_id']) === id;
    })
}

/**
 * Retrieves a member by a given id
 * 
 * @param { string } memberId
 * @returns { object } member
 */
export function getMemberById(memberId) {
    return ChurchDataHandle.churchMembers.find(function (member) {
        return member['_id'] === memberId;
    });
}

/**
 * Retrieves an Disctrict by a given id
 * 
 * @param { string } districtID
 * @returns { object } Disctrict
 */
export function getDisctrictById(districtID) {
    return (
        ChurchDataHandle.churchDisctricts.find(function (Disctrict) { return Disctrict['_id'] === districtID; })
        ||
        { '_id': PRIESTS_COMMUNITY_NAME, 'name': PRIESTS_COMMUNITY_NAME }
    );
}

// /**
//  * gets the tithe records of those members who belong to this Disctrict
//  * @param {object} Disctrict
//  */
// export function DisctrictGetTitheRecords(Disctrict) {
//     const DisctrictMembers = getDisctrictMembers(Disctrict,ou);
//     return ChurchDataHandle.churchTitheRecords.filter(function (titheRecord) {
//         return DisctrictMembers.some(function (DisctrictMember) {
//             return DisctrictMember['_id'] === titheRecord['member_id']
//         })
//     });
// }


/**
 * get members without Disctrict PRIEST COMMUNITY GROUP
 * @returns {object[]} list of members
 */
export function getAllMembersWithoutDisctrict() {
    return ChurchDataHandle.churchMembers.filter(function (member) {
        return member['district_id'] === PRIESTS_COMMUNITY_NAME;
    }) || [];
}


export function obtainObjectValueBykey(object, key) {
    if (object && (typeof object === 'object') && key) {
        const keys = Object.keys(object);
        return object['key'];
    }
}