'use strict';

const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const expect = require('chai').expect;
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// DATABASE CONNECTION
mongoose.connect(process.env['MongoDB'], {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// SCHEMAS
const Schema = mongoose.Schema;

const issueSchema = new Schema({
	assigned_to: String,
	status_text: String,
	open: Boolean,
	_id: String,
	issue_title: {
		type: String,
		required: [true, '"Title" field is required.'],
	},
	issue_text: {
		type: String,
		required: [true, '"Text" field is required.'],
	},
	created_by: {
		type: String,
		required: [true, '"Created By" field is required.'],
	},
	created_on: String,
	updated_on: String,
});

const projectSchema = new Schema({
	name: String,
	issues: [issueSchema],
});

//MODEL CONSTRUCTORS
// const issueConstructor = mongoose.model('issue', issueSchema);  //VERIFYING THIS CAN BE DELETED
const projectConstructor = mongoose.model('project', projectSchema);

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({ origin: '*' })); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Sample front-end
app.route('/:project/').get(function (req, res) {
	res.sendFile(process.cwd() + '/views/issue.html');
});

//ADDED CUSTOM ROUTES
//SUBMIT ISSUE
app.post('/api/issues/:project', urlencodedParser, async (req, res) => {
	console.log('');
	console.log('');
	console.log('Post Route');
	console.log('Req Params: ', req.params);
	console.log('Req Body: ', req.body);
	console.log('Req Query: ', req.query);

	const currentDate = new Date().toISOString();
	let projectExists;
	let targetProject;
	let targetProjectId;

	async function addIssue() {
		const targetProject = await projectConstructor
			.find({ name: req.params.project })
			.exec();
		if (targetProject.length !== 0) {
			projectExists = true;
			targetProjectId = targetProject[0]._id;
		} else {
			projectExists = false;
		}

		if (projectExists) {
			try {
				let existingProject = await projectConstructor
					.findById(targetProjectId, 'name issues')
					.exec();
				let tempIssuesArray = [...existingProject.issues];

				const newIssue = {
					assigned_to: '',
					status_text: '',
					open: true,
					_id: uuidv4(),
					issue_title: req.body.issue_title,
					issue_text: req.body.issue_text,
					created_by: req.body.created_by,
					created_on: currentDate,
					updated_on: currentDate,
				};

				if (req.body.assigned_to) {
					newIssue.assigned_to = req.body.assigned_to;
				}
				if (req.body.status_text) {
					newIssue.status_text = req.body.status_text;
				}

				tempIssuesArray.push(newIssue);
				existingProject.issues = tempIssuesArray;
				existingProject.save();
				res.send(newIssue);
			} catch (err) {
				console.log(err);
			}
		} else if (!projectExists) {
			const newProject = new projectConstructor({
				name: req.params.project,
				issues: [],
			});

			const newIssue = {
				assigned_to: '',
				status_text: '',
				open: true,
				_id: uuidv4(),
				issue_title: req.body.issue_title,
				issue_text: req.body.issue_text,
				created_by: req.body.created_by,
				created_on: currentDate,
				updated_on: currentDate,
			};

			if (req.body.assigned_to) {
				newIssue.assigned_to = req.body.assigned_to;
			}
			if (req.body.status_text) {
				newIssue.status_text = req.body.status_text;
			}

			newProject.issues.push(newIssue);
			newProject.save();
			res.send(newIssue);
		}
	}

	if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
		// console.log('Post Route - Required Fields Missing');
		res.send({ error: 'required field(s) missing' });
	} else {
		addIssue();
	}
});

