import { DBDetails } from "../../../db_utils.js/db_church_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { churchExists } from "../../../server_app/callback_utils.js";

export async function getSmallChristianCommunities(req, resp) {
    const { church_code, church_password } = req.body;
    if (!church_code || !church_password) {
        return resp.json({ 'response': 'empty details' });
    }

    if (await churchExists(church_code, church_password)) {
        let smallChristianCommunities = await MongoDBContract
            .fetchFromCollection(
                church_code,
                DBDetails.smallChritianCommunitiesCollection,
                {}
            );
        return resp.json({ 'response': smallChristianCommunities || [] });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}