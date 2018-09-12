// app/routes.js
module.exports = function(app, passport) {

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/', function(req, res) {
        if (req.isAuthenticated()){
            res.redirect('/index');
            console.log(req.user.type);
        }else{
            // render the page and pass in any flash data if it exists
            res.render('index.ejs', { message: req.flash('loginMessage') });
        }
    });

    // process the login form
    app.post('/', function(req, res, next) {
        passport.authenticate('local-login', function(err, user, info) {
            if (err) { 
                return next(err); 
            }
            // Redirect if it fails
            if (!user) { 
                failureFlash : true // allow flash messages
                return res.redirect('/');
            }
            req.logIn(user, function(err) {
                if (err) { 
                    return next(err); 
                }
                // Redirect if it succeeds
                return res.redirect('/index');
            });
        })(req, res, next);
    });
    /*app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));*/


    // =====================================
    // PROFILE ==============================
    // =====================================
    // show the user profile
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    app.get('/building', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('building.ejs', { message: req.flash('signupMessage') });
    });

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    /*app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });*/

    // process the signup form
    app.post('/signup', isLoggedIn, passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/index', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    
    // =====================================
    // VIEW SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/index', isLoggedIn, function(req, res) {
            if(req.user.type=="paciente"){
                res.render('valor/paciente.ejs', {
                    user : req.user // get the user out of session and pass to template
                });
            }else if(req.user.type=="operario"){
                res.render('valor/operario.ejs', {
                    user : req.user // get the user out of session and pass to template
                });
            }else if(req.user.type=="laboratorista"){
                res.render('valor/laboratorista.ejs', {
                    user : req.user // get the user out of session and pass to template
                });
            }else return res.redirect('/');
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    res.redirect('/');
}