import { DBDetails } from "../../../db_utils.js/db_church_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { churchExists } from "../../../server_app/callback_utils.js";

export async function addMission(req, resp) {
    const { church_code, church_password, mission } = req.body;
    console.log(req.body);

    if (!church_code || !church_password || !mission) {
        return resp.json({ 'response': 'empty mission' });
    }

    if (await churchExists(church_code, church_password)) {

        const regex = new RegExp(`^${mission['name']}$`, 'i')
        let existingWithSameName = await MongoDBContract
            .findOneByFilterFromCollection(
                church_code,
                DBDetails.missionsCollection,
                { 'name': { $regex: regex } },
            );

        if (existingWithSameName && existingWithSameName._id && existingWithSameName._id.id) {
            return resp.json({ 'response': 'cannot create two missions with the same name' });
        }

        let saveResult = await MongoDBContract
            .insertIntoCollection(
                mission,
                church_code,
                DBDetails.missionsCollection
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