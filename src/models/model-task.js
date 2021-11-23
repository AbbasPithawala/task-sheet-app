const mongoose = require('mongoose')

const taskSchema = mongoose.Schema({
    date: {
        type: Date,
        default: Date.now()
    }, 


    project:{
        type: String,
        required: true,
        trim: true
    },

    task:{
        type: String,
        required: true,  
        trim: true
    },

    start_time:{
        type: Number,
        required: true,
    },
 
    end_time:{
        type: Number,
        default: null
    },

    estimated_time:{
        type: Number,
        default: null
    },

    status:{
        type: Boolean,
        default: false 
    },
    approved:{
        type: Boolean,
        default: 0
    },
    remark:{
        type: String,
        trim: true
    },

    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task