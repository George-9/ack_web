import { DBDetails } from "../../../db_utils.js/db_church_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { churchExists } from "../../../server_app/callback_utils.js";

export async function addOfferingRecord(req, resp) {
    const { church_code, church_password, offering } = req.body;
    if (!church_code || !church_password || !offering) {
        return resp.json({ 'response': 'bad offering record details' });
    }

    if (await churchExists(church_code, church_password)) {
        let saveResult = await MongoDBContract
            .insertIntoCollection(
                offering,
                church_code,
                DBDetails.offeringCollection
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