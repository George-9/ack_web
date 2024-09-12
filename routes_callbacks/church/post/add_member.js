import { DBDetails } from "../../../db_utils.js/db_church_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { Logger } from "../../../debug_tools/Log.js";
import { churchExists } from "../../../server_app/callback_utils.js";

export async function addMember(req, resp) {
    const { church_code, church_password, member } = req.body;
    if (!church_code || !church_password || !member) {
        return resp.json({ 'response': 'empty details' });
    }

    if (await churchExists(church_code, church_password)) {
        let existing = await MongoDBContract
            .collectionInstance(
                church_code,
                DBDetails.membersCollection
            )
            .aggregate([{ $sort: { 'member_number': -1 } }])
            .limit(1)
            .toArray();

        Logger.log(existing);

        let memberNumber = 1;
        if (existing && existing.length > 0) {
            memberNumber = existing[0]['member_number'] + 1;
        }

        let saveResult = await MongoDBContract
            .insertIntoCollection(
                { ...member, "member_number": memberNumber },
                church_code,
                DBDetails.membersCollection
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