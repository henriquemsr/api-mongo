const mongoose = require('mongoose')

const Task = mongoose.model('Tasks',{
    task_name:String,
    value:Number,
    date:Date,
    id_user:String,
    name_tutor:String
})
module.exports = Task