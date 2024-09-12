import { DBDetails } from "../../../db_utils.js/db_church_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { churchExists } from "../../../server_app/callback_utils.js";

export async function addGroups(req, resp) {
    const { church_code, church_password, group } = req.body;
    if (!church_code || !church_password || !group) {
        return resp.json({ 'response': 'empty group details' });
    }

    if (await churchExists(church_code, church_password)) {
        let existingWithSameName = await MongoDBContract
            .findOneByFilterFromCollection(
                church_code,
                DBDetails.churchGroupsCollection,
                { 'name': group['name'] }
            );

        if (existingWithSameName && existingWithSameName._id && existingWithSameName._id.id) {
            return resp.json({
                'response': 'a group with the same name aready exists'
            });
        }

        let saveResult = await MongoDBContract
            .insertIntoCollection(
                group,
                church_code,
                DBDetails.churchGroupsCollection
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

export async function getChurchGroups(req, resp) {
    const { church_code, church_password } = req.body;
    if (!church_code || !church_password) {
        return resp.json({ 'response': 'empty details' });
    }

    if (await churchExists(church_code, church_password)) {
        let groups = await MongoDBContract
            .fetchFromCollection(
                church_code,
                DBDetails.churchGroupsCollection,
                {}
            );
        return resp.json({ 'response': groups || [] });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}