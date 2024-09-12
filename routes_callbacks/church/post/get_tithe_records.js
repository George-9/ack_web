import { DBDetails } from "../../../db_utils.js/db_church_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { churchExists } from "../../../server_app/callback_utils.js";

export async function loadAllTitheRecords(req, resp) {
    const { church_code, church_password } = req.body;
    if (!church_code || !church_password) {
        return resp.json({ 'response': 'unknown request' });
    }

    if (await churchExists(church_code, church_password)) {
        let offeringRecords = await MongoDBContract.findManyByFilterFromCollection(
            church_code,
            DBDetails.titheCollection,
            {}
        );
        return resp.json({ 'response': offeringRecords || [] });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}