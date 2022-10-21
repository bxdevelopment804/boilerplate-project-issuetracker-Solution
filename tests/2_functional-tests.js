const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
// const chaiParam = require('chai-param');
// const param = chaiParam.param;

chai.use(chaiHttp);
// chai.use(chaiParam);

// Write the following tests in tests/2_functional-tests.js:

// Create an issue with every field: POST request to /api/issues/{project} - DONE
// Create an issue with only required fields: POST request to /api/issues/{project} - DONE
// Create an issue with missing required fields: POST request to /api/issues/{project} - DONE
// View issues on a project: GET request to /api/issues/{project} - DONE, BUT GOOD ENOUGH??
// View issues on a project with one filter: GET request to /api/issues/{project} - DONE
// View issues on a project with multiple filters: GET request to /api/issues/{project} - DONE
// Update one field on an issue: PUT request to /api/issues/{project} - DONE
// Update multiple fields on an issue: PUT request to /api/issues/{project} - DONE
// Update an issue with missing _id: PUT request to /api/issues/{project} - DONE
// Update an issue with no fields to update: PUT request to /api/issues/{project} - DONE
// Update an issue with an invalid _id: PUT request to /api/issues/{project} - DONE
// Delete an issue: DELETE request to /api/issues/{project} - DONE
// Delete an issue with an invalid _id: DELETE request to /api/issues/{project} - DONE
// Delete an issue with missing _id: DELETE request to /api/issues/{project} - DONE

