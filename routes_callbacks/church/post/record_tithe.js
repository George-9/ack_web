import { DBDetails } from "../../../db_utils.js/db_church_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { churchExists } from "../../../server_app/callback_utils.js";

export async function addTitheRecord(req, resp) {
    const { church_code, church_password, tithe } = req.body;
    if (!church_code || !church_password || !tithe) {
        return resp.json({ 'response': 'wrong tithe details' });
    }

    if (await churchExists(church_code, church_password)) {
        let saveResult = await MongoDBContract
            .insertIntoCollection(
                tithe,
                church_code,
                DBDetails.titheCollection
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