//GET ISSUES
app.get('/api/issues/:project', urlencodedParser, (req, res) => {
	console.log('');
	console.log('');
	console.log('Get Route');
	console.log('Req Params: ', req.params);
	console.log('Req Body: ', req.body);
	console.log('Req Query: ', req.query);

	let targetProject;
	let reqQueryKeys = Object.keys(req.query);
	let reqQueryValues = Object.values(req.query);
	// console.log('reqQueryKeys', reqQueryKeys);
	// console.log('reqQueryValues', reqQueryValues);

	async function getIssues() {
		let targetProject = await projectConstructor
			.find({ name: req.params.project })
			.exec();
		let filteredIssues = [...targetProject[0].issues];

		for (let i = 0; i < reqQueryKeys.length; i++) {
			filteredIssues = filteredIssues.filter(
				(issue) => issue[reqQueryKeys[i]] === reqQueryValues[i]
			);
		}
		// console.log('filteredIssues', filteredIssues);
		// res.send(targetProject[0].issues);
		res.send(filteredIssues);
	}
	getIssues();
});

//UPDATE ISSUE
app.put('/api/issues/:project', urlencodedParser, async (req, res) => {
	console.log('');
	console.log('');
	console.log('Put Route');
	console.log('Req Params: ', req.params);
	console.log('Req Body: ', req.body);
	console.log('Req Query: ', req.query);
	const currentDate = new Date().toISOString();
	const targetIssueId = req.body._id;

	// let targetIssue;
	// let targetIssueIndex;
	// let targetProject;
	let targetProjectId;
	let projectExists;

	async function updateTargetIssue() {
		var targetProject = await projectConstructor
			.find({ name: req.params.project })
			.exec();
		if (targetProject.length !== 0) {
			projectExists = true;
			targetProjectId = targetProject[0]._id;
			// console.log('');
			// console.log('');
			// console.log('targetProject found:', targetProject);
			// console.log('targetProjectId', targetProjectId);
		} else {
			projectExists = false;
			// res.send('Project does not exist.');
			console.log('PUT Location #1');
			console.log("error: 'could not update', '_id':", req.body._id);
			res.send({ error: 'could not update', _id: req.body._id });
		}

		if (projectExists) {
			try {
				async function findAndUpdate() {
					//WHERE TO AWAIT???
					let tempIssuesArray = [...targetProject[0].issues]; //MAY NEED TO EVALUATE THIS, IN CASE THERE IS MORE THAN ONE PROJECT
					let tempIssuesIDArray = [];
					console.log('Starting forEach');
					tempIssuesArray.forEach((issue) => tempIssuesIDArray.push(issue._id));
					console.log('Ending forEach');
					// console.log('');
					// console.log('');
					console.log('Original tempIssuesArray', tempIssuesArray);
					console.log('tempIssuesIDArray', tempIssuesIDArray);
					// let newFoundID = tempIssuesIDArray.find(req.body._id);
					// console.log('just curious...');
					let newFoundID = tempIssuesIDArray.includes(req.body._id);
					console.log('newFoundID', newFoundID);
					console.log('Starting indexOf');
					let newFoundIndex = tempIssuesIDArray.indexOf(req.body._id);
					console.log('Ending indexOf');
					console.log('newFoundIndex', newFoundIndex);
					// console.log('req.body._id', req.body._id);
					// console.log('tempIssuesIDArray[newFoundIndex]', tempIssuesIDArray[newFoundIndex]);

					if (newFoundIndex === -1) {
						console.log('Trigger Location 1');
						console.log("error: 'could not update', '_id':", req.body._id);
						console.log('req.body._id', req.body._id);
						console.log(
							'tempIssuesIDArray[newFoundIndex]',
							tempIssuesIDArray[newFoundIndex]
						);
						res.send({ error: 'could not update', _id: req.body._id });
					} else {
						if (req.body.issue_title) {
							tempIssuesArray[newFoundIndex].issue_title = req.body.issue_title;
						}
						if (req.body.issue_text) {
							tempIssuesArray[newFoundIndex].issue_text = req.body.issue_text;
						}
						if (req.body.created_by) {
							tempIssuesArray[newFoundIndex].created_by = req.body.created_by;
						}
						if (req.body.assigned_to) {
							tempIssuesArray[newFoundIndex].assigned_to = req.body.assigned_to;
						}
						if (req.body.status_text) {
							tempIssuesArray[newFoundIndex].status_text = req.body.status_text;
						}
						if (req.body.open) {
							tempIssuesArray[newFoundIndex].open = req.body.open === 'true';
						}
						tempIssuesArray[newFoundIndex].updated_on = currentDate;

						targetProject[0].issues[newFoundIndex] =
							tempIssuesArray[newFoundIndex];
						console.log('Saving targetProject');
						targetProject[0].save();

						console.log("'result: 'successfully updated', _id: ", req.body._id);
						res.send({ result: 'successfully updated', _id: req.body._id });
					}
				}
				findAndUpdate();

				/*
				try {
					// TEMPORARILY HIDING FOR TESTING
					let idFound = false;
					for (let i = 0; i < tempIssuesArray.length; i++) {
						if (tempIssuesArray[i]._id === targetIssueId) {
							// console.log('');
							// console.log('');
							// console.log('Original Issue:', tempIssuesArray[i]);

							if (req.body.issue_title) {
								tempIssuesArray[i].issue_title = req.body.issue_title;
							}
							if (req.body.issue_text) {
								tempIssuesArray[i].issue_text = req.body.issue_text;
							}
							if (req.body.created_by) {
								tempIssuesArray[i].created_by = req.body.created_by;
							}
							if (req.body.assigned_to) {
								tempIssuesArray[i].assigned_to = req.body.assigned_to;
							}
							if (req.body.status_text) {
								tempIssuesArray[i].status_text = req.body.status_text;
							}
							if (req.body.open) {
								tempIssuesArray[i].open = req.body.open === 'true';
							}
							tempIssuesArray[i].updated_on = currentDate;

							// console.log('');
							// console.log('');
							// console.log('Updated Issue', tempIssuesArray[i]);
							// console.log('');
							// console.log('');
							// console.log('Updated tempIssuesArray', tempIssuesArray);

							// targetProject[0].issues = [...tempIssuesArray];
							targetProject[0].issues[i] = tempIssuesArray[i];
							targetProject[0].save();
							// console.log('');
							// console.log('');

							// console.log('targetIssueId',targetIssueId);
							console.log(
								"'result: 'successfully updated', _id: ",
								targetIssueId
							);

							// TEMPORARILY HIDING FOR TESTING
							idFound = true;

							// res.send({ result: 'successfully updated', _id: targetIssueId });  //WORKS, BUT TEMPORARILY REMOVING FOR TESTING!!!!!!
							res.send({ result: 'successfully updated', _id: req.body._id });
							// res.send({result: 'successfully updated', _id: targetIssueId.toString()})
						}
					}
					// TEMPORARILY HIDING FOR TESTING
					if (!idFound) {
						console.log('Trigger Location 1');
						console.log("error: 'could not update', '_id':", req.body._id);
						res.send({ error: 'could not update', _id: req.body._id });
					}
				} catch (err) {
					console.log('Trigger Location 2');
					console.log("error: 'could not update', '_id':", req.body._id);
					res.send({ error: 'could not update', _id: req.body._id });
				}
*/
			} catch (err) {
				// console.log(err);
				console.log('Trigger Location 3');
				console.log("error: 'could not update', '_id':", req.body._id);
				res.send({ error: 'could not update', _id: req.body._id });
			}
		}
	}
	if (!req.body._id) {
		console.log('Missing ID');
		res.send({ error: 'missing _id' });
	} else if (
		!req.body.issue_title &&
		!req.body.issue_text &&
		!req.body.created_by &&
		!req.body.assigned_to &&
		!req.body.status_text
	) {
		console.log('No Update Fields Sent, _id:', req.body._id);
		res.send({ error: 'no update field(s) sent', _id: req.body._id });
	} else {
		updateTargetIssue();
	}
});

