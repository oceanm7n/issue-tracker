/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

var Project = require('../models/Project');
const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

    app
        .route('/api/issues/:project')
        .get(function (req, res) {
            var project = req.params.project;

            // Creating filter object
            let filter = {};
            filter.issue_title = req.query.issue_title;
            filter.issue_text = req.query.issue_text;
            filter.created_by = req.query.created_by;
            filter.assigned_to = req.query.assigned_to;
            filter.status_text = req.query.status_text;
            filter.created_on = req.query.created_on;
            filter.updated_on = req.query.updated_on;
            filter.open = req.query.open;

            // Clearing filter object from 'undefined' values
            for (let prop in filter) {
                if (filter[prop] === undefined) {
                    delete filter[prop];
                }
            }

            Project
                .findOne({name: project})
                .then(doc => {
                    // If project was found
                    if (doc !== null) {
                        // Creating an empty array of issues
                        let issuesToSend = [];
                        // Pushing to issuesToSend issues that pass the filter criteria
                        doc
                            .issues
                            .forEach(issue => {
                                let push = true;
                                for (let prop in filter) {
                                    if (issue[prop] !== filter[prop]) 
                                        push = false;
                                    }
                                if (push) 
                                    issuesToSend.push(issue);
                                }
                            );
                        res.json(issuesToSend// Project not found
                        );
                    } else {
                        res.send('No such project')
                    }
                })
                .catch(err => console.log(err))

        })
        .post(function (req, res) {
            var project = req.params.project;
            const {issue_title, issue_text, created_by, assigned_to, status_text} = req.body;
            // ES6 Syntax for objects
            const newIssue = {
                issue_title,
                issue_text,
                created_by,
                assigned_to,
                status_text
            };
            Project
                .findOne({name: project})
                .then(doc => {
                    if (doc === null) {
                        let newProject = new Project({name: project, issues: []})
                        newProject 
                            .save()
                            .then((product) => {
                                product
                                    .issues
                                    .push(newIssue);
                                product
                                    .save()
                                    .then(() => {
                                        console.log('New project with an issue saved')
                                        res.json(product.issues[0]);
                                    })
                                    .catch(err => console.log(err))
                            })
                            .catch(err => console.log(err));
                    } else {
                        doc
                            .issues
                            .push(newIssue)
                        doc
                            .save()
                            .then(() => {
                                console.log('New issue pushed')
                                res.json(doc.issues.slice(-1)[0]);
                            })
                            .catch(err => console.log(err))
                    }
                })
                .catch(err => console.log(err));
        })
        .put(function (req, res) {
            var project = req.params.project;
            const {
                _id,
                issue_title,
                issue_text,
                created_by,
                assigned_to,
                status_text
            } = req.body;

            Project
                .findOne({name: project})
                .then(doc => {
                    let issueToUpdate = doc
                        .issues
                        .id(_id);

                    // Document found
                    if (issueToUpdate !== null) {

                        // Creating an 'updates' object
                        const updates = req.body;
                        for (let propName in updates) {
                            if (updates[propName] == "" || propName == "_id") {
                                delete updates[propName];
                            }
                        }

                        // Setting 'updated on' property

                        updates.updated_on = Date.now();

                        // Update an issue with a freshly created object

                        issueToUpdate.set(updates);

                        // Save a document with an updated issue
                        doc
                            .save()
                            .then(() => {
                                res.send('successfully updated')
                            })
                            .catch(err => console.log(err)// Document not found
                            );
                    } else {
                        res.send('could not update ' + _id)
                    }
                })
                .catch(err => console.log(err));
        })
        .delete(function (req, res) {
            var project = req.params.project;
            let _id = req.body._id;
            Project
                .findOne({name: project})
                .then(doc => {

                    let issueToDelete = doc
                        .issues
                        .id(_id)
                    // Issue with _id exists
                    if (issueToDelete !== null) {
                        issueToDelete.remove();
                        doc
                            .save()
                            .then(() => res.send('deleted ' + _id))
                            .catch(err => {
                                console.log(err);
                                res.send('could not delete ' + _id)
                                // Issue not found
                            })
                    } else {
                        res.send('_id error');
                    }

                })
                .catch(err => console.log(err));
        });

};
