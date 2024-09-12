import { DBDetails } from "../../../db_utils.js/db_church_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { Logger } from "../../../debug_tools/Log.js";

export async function RegisterChurch(req, resp) {
    const {
        admin_code,
        admin_password,
        church_name,
        church_code,
        church_email,
        church_password
    } = req.body;

    Logger.log(req.body);

    let db = DBDetails.adminDB, collection = DBDetails.registeredChurchesCollection;
    if ((await MongoDBContract.PDM_ADMIN_EXISTS(admin_code, admin_password))) {
        let existingByCode = await MongoDBContract.findOneByFilterFromCollection(
            db,
            collection, {
            'church_code': church_code
        });

        if (existingByCode && existingByCode._id) {
            return resp.json({
                'response': 'a church with the given code alredy exists'
            });
        }

        let saved = await MongoDBContract.insertIntoCollection({
            church_name: church_name,
            church_code: church_code,
            church_email: church_email,
            church_password: church_password
        },
            DBDetails.adminDB,
            DBDetails.registeredChurchesCollection
        );

        if (saved) { return resp.json({ 'response': 'success' }); }

        return resp.json({ 'response': 'something went wrong' });
    } else {
        return resp.json({ 'response': 'unauthorised access' });
    }
}