var express = require('express'),
    bodyParser = require('body-parser'),
    nunjucks = require('nunjucks'),
	 	MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    NotesDAO = require('./notes').NotesDAO,
		UsersDAO = require('./users').UsersDAO,
		showdown = require('showdown'),
		session = require('express-session');

// Set up express
app = express();
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(session({
	secret: 'in principio',
	resave: true,
	saveUninitialized: false,
}));
app.use('/static', express.static(__dirname + '/static'));
app.use(bodyParser.urlencoded({ extended: true }));

var env = nunjucks.configure('views', {
    autoescape: true,
    express: app
});

var converter = new showdown.Converter();

MongoClient.connect('mongodb://localhost:27017/notes', function(err, db) {
    "use strict";

    assert.equal(null, err);
    console.log("Successfully connected to MongoDB.");

    var items = new NotesDAO(db);
		var users = new UsersDAO(db);
    
    var router = express.Router();

    // Homepage
    router.get("/", function(req, res) {
        "use strict";
        
				var tags = req.query.tags ? req.query.tags : [""];

        items.getNotes(tags, function(items) {
            
					for (var item in items) {
						items[item].content = converter.makeHtml(items[item].content);
						console.log("Content: " + items[item].content);
					}

       		res.render('notes', { items: items });
                    
        });
    });

		router.post('/', function(req, res) {
			
			if (req.body.password !== req.body.passwordConf) {
				var err = new Error("Passwords do not match.");
				err.status = 400;
				res.send("Passwords do not match.");
				return err;
			}

			var email = req.body.email;
			var username = req.body.username;
			var password = req.body.password;
			var passwordConf = req.body.passwordConf;

			if (email && username && password && passwordConf) {

				var userData = {
					email: email,
					username: username,
					password: password,
					passwordConf: passwordConf
				}

				users.addUser(email, username, password, function(err, user) {
					if (err) {
						return err;
					}
					else {
						req.session.userId = user.id;
						return res.redirect('/profile');
					}
				});

			}

			else if (req.body.logemail && req.body.logpassword) {

				users.authenticate(req.body.logemail, req.body.logpassword, function(err, user) {
					if (err || !user) {
						var error = new Error('Wrong email or password.');
						error.status = 401;
						return error;
					}
					else {
						req.session.userId = user._id;
						return res.redirect('/profile');
					}
				});
			
			}
			
			else {

				var error = new Error('All fields are required.');
				error.status = 400;
				return error;

			}

		});
    
    router.get("/search", function(req, res) {
        "use strict";

				console.log("Searching for " + req.query.query);
				
				var tags;
				
				if (req.query.query) {
					tags = req.query.query.split(",");
					for (var tag in tags) {
						tags[tag] = tags[tag].trim();
					}
				}
				else {
					tags = [""];
				}

        items.searchItems(tags, function(items) {

					for (var item in items) {
						items[item].content = converter.makeHtml(items[item].content);
					}

        	res.render('notes', { items: items, converter: converter });
				
				});
    });

/*
    router.get("/item/:itemId", function(req, res) {
        "use strict";

        var itemId = parseInt(req.params.itemId);

        items.getItem(itemId, function(item) {
            console.log(item);

            if (item == null) {
                res.status(404).send("Item not found.");
                return;
            }
            
            var stars = 0;
            var numReviews = 0;
            var reviews = [];
            
            if ("reviews" in item) {
                numReviews = item.reviews.length;

                for (var i=0; i<numReviews; i++) {
                    var review = item.reviews[i];
                    stars += review.stars;
                }

                if (numReviews > 0) {
                    stars = stars / numReviews;
                    reviews = item.reviews;
                }
            }

            items.getRelatedItems(function(relatedItems) {

                console.log(relatedItems);
                res.render("item",
                           {
                               userId: USERID,
                               item: item,
                               stars: stars,
                               reviews: reviews,
                               numReviews: numReviews,
                               relatedItems: relatedItems
                           });
            });
        });
    });
*/

    router.post("/notes", function(req, res) {
        "use strict";

        var content = req.body.content;
        var tags = req.body.tags;

        items.addItem(content, tags, function(itemDoc) {
           // res.redirect("/item/" + itemId);
					 	res.redirect("/");
        });
    });

		router.get("/register", function(req, res) {
			res.render('register');
		});

		router.post("/register", function(req, res) {
			var email = req.body.email;
			var username = req.body.username;
			var password = req.body.password;
			var passwordConf = req.body.passwordConf;

			if (email && username && password && passwordConf) {
	
				users.addUser(email, username, password, function(userDoc) {
					res.redirect("/profile");
				});

			} // End of if all fields are filled out.

		}); // End of POST to register

		router.get('/profile', function(req, res) {
		});
			
    // Use the router routes in our application
    app.use('/', router);

    // Start the server listening
    var server = app.listen(3000, function() {
        var port = server.address().port;
        console.log('Listening on port %s.', port);
    });

});
