import { DBDetails } from "../db_utils.js/db_church_details.js";
import { MongoDBContract } from "../db_utils.js/mongodatabase_contract.js";

export async function churchExists(church_code, password) {
    let result = await MongoDBContract
        .findOneByFilterFromCollection(
            DBDetails.adminDB,
            DBDetails.registeredChurchesCollection,
            {
                'church_code': church_code,
                'church_password': password
            }
        );

    return result !== null && result._id !== null && result._id.id !== null;
}