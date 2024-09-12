import { ObjectId } from "mongodb";
import { DBDetails } from "../../../db_utils.js/db_church_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { Logger } from "../../../debug_tools/Log.js";
import { churchExists } from "../../../server_app/callback_utils.js";

export async function addProjectRecord(req, resp) {
    const { church_code, church_password, project } = req.body;
    if (!church_code || !church_password || !project) {
        return resp.json({ 'response': 'bad projects record details for church' });
    }

    if (await churchExists(church_code, church_password)) {
        let saveResult = await MongoDBContract
            .insertIntoCollection(
                { ...project, contributions: [] },
                church_code,
                DBDetails.projectsCollection
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

export async function addContributionToProjectRecord(req, resp) {
    const { church_code, church_password, contribution } = req.body;
    console.log(req.body);

    if (!church_code || !church_password || !contribution) {
        return resp.json({ 'response': 'bad request' });
    }

    const id = contribution['project_id'];

    // delete unnecessary project id
    delete contribution['project_id'];

    if (await churchExists(church_code, church_password)) {

        Logger.log(await MongoDBContract
            .connectedClient()
            .db(church_code)
            .collection(DBDetails.projectsCollection)
            .find()
            .toArray()
        )

        let update = await MongoDBContract
            .connectedClient()
            .db(church_code)
            .collection(DBDetails.projectsCollection)
            // .updateOne({ '_id': new ObjectId(id) },
            //     {
            //         '$push': { 'contributions': contribution }
            //     },
            //     { 'upsert': true }
            // )
            .updateOne(
                { _id: new ObjectId(id) },
                [
                    {
                        $set: {
                            contributions: {
                                $map: {
                                    input: '$contributions',
                                    as: 'contribution',
                                    in: {
                                        $cond: [
                                            { $eq: ['$$contribution.contributor_id', ''] },
                                            {
                                                $mergeObjects: ['$$contribution',
                                                    { amount: { $add: ['$$contribution.amount', contribution.contributor_id] } }]
                                            },
                                            '$$contribution'
                                        ]
                                    }
                                }
                            }
                        }
                    },
                    {
                        $set: {
                            contributions: {
                                $cond: [
                                    { $in: ['', '$contributions.contributor_id'] },
                                    '$contributions',
                                    {
                                        $concatArrays: ['$contributions',
                                            [
                                                {
                                                    contributor_id: contribution.contributor_id,
                                                    amount: contribution.amount
                                                }
                                            ]
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ],
                { upsert: true }
            );









        return resp.json({
            'response': ((update.modifiedCount + update.upsertedCount) > 0)
                ? 'success'
                : 'updates not saved'
        });
    } else {
        return resp.json({ 'response': ['unauthorised request'] });
    }
}

export async function loadChurchProjectRecords(req, resp) {
    const { church_code, church_password } = req.body;

    console.log(req.body);

    if (!church_code || !church_password) {
        return resp.json({ 'response': 'bad request' });
    }

    if (await churchExists(church_code, church_password)) {
        let projectsRecords = await MongoDBContract
            .findManyByFilterFromCollection(
                church_code,
                DBDetails.projectsCollection,
                {}
            );
        return resp.json({ 'response': projectsRecords || [] });
    } else {
        return resp.json({ 'response': ['unauthorised request'] });
    }
}