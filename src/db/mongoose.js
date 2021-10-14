const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/task_manager_api', {
    useNewUrlParser: true,
    useCreateIndex: true
})