var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var  expressHandlebars =require('express-handlebars')
var hbs = expressHandlebars.create({
  // Disable prototype access check
  allowProtoMethodsByDefault: true,
  allowProtoPropertiesByDefault: true
});
var session = require('express-session')
const uuid = require('uuid').v4;
const sessionSecret = uuid();
const bodyParser = require('body-parser');




var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');



var app = express();
var fileUpload=require('express-fileupload')
//var db=require('./config/connection')
var db= require('./config/connection')

// view engine setup
app.set('views', path.join(__dirname, 'views'));


app.engine('hbs', expressHandlebars({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))

app.set('view engine', 'hbs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(fileUpload())
app.use(bodyParser.urlencoded({ extended: true }));

//app.use(session({secret:"key",cookie:{maxAge:60000}}))

app.use(session({ secret: sessionSecret, cookie: { maxAge: 600000 } }));

 db.connect((err)=>{
     if(err)console.log("connection error")
  else console.log("Database");
 })

app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
