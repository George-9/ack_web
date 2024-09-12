import { ObjectId } from "mongodb";
import { DBDetails } from "../../../db_utils.js/db_church_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { churchExists } from "../../../server_app/callback_utils.js";

export async function updateMemberDetails(req, resp) {
    const { church_code, church_password, member } = req.body;
    if (!church_code || !church_password || !member) {
        return resp.json({ 'response': 'empty details' });
    }

    let id = new ObjectId(member['_id']);

    delete member['_id'];

    if (await churchExists(church_code, church_password)) {
        let updateResult = await MongoDBContract
            .collectionInstance(
                church_code,
                DBDetails.membersCollection
            ).updateOne({ '_id': id },
                { '$set': member });

        return resp.json({
            'response': ((updateResult.modifiedCount + updateResult.upsertedCount) > 0)
                ? 'success'
                : 'could not save updates'
        });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}