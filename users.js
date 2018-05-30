var MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
		bcrypt = require('bcrypt');


function UsersDAO(database) {
    "use strict";

    this.db = database;

    this.getUsers = function(callback) {
        "use strict";

				var users_array = []
				var users;
	
				users = this.db.collection("users").find();
				
				users.sort({"_id":1}).toArray(function(err, result) {
					if (err) { throw err; }
					result.forEach(function(doc) {
						console.log("Found user: " + doc._id);
						users_array.push(doc);
					});
        	callback(users_array);
				});
    }

    this.getUserByUsername = function(username, callback) {
        "use strict";

        var user = this.db.collection("users").find( { username: username } );
				
				user = user.limit(1).toArray(function(err, result) {
					if (err) { throw err; }
					result.forEach(function(doc) {
            callback(doc);
					});
				});
    }

    this.getUserById = function(id, callback) {
        "use strict";

        var user = this.db.collection("users").find( { _id: id } );
				
				user = user.limit(1).toArray(function(err, result) {
					if (err) { throw err; }
					result.forEach(function(doc) {
            callback(doc);
					});
				});
    }

    this.addUser = function(email, username, password, callback) {
        "use strict";

				var self = this;
				
				var userCallback = function(err, hash) {	

					if (err) {
						console.log("Error: " + err);
					}

					var userDoc = {
						email: email,
						username: username,
						password: hash,
						created_at: Date.now()
					}

					var collection = self.db.collection("users");

					var insert = collection.insert(userDoc);
					callback(insert);
				
				}

				bcrypt.hash(password, 10, userCallback);	

    }

    this.authenticate = function(email, password, callback) {
        "use strict";

        var user = this.db.collection("users").find( { email: email } );
				
				user = user.limit(1).toArray(function(err, result) {
					if (err) { throw err; }
					result.forEach(function(doc) {
						bcrypt.compare(password, doc.password, function(err, result) {
							if (result === true) {
								return callback(null, doc);
							}
							else {
								return callback();
							}
						}); // End bcrypt compare
					}); // End result item processing
				}); // End result processing
		}

}

module.exports.UsersDAO = UsersDAO;
