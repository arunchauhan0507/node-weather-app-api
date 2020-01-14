const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Task = require('../models/task')

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    email : {
        type : String,
        unique : true,
        required : true,
        trim : true,
        lowercase : true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Email is not vallid')
            }
        }
    },
    password : {
        type : String,
        required : true,
        trim : true,
        minlength : 7,
        validate(value) {
            if(value.toLowerCase().includes('password')){
                throw new Error('Password cannot contains password')
            }
        }
    },
    age : {
        type : Number,
        default : 0,
        validate(value) {
            if(value < 0){
                throw new Error('Age can not be negative!')
            }
        }
    },
    avatar : {
        type : Buffer   //for image byte data store
    },
    tokens : [{
        token : {
            type : String,
            required : true
        }
    }],
},{
    timestamps : true
})

userSchema.virtual('tasks' ,{
    ref : 'Task',
    localField : '_id',
    foreignField : 'owner'
})

userSchema.methods.toJSON =  function(){
    const user = this;
    // console.log(user)
    const userObject = user.toObject();
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    // console.log(userObject)
    return userObject;
}

userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({ _id : user._id.toString() }, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if(!user){
        throw new Error('Enable to Login')
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        throw new Error('Password not matched with given email id');
    }
    return user;
}

//Middleware to hash password
userSchema.pre('save', async function(next){
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
})

//Middleware to delete all tasks before user deleted
userSchema.pre('remove', async function(next) {
    const user = this;
    await Task.deleteMany({ owner : user._id});
    next();
})


const User = mongoose.model('User', userSchema)
module.exports = User;