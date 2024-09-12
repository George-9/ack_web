import { DBDetails } from "../../../db_utils.js/db_church_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { churchExists } from "../../../server_app/callback_utils.js";

export async function addDonationRecord(req, resp) {
    const { church_code, church_password, donation } = req.body;
    if (!church_code || !church_password || !donation) {
        return resp.json({ 'response': 'wrong donation details' });
    }

    if (await churchExists(church_code, church_password)) {
        let saveResult = await MongoDBContract
            .insertIntoCollection(
                donation,
                church_code,
                DBDetails.churchDonationsCollection
            );

        return resp.json({
            'response': saveResult
                ? 'success'
                : 'something went wrong'
        });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}


export async function loadAllDonationsRecords(req, resp) {
    const { church_code, church_password } = req.body;
    if (!church_code || !church_password) {
        return resp.json({ 'response': 'unknown request' });
    }

    if (await churchExists(church_code, church_password)) {
        let donationsRecords = await MongoDBContract.findManyByFilterFromCollection(
            church_code,
            DBDetails.churchDonationsCollection,
            {}
        );
        return resp.json({ 'response': donationsRecords || [] });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}