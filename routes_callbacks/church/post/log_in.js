import { DBDetails } from "../../../db_utils.js/db_church_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";

export async function churchLogInCallback(req, resp) {
    const { email, password } = req.body;

    console.log(req.body);

    if (!email || !password) {
        return resp.json({ 'response': 'invalid log in' });
    }

    let result1, result2;

    result1 = await MongoDBContract
        .findOneByFilterFromCollection(
            DBDetails.adminDB,
            DBDetails.registeredChurchesCollection,
            {
                'email': email,
                'church_password': password
            });

    if (!result1 || !result1._id) {
        result2 = await MongoDBContract
            .findOneByFilterFromCollection(
                DBDetails.adminDB,
                DBDetails.registeredChurchesCollection,
                {
                    'church_code': email,
                    'church_password': password
                });
    }

    if ((result1 !== null && result1._id) || (result2 && result2._id)) {
        return resp.json({ 'response': 'success' });
    }

    return resp.json({ 'response': 'account not found' });
}