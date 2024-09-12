import { ObjectId } from "mongodb";
import { DBDetails } from "../../../db_utils.js/db_church_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { Logger } from "../../../debug_tools/Log.js";
import { churchExists } from "../../../server_app/callback_utils.js";

export async function addChurchEvent(req, resp) {
    const { church_code, church_password, event } = req.body;
    console.log(req.body, event);

    if (!church_code || !church_password || !event) {
        return resp.json({ 'response': 'event not saved' });
    }

    if (await churchExists(church_code, church_password)) {
        let saved = await MongoDBContract.insertIntoCollection(
            event,
            church_code,
            DBDetails.eventsCollection
        );

        Logger.log(saved);

        return resp.json({
            'response': saved ? 'success' : 'something went wrong'
        });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}

export async function deleteChurchEvent(req, resp) {
    const { church_code, church_password: password, event_id } = req.body;
    console.log(req.body);

    if (!church_code || !password || !event_id) {
        return resp.json({ 'response': 'bad request' });
    }

    let deletion = await MongoDBContract.deletedOneByFilterFromCollection(
        church_code,
        DBDetails.eventsCollection,
        { '_id': new ObjectId(event_id) }
    );

    return resp.json({ 'response': deletion ? 'deleted' : 'something went wrong deleting event' });
}

export async function loadChurchEvents(req, resp) {
    const { church_code, church_password } = req.body;
    if (!church_code || !church_password) {
        return resp.json({ 'response': [] });
    }

    let allEvents = await MongoDBContract.fetchFromCollection(
        church_code,
        DBDetails.eventsCollection,
        {
            'filter': {}
        }
    );

    console.log(allEvents);

    return resp.json({ 'response': allEvents ? allEvents : [] });
}