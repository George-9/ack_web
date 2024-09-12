import { DBDetails } from "../../../db_utils.js/db_church_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { Logger } from "../../../debug_tools/Log.js";
import { churchExists } from "../../../server_app/callback_utils.js";

export async function addDisctrict(req, resp) {
    const { church_code, church_password, district } = req.body;
    if (!church_code || !church_password || !district) {
        return resp.json({ 'response': 'empty mission' });
    }

    if (await churchExists(church_code, church_password)) {

        let existingWithSameName = await MongoDBContract
            .findOneByFilterFromCollection(
                church_code,
                DBDetails.smallChritianCommunitiesCollection
                , {
                    'name': district['name'],
                    'mission_id': district['mission_id']
                });

        if (existingWithSameName && existingWithSameName._id && existingWithSameName._id.id) {
            return resp.json({
                'response': 'an Disctrict with the same name under the same mission aready exists'
            });
        }

        let saveResult = await MongoDBContract
            .insertIntoCollection(
                district,
                church_code,
                DBDetails.smallChritianCommunitiesCollection
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