import { LocalStorageValues } from "./storage_details.js";

/**
 * Simplified localstorage access for church details
 */
export class LocalStorageContract {
    constructor() { }

    static storeDetails(jsonableDetails) {
        if (jsonableDetails) {
            localStorage.setItem(LocalStorageValues.churchDetailsKey, JSON.stringify(jsonableDetails));
        }
    }

    static allDetails() { return JSON.parse(localStorage.getItem(LocalStorageValues.churchDetailsKey)); }
    static completeChurchName() {
        let churchName = '';
        churchName = LocalStorageContract.allDetails()['church_name'];
        return `${churchName}`.toLowerCase().match('church') ? churchName : churchName + ' church'
    }

    static churchEmail() { return LocalStorageContract.allDetails()['church_email']; }
    static churchPassword() { return LocalStorageContract.allDetails()['church_password']; }
    static churchId() { return LocalStorageContract.allDetails()['church_code']; }

    static churchNotLoggedIn() { return LocalStorageContract.allDetails() === null; }
}