//DELETE ISSUE
app.delete('/api/issues/:project', urlencodedParser, async (req, res) => {
	console.log('');
	console.log('');
	console.log('Delete Route');
	console.log('Req Params: ', req.params);
	console.log('Req Body: ', req.body);
	// console.log('Req Query: ', req.query);
	// const currentDate = new Date().toISOString();

	// async function deleteIssue () {

	if (!req.body._id) {
		// console.log('');
		// console.log('');
		// console.log('Delete Route - Missing ID');
		console.log("{error: 'missing _id'}");
		res.send({ error: 'missing _id' });
	} else {
		try {
			/*
          let documentsDeleted = await projectConstructor.deleteOne({issues: [{_id: req.body._id}]});
          // await projectConstructor.deleteOne({_id: req.body._id}, (err, result) => {
          //   if(err){
          //     console.log('Upper #1 Err:', err);
          //     res.send(err);
          //   } else {
          //     console.log('Upper #2 Result', result);
          //     res.send(result);
          //   }
          // }); 
          // console.log("result: 'successfully deleted', '_id':", req.body._id);
          // console.log('');
          // console.log(''); 
          // console.log('req.body._id', req.body._id);
          console.log('documentsDeleted.deletedCount', documentsDeleted.deletedCount);
          if(documentsDeleted.deletedCount > 0){
            console.log('Location 1');
            console.log("result: 'successfully deleted', _id:", req.body._id);
            res.send({result: 'successfully deleted', _id: req.body._id});
          } else {
            console.log('Location 2');
            console.log("error: 'could not delete', _id:", req.body._id);
            res.send({ error: 'could not delete', _id: req.body._id});
          }
          */
			let idFound = await projectConstructor
				.find({ 'issues._id': req.body._id })
				.exec();
			// console.log('idFound', idFound);
			if (idFound.length > 0) {
				// -------------------------
				// PREVIOUSLY PASSING SECTION, BUT NOT ACTUALLY DELETING

				// await projectConstructor.updateOne( //DOES NOT ACTUALLY DELETE ANYTHING
				// await projectConstructor.update( //WORKS, BUT DEPRECATED
				await projectConstructor.updateMany(
					//SEEMS TO WORK
					{},
					{ $pull: { issues: { _id: req.body._id } } }
				);
				console.log("{result: 'successfully deleted', _id:", req.body._id);
				res.send({ result: 'successfully deleted', _id: req.body._id });

				// -------------------------

				// projectConstructor.findOneAndDelete({ issues: {_id: req.body._id}}, function (err, docs) {
				// projectConstructor.issues.findOneAndDelete({_id: req.body._id}, function (err, docs) {
				//   if(err) {
				//       console.log("error: 'could not delete', '_id':", req.body._id);
				//       res.send({error: 'could not delete', _id: req.body._id});
				//       console.log(err)
				//   } else {
				//     console.log("Deleted User : ", docs);
				//     console.log("result: 'successfully deleted', _id:", req.body._id);
				//     res.send({result: 'successfully deleted', _id: req.body._id});
				//   }
				// });
			} else {
				console.log('Location 2');
				console.log("error: 'could not delete', '_id':", req.body._id);
				res.send({ error: 'could not delete', _id: req.body._id });
			}

			// await projectConstructor.updateMany(
			/*
          await projectConstructor.updateOne(
            {},
            {$pull: { issues: {_id: req.body._id}}}
          )
          res.send({result: 'successfully deleted', _id: req.body._id});
          */
		} catch (err) {
			// console.log('');
			// console.log('');
			// console.log('req.body._id', req.body._id);
			// console.log('err', err);
			console.log('Location 3');
			console.log("error: 'could not delete', '_id':", req.body._id);
			res.send({ error: 'could not delete', _id: req.body._id });
		}
	}
	// }
	// deleteIssue();
});

//Index page (static HTML)
app.route('/').get(function (req, res) {
	res.sendFile(process.cwd() + '/views/index.html');
});

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API
apiRoutes(app);

//404 Not Found Middleware
app.use(function (req, res, next) {
	res.status(404).type('text').send('Not Found');
});

//Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function () {
	console.log('Your app is listening on port ' + listener.address().port);
	if (process.env.NODE_ENV === 'test') {
		console.log('Running Tests...');
		setTimeout(function () {
			try {
				runner.run();
			} catch (e) {
				console.log('Tests are not valid:');
				console.error(e);
			}
		}, 3500);
	}
});

module.exports = app; //for testing
