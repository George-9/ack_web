import { Post } from "../net_tools.js"

/**
 * all church events
 */
export async function churchEvents() {
    let churchEvents = await Post('/church/events', null, { 'requiresChurchDetails': true });
    return churchEvents['response'];
}

/**
 * fetches the whole list of church members
 * @returns { object[] }
 */
export async function getChurchMembers() {
    return (await Post(
        '/church/load/all/members', {},
        {
            'requiresChurchDetails': true
        }))['response']
}

/**
 * fetches the whole list of church staff
 * @returns { object[] }
 */
export async function getChurchStaff() {
    return (await Post(
        '/church/load/all/staff', {},
        {
            'requiresChurchDetails': true
        }))['response']
}

/**
 * fetches the whole list of church mission
 * @returns { object[] }
 */
export async function getChurchMissions() {
    return (await Post(
        '/church/load/all/missions', {},
        {
            'requiresChurchDetails': true
        }))['response']
}

/**
 * fetches the whole list of church Disctricts
 * @returns { object[] }
 */
export async function getChurchDisctricts() {
    return (await Post(
        '/church/load/all/districts', {},
        {
            'requiresChurchDetails': true
        }))['response']
}


/**
 * fetches the whole list of church offering records
 * @returns { object[] }
 */
export async function getChurchOfferingsRecords() {
    return (await Post(
        '/church/load/all/offering/records', {},
        {
            'requiresChurchDetails': true
        }))['response']
}

/**
 * fetches the whole list of church offering records
 * @returns { object[] }
 */
export async function getChurchGroupsRecords() {
    return (await Post(
        '/church/load/all/groups/records', {},
        {
            'requiresChurchDetails': true
        }))['response']
}



/**
 * fetches the whole list of church tithe records
 * @returns { object[] }
 */
export async function getChurchTitheRecords() {
    return (await Post(
        '/church/load/all/tithe/records',
        {},
        {
            'requiresChurchDetails': true
        }))['response']
}

/**
 * fetches the whole list of church projects records
 * @returns { object[] }
 */
export async function getChurchProjectsRecords() {
    return (await Post(
        '/church/load/all/projects/records',
        {},
        {
            'requiresChurchDetails': true
        }))['response']
}

/**
 * fetches the whole list of church donations records
 * @returns { object[] }
 */
export async function getChurchDonationsRecords() {
    return (await Post(
        '/church/load/all/donations/records',
        {},
        {
            'requiresChurchDetails': true
        }))['response']
}