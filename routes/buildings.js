// app/routes.js
module.exports = function(app, passport) {

	var Building = require('../models/building.js');

	// =====================================
	// TO ADD UPDATE AND DELETE SAMPLES ====
	// =====================================
	app.get('/buildings', isLoggedIn, function(req, res){ 
	    Building
	    .find(function(err, buildings, next){
	        if(err){
	            return next(err);
	        }else {
	            res.json(buildings);    
	        }
	    });
	});

	app.post('/building', isLoggedIn, function(req,res){
		if(true){
			var building = new Building({
				name			 : req.body.name,
				type             : req.body.type,
			    coordinates      : req.body.coordinates,
			    schedule         : req.body.schedule,
			    description      : req.body.description,
			});building.save(function(err){
				if(err){res.send(err)}
				res.json(building);
			});
		}else{
			res.json('Something went wrong')
            return res.redirect('/building');
        }
	})

	//PUT - Actualizar sample
	app.put('/buildings/:id', isLoggedIn, function(req, res){
		if(true){
			Building.findById(req.params.id, function(err, building){
				building.name			= req.body.name,
				building.type     		= req.body.type,
			    building.coordinates	= req.body.coodinates,
			    building.schedule       = req.body.schedule,
			    building.description    = req.body.description

				building.save(function(err){
					if(err){res.send(err)}
					res.json(building);
				})
			})
		}else{
            return res.redirect('/building');
        }
	})

	//DELETE - Eliminar sample
	app.delete('/buildings/:id', isLoggedIn, function(req, res){
		if(req.user.type=="operario"){
			Building.findByIdAndRemove(req.params.id, function(err){
				if(err){res.send(err)}
				res.json({message: 'That one is gone'});
			})
		}else{
            return res.redirect('/');
        }
	})
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    res.redirect('/');
}