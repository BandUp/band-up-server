const geolib = require('geolib');

module.exports = {
	itemNamesToMap: function(item, callback) {
		item.find({}, (err, itemDoc) => {
			if (err) {
				console.log("Error occurred:");
				console.log(err);
				res.status(500).send("Unknown internal server error occurred.");
				callback(null);
				return;
			}
			let itemMap = {};

			for (let i = 0; i < itemDoc.length; i++) {
				itemMap[itemDoc[i]._id] = itemDoc[i].name;
			}
			callback(itemMap);
		});
	},
	// currUser: The user that is currently logged in.
	// targUser: The user that is currently being worked on.
	// instruMap: A map with key-value pairs of IDs and names of instruments.
	// genresMap: A map with key-value pairs of IDs and names of genres.
	userToDTO: function(currUser, targUser, instruMap, genresMap) {
		//console.log(currUser);
		//console.log(targUser);
		let distanceToUser;
		if (currUser.location.valid && targUser.location.valid) {
			distanceToUser = geolib.getDistance({
				latitude: currUser.location.lat,
				longitude: currUser.location.lon
			}, {
				latitude: targUser.location.lat,
				longitude: targUser.location.lon
			});
			distanceToUser /= 1000;

		} else {
			distanceToUser = null;
		}

		function makeFilter(user) {
			return function(val) {
				return user.genres.indexOf(val) !== -1;
			};
		}

		// get total number of genres for user with longer list
		let numGenres = Math.max(currUser.genres.length, targUser.genres.length);

		// filter call returns list shared genres
		let perc = (currUser.genres.filter(makeFilter(targUser)).length / numGenres) * 100;


		let userDTO = {
			_id: targUser._id,
			username: targUser.username,
			status: "Not Implemented",
			instruments: [],
			genres: [],
			distance: distanceToUser,
			percentage: perc,
			image: targUser.image,
			dateOfBirth: targUser.dateOfBirth,
			aboutme: targUser.aboutme,
			soundCloudId: targUser.soundCloudId;
		};

		for (let i = 0; i < targUser.instruments.length; i++) {
			userDTO.instruments.push(instruMap[targUser.instruments[i]]);
		}

		for (let i = 0; i < targUser.genres.length; i++) {
			userDTO.genres.push(genresMap[targUser.genres[i]]);
		}
		return userDTO;
	}
};
