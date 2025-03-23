'use strict';

let projects = {};
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
const requiredFields = {
  "issue_title": "",
  "issue_text": "",
  "created_by": "", 
}

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      if (!(project in projects)) {
        projects[project] = [];
      }
      let filters = {};
      for (const param in req.query) {
        if (param in fields) {
          filters[param] = req.query[param];
        }
      };
      let ans = projects[project].filter((issue) => {
        for (const filter in filters) {
          if (issue[filter] !== filters[filter]) {
            return false;
          }
        }
        return true;
      });
      res.json(ans);
    })
    
    .post(function (req, res){
      let badInputResponse = { error: 'required field(s) missing' };
      let project = req.params.project;
      if (!(project in projects)) {
        projects[project] = [];
      }
      let ans = {};
      for (const field in fields) {
        if (req.body[field] !== undefined) {
          ans[field] = req.body[field];
        }
        else {
          if (field in requiredFields) {
            res.json(badInputResponse);
            return;
          }
          ans[field] = fields[field];
        }
      }
      fields["_id"] = String(parseInt(fields["_id"])+1);
      ans["created_on"] = (new Date(Date.now())).toISOString();
      ans["updated_on"] = (new Date(Date.now())).toISOString();
      projects[project].push(ans);
      res.json(ans);
    })
    
    .put(function (req, res){
      let success = {"result": "successfully updated", "_id": req.body["_id"]};
      let failure = {"error": "could not update", "_id": req.body["_id"]};
      let noId = { error: 'missing _id' };
      let noUpdate = { error: 'no update field(s) sent', '_id': req.body["_id"] };
      let project = req.params.project;
      if (!(project in projects)) {
        projects[project] = [];
      }
      if (req.body._id === undefined) {
        res.json(noId);
        return;
      }
      if (Object.keys(req.body).length === 1) {
        res.json(noUpdate);
        return;
      }
      let issue = projects[project].find((issue) => issue["_id"] === req.body._id);
      if (issue === undefined) {
        res.json(failure);
        return;
      }
      for (const field in req.body) {
        if (req.body[field] !== fields[field]) {
          issue[field] = req.body[field];
        }
      }
      issue["updated_on"] = (new Date(Date.now())).toISOString();
      res.json(success);
    })
    
    .delete(function (req, res){
      let success = {"result": "successfully deleted", "_id": req.body["_id"]};
      let failure = {"error":"could not delete","_id":req.body["_id"]};
      let noId = { error: 'missing _id' };
      let project = req.params.project;
      if (!(project in projects)) {
        projects[project] = [];
      }
      if (req.body._id === undefined) {
        res.json(noId);
        return
      }
      let issueToDelete = projects[project].find((issue) => issue["_id"] === req.body._id);
      if (issueToDelete === undefined) {
        res.json(failure);
        return;
      }
      projects[project] = projects[project].filter((issue) => issue !== issueToDelete);
      res.json(success);
    });
    
};
