var express = require('express');

var app = express();

app.disable('x-powered-by');

var handlebars = require('express-handlebars').create({defaultLayout: 'main'});

app.engine('handlebars', handlebars.engine);

app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname+ '/public'));

app.use(require('body-parser').urlencoded({extended:true}));

var formidable = require('formidable');

var credentials = require('./credentials.js');

app.use(require('cookie-parser')(credentials.freshCookies));

app.get('/nopage', function(req,res){
	console.log("Tried /npage, doesnot exist");
	throw new Error("/noPage doesnt exit");
});
app.use(function(err,req,res,next){
	console.log(err.message);
	next();
});
app.get('/', function(req,res){
	res.render('home');
});

app.get('/about', function(req,res){
	res.render('about');
});

app.get('/contact', function(req,res){
	res.render('contact',{csrf:'Your CSRF Token here'});
});
app.get('/thankyou',function(req,res){
	res.render('thankyou');
});
app.get('/file-upload',function(req,res){
	var now = new Date();
	res.render('file-upload',
		{year: now.getFullYear(),
		 month: now.getMonth()});
});

app.post('/file-upload/:year/:month', function(req,res){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err,fields,file){
		if(err)
			return res.redirect(303, '/error');

		console.log("File Received");

		console.log(file);

		res.redirect(303, '/thankyou');
	});
});

app.get('/cookie', function(req,res){
	res.cookie('username','SomeName', {expire: new Date()+9999}).send('Username has the value SomeName');
});

app.get('/listCookies',function(req,res){
	console.log("Cookies: ", req.cookies);
	res.send("Look in th console for Cookies");
});

app.get('/deleteCookie',function(req,res){
	res.clearCookie('Webstorm-49aeb746');
	res.send('Username Cookie deleted');
});

var session = require('express-session');
var parseurl = require('parseurl');

app.use(session({
	resave:false,
	saveUninitialized:true,
	secret: credentials.freshCookies
}));
app.use(function(req,res,next){
	var views = req.session.views;
	if(!views){
		views = req.session.views = {};
	}

	var pathname = parseurl(req).pathname;

	views[pathname] = views[pathname]+1;
	next();
});

app.get('/viewcount',function(req,res){
	res.send('You viewed this page '+ req.session.views['/viewcount']+ 'times');
});
app.post('/process', function(req,res){
	console.log("Form: "+ req.query.form);
	console.log("CSRF: "+ req.body._csrf);
	console.log("Email: "+ req.body.email);
	console.log("Ques: "+ req.body.ques);
	res.redirect(303, '/thankyou');
});

app.use(function(req,res,next){
	res.type('text/html');
	res.status(404);
	res.render('404');
});
app.use(function(err,req,res,next){
	res.type('text/html');
	res.status(500);
	res.render('500');
});


app.listen(app.get('port'), function(){
	console.log("Server running on port number: "+ app.get('port')+ ", Press ctrl-c to stop server");
});

