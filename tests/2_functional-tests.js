const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const fields = {
    "assigned_to": "", 
    "status_text": "",
    "open": true, 
    "_id": "1",
    "issue_title": "",
    "issue_text": "",
    "created_by": "", 
    "created_on": "", 
    "updated_on": "", 
  };

suite('Functional Tests', function() {
  this.timeout(5000);
  suite('Submit issue on project', () => {
    test('When issue is created, all fields exist', (done) => {
        chai
            .request(server)
            .keepOpen()
            .post('/api/issues/myproject')
            .send({
                "issue_title": "",
                "issue_text": "",
                "created_by": "", 
                "assigned_to": "", 
                "status_text": "",
            })
            .end((err, res) => {
                for (const field in fields) {
                    assert.exists(res.body[field]);
                }
                done();
            });
    });
    test('Create an issue with every field: POST request to /api/issues/{project}', (done) => {
        chai
            .request(server)
            .keepOpen()
            .post('/api/issues/myproject')
            .send({
                "issue_title": "1",
                "issue_text": "2",
                "created_by": "3", 
                "assigned_to": "4", 
                "status_text": "5",
            })
            .end((err, res) => {
                assert.equal(res.body['issue_title'], "1");
                assert.equal(res.body['issue_text'], "2");
                assert.equal(res.body['created_by'], "3");
                assert.equal(res.body['assigned_to'], "4");
                assert.equal(res.body['status_text'], "5");
                done();
            });
    });
    test('Create an issue with only required fields: POST request to /api/issues/{project}', (done) => {
        chai
            .request(server)
            .keepOpen()
            .post('/api/issues/myproject')
            .send({
                "issue_title": "1",
                "issue_text": "2",
                "created_by": "3", 
            })
            .end((err, res) => {
                assert.equal(res.body['issue_title'], "1");
                assert.equal(res.body['issue_text'], "2");
                assert.equal(res.body['created_by'], "3");
                assert.equal(res.body['assigned_to'], "");
                assert.equal(res.body['status_text'], "");
                done();
            });
    });
    test('Create an issue with missing required fields: POST request to /api/issues/{project}', (done) => {
        chai
            .request(server)
            .keepOpen()
            .post('/api/issues/myproject')
            .send({
                "issue_title": "1",
                "issue_text": "2", 
            })
            .end((err, res) => {
                let badInputResponse = { error: 'required field(s) missing' };
                assert.deepEqual(res.body, badInputResponse);
                done();
            });
    });
  });

  suite('GET issues on database', () => {
    chai
        .request(server)
        .keepOpen()
        .post('/api/issues/getproject')
        .send({
            "issue_title": "1",
            "issue_text": "2",
            "created_by": "13", 
        })
        .end();
    chai
        .request(server)
        .keepOpen()
        .post('/api/issues/getproject')
        .send({
            "issue_title": "21",
            "issue_text": "2",
            "created_by": "23", 
        })
        .end();
    chai
        .request(server)
        .keepOpen()
        .post('/api/issues/getproject')
        .send({
            "issue_title": "1",
            "issue_text": "32",
            "created_by": "33", 
        })
        .end();
      test('View issues on a project: GET request to /api/issues/{project}', (done) => {
        chai
        .request(server)
        .keepOpen()
        .get('/api/issues/getproject')
        .end((err, res) => {
            let expected = 3;
            assert.equal(res.body.length, expected);
            done();
        });
      });
      test('View issues on a project with one filter: GET request to /api/issues/{project}', (done) => {
        chai
        .request(server)
        .keepOpen()
        .get('/api/issues/getproject?issue_text=2')
        .end((err, res) => {
            let expected = 2;
            assert.equal(res.body.length, expected);
            done();
        });
      });
      test('View issues on a project with multiple filters: GET request to /api/issues/{project}', (done) => {
        chai
        .request(server)
        .keepOpen()
        .get('/api/issues/getproject?issue_text=2&issue_title=1')
        .end((err, res) => {
            let expected = 1;
            assert.equal(res.body.length, expected);
            done();
        });
      });
    });
    suite('Update issue on project', () => {
        test('Update one field on an issue: PUT request to /api/issues/{project}', async () => {
            let idOfTest;
            let connection = chai.request(server).keepOpen();
            await connection
                .post('/api/issues/myproject')
                .send({
                    "issue_title": "1",
                    "issue_text": "2",
                    "created_by": "3", 
                })
                .then((res) => {
                    idOfTest = res.body._id;
                });
            await connection
                .put('/api/issues/myproject')
                .send({
                    "_id": idOfTest,
                    "issue_title": "4",
                });
            await connection
                .get(`/api/issues/myproject?_id=${idOfTest}`)
                .then((res) => {
                    assert.equal(res.body.length, 1);
                    assert.equal(res.body[0]["issue_title"], "4");
                    assert.equal(res.body[0]["issue_text"], "2");
                    assert.equal(res.body[0]["created_by"], "3");
                });
        });
        test('Update multiple fields on an issue: PUT request to /api/issues/{project}', async () => {
            let idOfTest;
            await chai
                .request(server)
                .keepOpen()
                .post('/api/issues/myproject')
                .send({
                    "issue_title": "1",
                    "issue_text": "2",
                    "created_by": "3", 
                })
                .then((res) => {
                    idOfTest = res.body._id;
                });
            await chai
                .request(server)
                .keepOpen()
                .put('/api/issues/myproject')
                .send({
                    "_id": idOfTest,
                    "issue_title": "4",
                    "issue_text": "5",
                });
            await chai
                .request(server)
                .keepOpen()
                .get(`/api/issues/myproject?_id=${idOfTest}`)
                .then((res) => {
                    assert.equal(res.body.length, 1);
                    assert.equal(res.body[0]["issue_title"], "4");
                    assert.equal(res.body[0]["issue_text"], "5");
                    assert.equal(res.body[0]["created_by"], "3");
                });
        });
        test('Update an issue with missing _id: PUT request to /api/issues/{project}', async () => {
            let idOfTest;
            await chai
                .request(server)
                .keepOpen()
                .post('/api/issues/myproject')
                .send({
                    "issue_title": "1",
                    "issue_text": "2",
                    "created_by": "3", 
                })
                .then((res) => {
                    idOfTest = res.body._id;
                });
            await chai
                .request(server)
                .keepOpen()
                .put('/api/issues/myproject')
                .send({
                    "issue_title": "4",
                    "issue_text": "5",
                })
                .then((res) => {
                    let failMessage = { error: 'missing _id' };
                    assert.deepEqual(res.body, failMessage);
                });
        });
        test('Update an issue with no fields to update: PUT request to /api/issues/{project}', async () => {
            let idOfTest;
            await chai
                .request(server)
                .keepOpen()
                .post('/api/issues/myproject')
                .send({
                    "issue_title": "1",
                    "issue_text": "2",
                    "created_by": "3", 
                })
                .then((res) => {
                    idOfTest = res.body._id;
                });
            await chai
                .request(server)
                .keepOpen()
                .put('/api/issues/myproject')
                .send({
                    "_id": idOfTest,
                });
            await chai
                .request(server)
                .keepOpen()
                .get(`/api/issues/myproject?_id=${idOfTest}`)
                .then((res) => {
                    assert.equal(res.body.length, 1);
                    assert.equal(res.body[0]["issue_title"], "1");
                    assert.equal(res.body[0]["issue_text"], "2");
                    assert.equal(res.body[0]["created_by"], "3");
                });
        });
        test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', async () => {
            let idOfTest;
            await chai
                .request(server)
                .keepOpen()
                .post('/api/issues/myproject')
                .send({
                    "issue_title": "1",
                    "issue_text": "2",
                    "created_by": "3", 
                })
                .then((res) => {
                    idOfTest = res.body._id;
                });
            await chai
                .request(server)
                .keepOpen()
                .put('/api/issues/myproject')
                .send({
                    "_id": "69420",
                    "issue_title": "4",
                    "issue_text": "5",
                })
                .then((res) => {
                    let failMessage = {"error": 'could not update', "_id": '69420'};
                    assert.deepEqual(res.body, failMessage);
                });
        });
    });

    suite("Deleting issues", () => {
        test("Delete an issue: DELETE request to /api/issues/{project}", async () => {
            let idOfTest;
            await chai
                .request(server)
                .keepOpen()
                .post('/api/issues/myproject')
                .send({
                    "issue_title": "1",
                    "issue_text": "2",
                    "created_by": "3", 
                })
                .then((res) => {
                    idOfTest = res.body._id;
                });
            await chai
                .request(server)
                .keepOpen()
                .delete('/api/issues/myproject')
                .send({
                    "_id": idOfTest,
                })
                .then((res) => {
                    let expected = {"result": "successfully deleted", "_id": idOfTest};
                    assert.deepEqual(res.body, expected);
                });
        });
        test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", async () => {
            let idOfTest;
            await chai
                .request(server)
                .keepOpen()
                .post('/api/issues/myproject')
                .send({
                    "issue_title": "1",
                    "issue_text": "2",
                    "created_by": "3", 
                })
                .then((res) => {
                    idOfTest = res.body._id;
                });
            await chai
                .request(server)
                .keepOpen()
                .delete('/api/issues/myproject')
                .send({
                    "_id": "69420",
                })
                .then((res) => {
                    let expected = {"error":"could not delete","_id":"69420"};
                    assert.deepEqual(res.body, expected);
                });
        });
        test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", async () => {
            let idOfTest;
            await chai
                .request(server)
                .keepOpen()
                .post('/api/issues/myproject')
                .send({
                    "issue_title": "1",
                    "issue_text": "2",
                    "created_by": "3", 
                })
                .then((res) => {
                    idOfTest = res.body._id;
                });
            await chai
                .request(server)
                .keepOpen()
                .delete('/api/issues/myproject')
                .send({})
                .then((res) => {
                    let expected = { error: 'missing _id' };
                    assert.deepEqual(res.body, expected);
                });
        });
    });
});
