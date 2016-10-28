module.exports = {
	itemNamesToMap: function (item, callback) {
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
	userToDTO: function (currUser, targUser, instruMap, genresMap) {
		//console.log(currUser);
		//console.log(targUser);
		if (currUser.location.valid && targUser.location.valid) {
			let distanceToUser = geolib.getDistance({
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

		let userDTO = {
			_id: targUser._id,
			username: targUser.username,
			status: "Not Implemented",
			instruments: [],
			genres: [],
			distance: distanceToUser,
			percentage: 0,
			image: targUser.image
		};
		console.log("TARGUSER");
		console.log(targUser);
		for (let j = 0; j < targUser.instruments.length; j++) {
			userDTO.instruments.push(instruMap[targUser.instruments[j]]);
		}

		for (let j = 0; j < targUser.genres.length; j++) {
			userDTO.genres.push(genresMap[targUser.genres[j]]);
		}
		return userDTO;
	}
};