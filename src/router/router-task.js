const express = require('express')
const router = new express.Router()
const Task = require('../models/model-task')
const auth = require('../middleware/auth')



router.post("/tasks", auth, async (req, res)=>{

        const task = new Task({
        ...req.body,
        owner: req.user._id,
        start_time: Date.now()
    })
    try{
        await task.save()
        res.redirect('/user/dashboard')
    }catch(e){
        res.redirect('/user/dashboard')

    }
})

router.patch("/task", auth, async(req, res)=>{
     try{
        const now_time = Date.now()
        const task = await Task.findOne({_id: req.body.id})
        if(!task){
            res.redirect('/user/dashboard')
        }
        const estimated_time = (((now_time - task.start_time)/1000)/60)/60
        const data = {status: true, end_time: now_time, estimated_time: estimated_time}
        const updates = Object.keys(data)
        updates.forEach((update)=>task[update]=data[update])
        await task.save()
        res.send(task)
      
     }catch(e){
        res.redirect('/user/dashboard')
     }

})


router.post("/fetchTask", auth, async(req,res)=>{
    var task = await Task.find({owner: req.body._id, status: true, approved: false}).sort({date: "descending"})
    let i = 1
    task = task.map((tasks)=>{
        const x = new Date(tasks.date).toLocaleDateString()
        let obj = {
            num: i,
            _id: tasks._id,
            date: x,
            project: tasks.project,
            task: tasks.task,
            start_time: new Date(tasks.start_time).toLocaleTimeString(),
            end_time: new Date(tasks.end_time).toLocaleTimeString(),
            estimated_time: Math.ceil(tasks.estimated_time),
            status: tasks.status
        }
        i += 1
        return obj 
    })

    res.send(task)
})

router.post("/task/fetch/time", auth, async(req,res)=>{
    var interval = req.body.id
    var task = await Task.find({owner: req.body._id, status: true, approved: true}).sort({date: "descending"})
    let i = 1 
    console.log(task)

    task = task.map((tasks)=>{
        const y  = tasks.date
        const today = Date.now()
        const period = ((((today - y)/1000)/60)/60)/24
        // console.log(period < req.body.interval)
        
        const x = new Date(tasks.date).toLocaleDateString()
        if(period <= req.body.interval){
           
            let obj = {
                num: i,
                _id: tasks._id,
                date: x,
                project: tasks.project,
                task: tasks.task,
                start_time: new Date(tasks.start_time).toLocaleTimeString(),
                end_time: new Date(tasks.end_time).toLocaleTimeString(),
                estimated_time: tasks.estimated_time,
                status: tasks.status
            }
            i += 1
            return obj
        }
    })
    console.log(task)
    if(task){
        res.send(task)

    }

})


router.patch("/task/approve", auth, async(req, res)=>{
    console.log(req.body.id)
    try{

       const task = await Task.findOne({_id: req.body.id})
       if(!task){
           res.redirect('/admin/admin_dash')
       }
       const data = {approved: true}
       const updates = Object.keys(data)
       updates.forEach((update)=>task[update]=data[update])
       await task.save()
       res.send(task)
     
    }catch(e){
       res.redirect('/admin/admin_dash')
    }

})

router.patch("/task/review", auth, async(req, res)=>{
    console.log(req.body)
    try{

       const task = await Task.findOne({_id: req.body.id})
       if(!task){
           res.redirect('/admin/admin_dash')
       }
       const data = {status:false, remark: req.body.remark}
       const updates = Object.keys(data)
       updates.forEach((update)=>task[update]=data[update])
       await task.save()
       res.send(task)
     
    }catch(e){
       res.redirect('/admin/admin_dash')
    }

})

module.exports = router