const mongoose = require('mongoose')
const validate = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({

    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value){
            if(!validate.isEmail(value)){
                throw new Error("Please enter a valid email!")
            }
        }
    },
    password:{
        type: String,
        required: true,
        trim: true,
        minLength: 7,
        validate(value){
            if(value.toLowerCase().includes("password")){
                throw new Error("Password cannot be password!")
            }
        }
    },user_type:{
        type: Number,
        default: 0
    },status:{
        type: Boolean,
        default: true
    }, 
    tokens: [{
        token: {
            type: String,
            required: true
    }
    }],
    avatar:{
        type: Buffer
    }
},{
    timestamps: true
})

userSchema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.avatar
    return userObject
}

userSchema.pre('save', async function(next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
    
})

userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password)=>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('unable to login!')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error("Unable to login")
    }

    return user
}

const User = mongoose.model('User', userSchema)

module.exports = User