// app/routes.js
module.exports = function(app, passport) {

var User = require('../models/user.js');
var Sample = require('../models/sample.js');
var Exam = require('../models/exam.js');

	// =====================================
	// TO UPDATE AND DELETE USERS ==========
	// =====================================
	app.get('/users', isLoggedIn, function(req, res){ 
	    User.find(function(err, users, next){
	        if(err){
	            return next(err);
	        } else {
	            res.json(users);    
	        }
	    });
	});

	app.get('/myid', isLoggedIn, function(req, res){ 
	    User.findById(req.session.passport.user, function(err, user){
	        if(err){
	            return next(err);
	        } else {
	            res.json(user);    
	        }
	    });
	});

	//PUT - Actualizar usuario
	app.put('/users/:id', isLoggedIn, function(req, res){
		if(true){
			User.findById(req.params.id, function(err, user){
				console.log(req.body.password);
				if(req.body.password!=undefined){
				 	if (req.params.id == req.session.passport.user){
						user.local.password			= user.generateHash(req.body.password);
					}else{return;}
				}
				console.log("here")
				user.name 	 		= req.body.name;
				user.last 	 		= req.body.last;
				user.info.ci 		= req.body.ci;
				user.info.address 	= req.body.address;
				user.info.phone		= req.body.phone;
				user.local.email			= req.body.email;

				user.save(function(err){
					if(err){res.redirect('/')}
					res.json(user);
				})

			})
		}else{
            return res.redirect('/');
        }
	})

	//DELETE - Eliminar usuario
	app.delete('/users/:id', isLoggedIn, function(req, res){
		if(req.user.type=="operario"){
			User.findByIdAndRemove(req.params.id, function(err){
				if(err){res.send(err)}
				res.json({message: 'That one is gone'});
			})
		}else{
            return res.redirect('/');
        }
	})

	// =====================================
	// TO ADD UPDATE AND DELETE SAMPLES ====
	// =====================================
	app.get('/samples', isLoggedIn, function(req, res){ 
	    Sample
	    .find()
	    .populate('_user')
	    .populate('results')
	    .exec(function(err, samples, next){
	        if(err){
	            return next(err);
	        }else {
	            res.json(samples);    
	        }
	    });
	});

	app.post('/sample', isLoggedIn, function(req,res){
		if(true){
			var sample = new Sample({
				_user			 : req.body.id,
				type             : req.body.type,
			    code             : req.body.code,
			    date             : req.body.date,
			    etype            : req.body.etype,
			    medic            : req.body.medic,
			    lab              : req.body.lab,
			    meta             : req.body.meta,
			    results			 : req.body.results
			});sample.save(function(err){
				if(err){res.send(err)}
				res.json(sample);
			});
		}else{
			res.json('Something went wrong')
            return res.redirect('/');
        }
	})

	//PUT - Actualizar sample
	app.put('/samples/:id', isLoggedIn, function(req, res){
		if(true){
			Sample.findById(req.params.id, function(err, sample){
				sample._user		= req.body.id,
				sample.type     	= req.body.type,
			    sample.code			= req.body.code,
			    sample.date         = req.body.date,
			    sample.etype        = req.body.etype,
			    sample.medic        = req.body.medic,
			    sample.lab          = req.body.lab,
			    sample.meta         = req.body.meta,
			    sample.results		= req.body.results

				sample.save(function(err){
					if(err){res.send(err)}
					res.json(sample);
				})
			})
		}else{
            return res.redirect('/');
        }
	})

	//DELETE - Eliminar sample
	app.delete('/samples/:id', isLoggedIn, function(req, res){
		if(req.user.type=="operario"){
			Sample.findByIdAndRemove(req.params.id, function(err, sample){
				for (var i=0;i<sample.results.length;i++){
					Exam.findByIdAndRemove(sample.results[i], function(err,exam){
						if(err){res.send(err)}
					})
				}
				if(err){res.send(err)}
				res.json({message: 'That one is gone'});
			})
		}else{
            return res.redirect('/');
        }
	})


	// =====================================
	// TO ADD UPDATE AND DELETE EXAMS ======
	// =====================================
	app.get('/exams'/*, isLoggedIn*/, function(req, res){ 
	    Exam
	    .find()
	    .populate({path: '_sample', populate:{path:'_user'}})
	    .exec(function(err, exams, next){
	        if(err){
	            return next(err);
	        }else {
	            res.json(exams);    
	        }
	    });
	});

	app.post('/exam', isLoggedIn, function(req,res){
		if(true){
			var exam = new Exam({
				_sample			 : req.body.id,
				type             : req.body.type,
			    parameter        : req.body.parameter,
			    unit             : req.body.unit,
			    result           : req.body.result,
			    ref              : req.body.ref
			});
			exam.save(function(err){
				Sample.findById(req.body.id, function(err, sample){
					sample.meta = "Completo";
					sample.results.push(exam);
					sample.save(function(err){
						if(err){}
					})
				})
				if(err){res.send(err)}
				res.json(exam);
			});
		}else{
			res.json('Something went wrong')
            return res.redirect('/');
        }
	})

	//PUT - Actualizar exam
	app.put('/exams/:id', isLoggedIn, function(req, res){
		if(true){
			Exam.findById(req.params.id, function(err, exam){
				exam.type     	    = req.body.type,
			    exam.parameter	    = req.body.parameter,
			    exam.unit           = req.body.unit,
			    exam.result         = req.body.result,
			    exam.ref       	    = req.body.ref
				exam.save(function(err){
					if(err){res.send(err)}
					res.json(exam);
				})
			})
		}else{
            return res.redirect('/');
        }
	})

	//DELETE - Eliminar exam
	app.delete('/exams/:id', isLoggedIn, function(req, res){
		if(req.user.type=="laboratorista"){
			Exam.findByIdAndRemove(req.params.id, function(err,exam){
				Sample.findById(exam._sample, function(err, sample){
					sample.results.pull(exam);
					sample.save(function(err){
						if(err){}
					})
				})
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
    if (req.isAuthenticated()){
        return next();
    }
    // if they aren't redirect them to the home page
    res.redirect('/');
}