suite('Functional Tests', function () {
	//-----------------HIDING
	// -----------------------------------

	test('Create an issue with every field: POST request to /api/issues/{project}', function (done) {
		// console.log('param', param);
		chai
			.request(server)
			.post('/api/issues/chaitesting')
			// .param({project: 'chaitesting'})
			// .param().should.not.be.empty
			// .body({
			.send({
				issue_title: 'chaiTitle',
				issue_text: 'chaiText',
				created_by: 'chaiCreator',
				assigned_to: 'chaiWorker',
				status_text: 'chaiStatus',
			})
			.end(function (err, res) {
				assert.equal(res.status, 200, 'Response status should be 200');
				assert.isNotEmpty(res.body.issue_title);
				assert.isNotEmpty(res.body.issue_text);
				assert.isNotEmpty(res.body.created_by);
				assert.isNotEmpty(res.body.assigned_to);
				assert.isNotEmpty(res.body.status_text);
				assert.equal(res.body.open, true);
				assert.isNotEmpty(res.body._id);
				assert.isNotEmpty(res.body.created_on);
				assert.isNotEmpty(res.body.updated_on);
				done();
			});
	});
	test('Create an issue with only required fields: POST request to /api/issues/{project}', function (done) {
		chai
			.request(server)
			.post('/api/issues/chaitesting')
			.send({
				issue_title: 'chaiTitle',
				issue_text: 'chaiText',
				created_by: 'chaiCreator',
			})
			.end(function (err, res) {
				assert.equal(res.status, 200, 'Response status should be 200');
				assert.isNotEmpty(res.body.issue_title);
				assert.isNotEmpty(res.body.issue_text);
				assert.isNotEmpty(res.body.created_by);
				assert.isEmpty(res.body.assigned_to);
				assert.isEmpty(res.body.status_text);
				assert.equal(res.body.open, true);
				assert.isNotEmpty(res.body._id);
				assert.isNotEmpty(res.body.created_on);
				assert.isNotEmpty(res.body.updated_on);
				done();
			});
	});
	test('Create an issue with missing required fields: POST request to /api/issues/{project}', function (done) {
		chai
			.request(server)
			.post('/api/issues/chaitesting')
			.send({
				issue_title: 'chaiTitle',
			})
			.end(function (err, res) {
				assert.equal(res.status, 200, 'Response status should be 200');
				assert.equal(res.body.error, 'required field(s) missing');
				done();
			});
	});
	test('View issues on a project: GET request to /api/issues/{project}', function (done) {
		chai
			.request(server)
			.get('/api/issues/chaitesting')
			.end(function (err, res) {
				assert.equal(res.status, 200, 'Response status should be 200');
				assert.isArray(res.body);
				done();
			});
	});
	test('View issues on a project with one filter: GET request to /api/issues/{project}', function (done) {
		chai
			.request(server)
			.get('/api/issues/chaitesting?issue_title=chaiTitle2')
			.end(function (err, res) {
				assert.equal(res.status, 200, 'Response status should be 200');
				assert.equal(res.body[0].issue_title, 'chaiTitle2');
				assert.equal(res.body[0].issue_text, 'chaiText');
				assert.equal(res.body[0].created_by, 'chaiCreator');
				assert.equal(res.body[0].assigned_to, 'chaiWorker');
				assert.equal(res.body[0].status_text, 'chaiStatus');
				assert.equal(res.body[0].open, true);
				assert.equal(res.body[0]._id, 'f44ab0f6-749a-4349-8758-e35767998bb7');
				assert.equal(res.body[0].created_on, '2022-10-18T19:56:47.508Z');
				assert.equal(res.body[0].updated_on, '2022-10-18T19:56:47.508Z');
				assert.equal(res.body[1].issue_title, 'chaiTitle2');
				assert.equal(res.body[1].issue_text, 'chaiText2');
				assert.equal(res.body[1].created_by, 'chaiCreator');
				assert.equal(res.body[1].assigned_to, 'chaiWorker');
				assert.equal(res.body[1].status_text, 'chaiStatus');
				assert.equal(res.body[1].open, true);
				assert.equal(res.body[1]._id, '0d5330a7-997b-4164-9337-4c760ff9b5f2');
				assert.equal(res.body[1].created_on, '2022-10-19T17:07:38.803Z');
				assert.equal(res.body[1].updated_on, '2022-10-19T17:07:38.803Z');
				done();
			});
	});
	test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function (done) {
		chai
			.request(server)
			.get(
				'/api/issues/chaitesting?issue_title=chaiTitle2&issue_text=chaiText2'
			)
			.end(function (err, res) {
				assert.equal(res.status, 200, 'Response status should be 200');
				assert.equal(res.body[0].issue_title, 'chaiTitle2');
				assert.equal(res.body[0].issue_text, 'chaiText2');
				assert.equal(res.body[0].created_by, 'chaiCreator');
				assert.equal(res.body[0].assigned_to, 'chaiWorker');
				assert.equal(res.body[0].status_text, 'chaiStatus');
				assert.equal(res.body[0].open, true);
				assert.equal(res.body[0]._id, '0d5330a7-997b-4164-9337-4c760ff9b5f2');
				assert.equal(res.body[0].created_on, '2022-10-19T17:07:38.803Z');
				assert.equal(res.body[0].updated_on, '2022-10-19T17:07:38.803Z');
				done();
			});
	});
	test('Update one field on an issue: PUT request to /api/issues/{project}', function (done) {
		chai
			.request(server)
			.put('/api/issues/chaitesting?_id=41d8c824-1021-4ae4-9d7d-ded15eda88af')
			.send({
				_id: '41d8c824-1021-4ae4-9d7d-ded15eda88af',
				issue_title: 'Revised Chai Title 2',
			})
			.end(function (err, res) {
				assert.equal(res.status, 200, 'Response status should be 200');
				assert.equal(res.body.result, 'successfully updated');
				assert.equal(res.body._id, '41d8c824-1021-4ae4-9d7d-ded15eda88af');
				done();
			});
	});
	test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function (done) {
		chai
			.request(server)
			.put('/api/issues/chaitesting?_id=41d8c824-1021-4ae4-9d7d-ded15eda88af')
			.send({
				_id: '41d8c824-1021-4ae4-9d7d-ded15eda88af',
				issue_title: 'Revised Chai Title 3',
				issue_text: 'Revised Chai Text 3',
			})
			.end(function (err, res) {
				assert.equal(res.status, 200, 'Response status should be 200');
				assert.equal(res.body.result, 'successfully updated');
				assert.equal(res.body._id, '41d8c824-1021-4ae4-9d7d-ded15eda88af');
				done();
			});
	});
	test('Update an issue with missing _id: PUT request to /api/issues/{project}', function (done) {
		chai
			.request(server)
			.put('/api/issues/chaitesting')
			.send({
				issue_title: 'Revised Chai Title 3',
				issue_text: 'Revised Chai Text 3',
			})
			.end(function (err, res) {
				assert.equal(res.status, 200, 'Response status should be 200');
				assert.equal(res.body.error, 'missing _id');
				done();
			});
	});
	test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function (done) {
		chai
			.request(server)
			.put('/api/issues/chaitesting')
			.send({
				_id: '41d8c824-1021-4ae4-9d7d-ded15eda88af',
			})
			.end(function (err, res) {
				assert.equal(res.status, 200, 'Response status should be 200');
				assert.equal(res.body.error, 'no update field(s) sent');
				assert.equal(res.body._id, '41d8c824-1021-4ae4-9d7d-ded15eda88af');
				done();
			});
	});
	test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function (done) {
		chai
			.request(server)
			.put('/api/issues/chaitesting')
			.send({
				_id: '41d8c824-1021-4ae4-9d7d-ded15eda88af11',
				issue_title: 'Revised Chai Title 3',
				issue_text: 'Revised Chai Text 3',
			})
			.end(function (err, res) {
				assert.equal(res.status, 200, 'Response status should be 200');
				assert.equal(res.body.error, 'could not update');
				assert.equal(res.body._id, '41d8c824-1021-4ae4-9d7d-ded15eda88af11');
				done();
			});
	});

	test('Delete an issue: DELETE request to /api/issues/{project}', function (done) {
		let deleteId = '521435a9-ee91-43b4-a4c5-06d1361c88a7'; //ENTER _ID TO DELETE FOR TEST!!
		chai
			.request(server)
			.delete('/api/issues/chaitesting')
			.send({
				_id: deleteId,
			})
			.end(function (err, res) {
				assert.equal(res.status, 200, 'Response status should be 200');
				assert.equal(res.body.result, 'successfully deleted');
				assert.equal(res.body._id, deleteId);
				done();
			});
	});

	test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function (done) {
		chai
			.request(server)
			.delete('/api/issues/chaitesting')
			.send({
				_id: 'b792c1a5-de9b-4647-a944-91471992d3a7',
			})
			.end(function (err, res) {
				assert.equal(res.status, 200, 'Response status should be 200');
				assert.equal(res.body.error, 'could not delete');
				assert.equal(res.body._id, 'b792c1a5-de9b-4647-a944-91471992d3a7');
				done();
			});
	});
	test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function (done) {
		chai
			.request(server)
			.delete('/api/issues/chaitesting')
			// .send({
			// 	_id: 'b792c1a5-de9b-4647-a944-91471992d3a7',
			// })
			.end(function (err, res) {
				assert.equal(res.status, 200, 'Response status should be 200');
				assert.equal(res.body.error, 'missing _id');
				done();
			});
	});

	//
	//-------------------------------------HIDING
	// -----------------------------------
});
