var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');


function NotesDAO(database) {
    "use strict";

    this.db = database;

    this.getNotes = function(tags, callback) {
        "use strict";

				var items = []
				var stuff;
	
				//stuff = this.db.collection("notes").find({tags: { $in: tags } });
				stuff = this.db.collection("notes").find();
				
				stuff.sort({"_id":1}).toArray(function(err, result) {
					if (err) { throw err; }
					result.forEach(function(doc) {
						console.log("Found item: " + doc._id);
						items.push(doc);
					});
        	callback(items);
				});
    }

    this.searchItems = function(tags, callback) {
        "use strict";

				var items = this.db.collection("notes").find({ tags: { $in: tags } });
				var stuff = [];
				
				items.toArray(function(err, result) {
					if (err) { throw err; }
					result.forEach(function(doc) {
            stuff.push(doc);
					});
					callback(stuff);
				});
    }

    this.getItem = function(itemId, callback) {
        "use strict";

        /*
         * TODO-lab3
         *
         * LAB #3: Implement the getItem() method.
         *
         * Using the itemId parameter, query the "item" collection by
         * _id and pass the matching item to the callback function.
         *
         */

        var item;
			  item	= this.db.collection("item").find( { _id: itemId } );
				
				var stuff = [];
				item = item.limit(1).toArray(function(err, result) {
					if (err) { throw err; }
					result.forEach(function(doc) {
            callback(doc);
					});
				});

        // TODO-lab3 Replace all code above (in this method).

        // TODO Include the following line in the appropriate
        // place within your code to pass the matching item
        // to the callback.
    }


    this.getRelatedItems = function(callback) {
        "use strict";

        this.db.collection("item").find({})
            .limit(4)
            .toArray(function(err, relatedItems) {
                assert.equal(null, err);
                callback(relatedItems);
            });
    };


    this.addItem = function(content, tags, callback) {
        "use strict";

				tags = tags.split(",");
				for(var tag in tags) {
					tags[tag] = tags[tag].trim();
				}
				var itemDoc = {
            content: content,
            tags: tags,
            created_at: Date.now()
        }
				
				var collection = this.db.collection("notes");
				
				var insert = collection.insert(itemDoc);
        //var update = collection.update( { _id: itemId }, { $set: { reviews: reviews } } );
        callback(insert);

    }


    this.createDummyItem = function() {
        "use strict";

        var item = {
            _id: 1,
            title: "Gray Hooded Sweatshirt",
            description: "The top hooded sweatshirt we offer",
            slogan: "Made of 100% cotton",
            stars: 0,
            category: "Apparel",
            img_url: "/img/products/hoodie.jpg",
            price: 29.99,
            reviews: []
        };

        return item;
    }
}


module.exports.NotesDAO = NotesDAO;
