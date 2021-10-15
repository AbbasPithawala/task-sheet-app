const jwt = require('jsonwebtoken')
const User = require('../models/model-user')

const auth = async (req, res, next)=>{
    try{
        const token = req.session.tokenId
        const decode =jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({_id: decode._id, 'tokens.token': token})
        if(!user){
            throw new Error()
        }
        req.token = token
        req.user = user
        next()

    }catch(e){
        res.redirect('/user')
    }
}


module.exports= auth