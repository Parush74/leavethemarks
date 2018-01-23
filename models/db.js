 var chalk = require('chalk');
var mongoose = require('mongoose');

var SALT_WORK_FACTOR=100;
const crypto =require ('crypto');

mongoose.Promise = require('bluebird');
//var dbURI = 'mongodb://localhost/test';
var dbURI ='mongodb://parushgupta2:parush900@ds213118.mlab.com:13118/first';

mongoose.connect(dbURI);

mongoose.connection.on('connected',function(){
    console.log(chalk.yellow('Mongoose connected to' +dbURI));
});

mongoose.connection.on('error',function(err){
    console.log(chalk.red('Mongoose connection error :'+err));
});

mongoose.connection.on('disconnected',function(){
    console.log((chalk.red('Mongoose disconnected')));
});
 

var userSchema =new mongoose.Schema({
    username:{type:String ,unique:true},
    email :{type:String, unique:true},
    password : String
    
});

userSchema.pre('save',function(next){
    var user =this;
    
    salt =crypto.randomBytes(32).toString('base64');
    console.log('Before Registering the user');
     
    //only hash the password if it has been modified(or is new)
    if(!user.isModified('password')) return next();
    
    const key =crypto.pbkdf2Sync(user.password,salt,SALT_WORK_FACTOR,512,'sha512'); 
    console.log("*********************",key.toString('hex'));
    user.password = '$2a$'+SALT_WORK_FACTOR +'$'+ salt + '$'+key.toString('hex');
    next();
});

userSchema.methods.comparePassword = function(candidatePassword,cb){
    
    var salt = this.password.split('$')[3];
    const key = crypto.pbkdf2Sync(candidatePassword,salt,SALT_WORK_FACTOR,512,'sha512');
    if('$2a$'+SALT_WORK_FACTOR+'$'+salt +'$' +key.toString('hex')===this.password){
        return cb(null,true)
    }
    
    else{
        return cb(new Error('Invlaid password!'));
    }
    
};

mongoose.model('User',userSchema);


var storiesSchema = new mongoose.Schema({
    
    author:String,
    title: {type:String, unique :true},
    created_at:{type:Date,default:Date.now},
    summary:String,
    content: {type:String},
    imageLink :String,
    comments :[{body:String, commented_by :String,date:Date}],
    slug:String
});


mongoose.model('Story',storiesSchema,'stories');
































