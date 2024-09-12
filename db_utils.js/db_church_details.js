export class DBDetails {
    constructor() { }

    /**
     * admin
     */
    static adminDB = 'pdm'
    static adminCollection = 'pdm_admin';
    static registeredChurchesCollection = 'registered_churches';

    /**
     * Users/Churches
     */
    static churchDetailsCollection = 'details';
    static membersCollection = 'members';
    static churchStaffCollection = 'church_staff';
    static smallChritianCommunitiesCollection = 'small_christian_communties';
    static churchGroupsCollection = 'groups';
    static titheCollection = 'tithe';
    static offeringCollection = 'offering';
    static missionsCollection = 'missions';
    static projectsCollection = 'projects';
    static eventsCollection = 'church_events';
    static churchDonationsCollection = 'donations';
}