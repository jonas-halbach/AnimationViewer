/**
 * Author: Jonas Halbach
 * Creation Date: 24.06.2014
 *
 * This js-File for node.js is the interface to the database.
 */

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/AnimationViewerData');

module.exports = {

  getUserPass: function (user, password, callback) {

        console.log("user: " + user + " password: " + password);
		var users = db.get('users');
		users.find({'username' : user , 'password' : password}, function(e, docs) {
		
		callback(docs);
	});
  },

  existsAnimation : function (ownerId, animName, callback) {
    console.log("Animation exists?");
    var animations = db.get('animations');
    animations.find({"ownerId" : ownerId, "animName" : animName}, function(e, docs) {
        callback(docs);
    });
  },

  saveAnimation : function(ownerId, animName) {
      this.existsAnimation(ownerId, animName, function(data) {
        var animations = db.get('animations');
        console.log("data: " + data);
        if(!data || data == "") {
            console.log("insertAnimation");
            animations.insert({"ownerId" : ownerId, "animName" : animName } , function(err, doc) {
                if(err) {
                    throw err;
                }
            });
        }
    });
  },

  getUserAnimations : function(ownerId, callback) {
    var animations = db.get('animations');
    animations.find({}, function (e, docs) {
        callback(docs);
    });
  }
  
};