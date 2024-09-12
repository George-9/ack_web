import { MongoClient } from "mongodb";
import { DBDetails } from "./db_church_details.js";

export class MongoDBContract {

    static connectedClient() { return new MongoClient('mongodb://127.0.0.1:27017') }
    static adminDB() { return MongoDBContract.connectedClient().db('admin') }
    static dbInstance(dbName) { return MongoDBContract.connectedClient().db(dbName) }

    /**
     * checks if a database exists
     * @param {string} dbName 
     * @returns true if the db by name exists
     */
    static async dbExists(dbName) {
        return (await MongoDBContract.adminDB().admin().listDatabases())
            .databases
            .includes(dbName)
    }

    static collectionInstance(dbName, collectionName) {
        return MongoDBContract
            .dbInstance(dbName)
            .collection(collectionName)
    }

    static async fetchFromCollection(dbName, collectionName, { filter = {} }) {
        return await MongoDBContract
            .collectionInstance(dbName, collectionName)
            .find(filter || {})
            .toArray();
    }

    static async deletedOneByFilterFromCollection(dbName, collectionName, filter) {
        if (!filter) {
            return false;
        }

        let result = await MongoDBContract
            .collectionInstance(dbName, collectionName)
            .deleteOne(filter);

        return result.deletedCount > 0;
    }

    static async deleteManyByFilterFromCollection(dbName, collectionName, filter) {
        if (!filter) {
            return false;
        }

        let result = await MongoDBContract
            .collectionInstance(dbName, collectionName)
            .deleteMany(filter);

        return result.deletedCount;
    }

    static async findOneByFilterFromCollection(dbName, collectionName, filter) {
        return await MongoDBContract
            .collectionInstance(dbName, collectionName)
            .findOne(filter)
    }

    static async findManyByFilterFromCollection(dbName, collectionName, filter) {
        return await MongoDBContract
            .collectionInstance(dbName, collectionName)
            .find(filter)
            .toArray();
    }

    static async insertIntoCollection(object, dbName, collectionName) {
        let result = await MongoDBContract
            .collectionInstance(dbName, collectionName)
            .insertOne(object)

        return (result !== null && result.insertedId !== null && result.insertedId.id !== null);
    }

    static async insertManyIntoCollection(objects = [], dbName, collectionName) {
        let result = await MongoDBContract
            .collectionInstance(dbName, collectionName)
            .insertMany(objects)

        return result.insertedCount
    }

    static async updateOneFromCollection(filter, new_values = {}) {
        let result = await MongoDBContract
            .collectionInstance(dbName, collectionName)
            .updateOne(filter, { '$set': { ...new_values } });

        return (result.modifiedCount + result.upsertedCount) > 0;
    }

    static async updateFromCollection(filter, new_values = {}) {
        let result = await MongoDBContract
            .collectionInstance(dbName, collectionName)
            .updateMany(filter, { '$set': { ...new_values } });

        return (result.modifiedCount + result.upsertedCount) > 0;
    }

    /**
     * ADMIN ACTIONS
     * 
     * @todo move to separate file
     */
    static async PDM_ADMIN_EXISTS(adminCode, adminPassword) {
        if (!adminCode || !adminPassword) {
            return false;
        }

        let found = await MongoDBContract
            .collectionInstance(
                DBDetails.adminDB,
                DBDetails.adminCollection).findOne({
                    $expr: {
                        $and: [
                            { $eq: [{ $toString: '$admin_code' }, adminCode], },
                            { $eq: [{ $toString: '$password' }, adminPassword] }
                        ]
                    }
                });

        return (found && found._id && found._id.id);
    }
}