var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var fs = require('fs');
var multiparty = require('multiparty');
var url = require('url');

var database = require('./scripts/Database.js');
var three = require('three');
var cookies = require( "cookies" )

var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/users');

var app = express();

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

console.log("Bob bla bla!");

app.use(bodyParser());

app.use(cookieParser());
app.use(expressSession({secret:'somesecrettokenhere',
						resave: true,
						saveUninitialized: true}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
// Include the express body parser

//app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public', 'stylesheets')));

var checkAuth = function(req, res, next) {
	console.log("Path: " + req.path);
   if(req.path != "/login" && req.path != "/stylesheets/style.css") {
	  console.log("session id: " + req.session.user_id);
	  if (!req.session.user_id) {
		res.render('auth', {title : "the animation-viewer",
                            message : "You're not logged in yet! Please log in now!",
                            class : "error"} );
		
		//res.send('You are not authorized to view this page');
	  } else {
		console.log("NEXT");
		next();
	  }
  } else {
	next();
  }
}

var getFileType = function(filename)
{
    console.log("Filename: " + filename);
    var filetypeSeperatorPosition = filename.lastIndexOf(".");
    var filetype = "";

    if(filetypeSeperatorPosition != -1)
    {
        filetype = filename.slice(filetypeSeperatorPosition + 1, filename.length);
    }

    return filetype;
}


/**
 * Checks if the file contains animations data, which can be used by the AnimationViewer.
 * @param file the file to check
 * @throws an exception if file is not valid
 */
var checkAnimationValidity = function(file)
{
    var fileType = getFileType(file.originalFilename);
    if(fileType == "js") {

        // The standard-procedure loader.load like it is also done in the client cant be done here,
        // because XMLhttpRequest does not work under node.js, what results in an exception ->
        // see http://stackoverflow.com/questions/19455087/three-on-node-js-with-jsonloarder
        var loader = new three.JSONLoader();
        try {
                var data = fs.readFileSync(file.path);
                var jsondata = JSON.parse(data);
                loader.parse(jsondata);

        } catch(e) {
            console.log(e.message);
            throw {
                name: "ParseException",
                message: "Could not parse the js file."
            }
        }

    } else {
        throw {
            name: "FileExtensionException",
            message: "Fileextension is: " + fileType + ". Must be 'js'"
        }
    }
}

app.use('/', checkAuth, routes);

app.use('/users', checkAuth, users);
app.use('/auth', function(req, res) {
									console.log("Authing is executed!");
									checkAuth(req, res, auth);});
									
app.get('/start', function(req, res) {
	res.render('auth', {title : "the animation-viewer",
                        message : "You're not logged in yet! Please log in now!",
                        class : "error"});
});


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public', 'html')));

// , function(req, res, next) {
	// //res.json({"message" : "hallo Welt"});
	// res.redirect("/public/html/AnimationViewer.html");
	// console.log("got Request");
// });

app.get('/animations', checkAuth, function(req, res, next) {
	//res.json({"message" : "hallo Welt"});
	res.redirect("/html/AnimationViewer.html");
});


app.get('/login', function(req, res) {
    console.log("redirect request!");
    res.redirect("/auth");
});

app.post('/login', function (req, res) {
      var post = req.body;
      console.log("Executed login method!");
      // The userfunction needs a callback to get the data, because it is asynchronous. So this function gets calles when
      // data is ready!
      if(post.user && post.password) {
          database.getUserPass(post.user, post.password, function (docs) {
              //console.log("Received user data: " + docs[0].username);
              if (docs.length > 0) {
                  console.log("Username: " + docs[0].username + " password: " + docs[0].password);
                  console.log("Userdata is correct");
                  req.session.user_id = docs[0]._id;
                  res.redirect('./animations');
              } else {
                  res.redirect('/auth');
              }
          });
      } else {
          res.redirect('/auth');
      }
    });

app.post('/saveAnimation', function(req, res, next){
    // create a form to begin parsing
    var form = new multiparty.Form();
    var dataInput;

    form.parse(req, function(err, fields, files) {
        if(files) {
            console.log(req.session.user_id);
            console.log("data: " + files.myFile);

            if (files.myFile) {
                try {
                    checkAnimationValidity(files.myFile[0]);
                    var filename = files.myFile[0].originalFilename;
                    var filetype = getFileType(filename);

                    if(filetype) {
                        var goalpath = path.join(__dirname, 'uploads', req.session.user_id);

                        fs.mkdir(goalpath, function (e) {
                            console.log(e + " " + e.code);
                        });

                        saveAnimation(files, goalpath, filename, req.session.user_id);
                        res.writeHead(200, {'content-type': 'text/plain'});
                        res.write("Succeeded uploading file: "
                            + files.myFile[0].originalFilename + "!");

                        res.end();
                    }
                } catch (e) {
                    res.writeHead(200, {'content-type': 'text/plain'});
                    res.write("Something went wrong! ");
                    res.write(e.name + ": ");
                    res.write(e.message);
                    res.end();
                }

            }
        } else {
            res.writeHead(200, {'content-type': 'text/plain'});
            res.write("Something went wrong!");
            res.end();
        }
    });
});

var saveAnimation = function (files, goalpath, filename, userid) {
    goalpath = path.join(goalpath, filename);
    console.log("Goalpath: " + goalpath);

    // Callbacks are empty but if they would not be availible node.js throws an exception
    fs.createReadStream(files.myFile[0].path, function () {
    }).pipe(fs.createWriteStream(goalpath, function () {
    }));
    console.log("Pre renaming");

    //fs.renameSync(files.myFile[0].path, goalpath);

    console.log("Pre Database!");

    database.saveAnimation(userid, files.myFile[0].originalFilename);
}

app.get('/getAnimationList', function(req, res, next) {
    database.getUserAnimations(req.session.user_id, function(data) {
        res.writeHead(200, {'content-type': 'text/plain'});
        res.write(JSON.stringify(data));
        res.end();
    });
});

app.get('/getAnimationData', function(req, res, next) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var animationName = query["animationName"];
    console.log("Animation Name: " + animationName);

    if (req.session.user_id) {
        database.existsAnimation(req.session.user_id, animationName, function (data) {
            if (data) {

                var animationPath = path.join(__dirname, "uploads", req.session.user_id, animationName);
                fs.exists(animationPath, function (exists) {
                    if (exists) {
                        res.sendfile(animationPath);
                    } else {
                        console.log("The requested file '" + animationPath + "' does not exist on the server!");
                    }
                });

            } else {
                console.log("User is not logged in!");
            }
        });
    }
});

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;


