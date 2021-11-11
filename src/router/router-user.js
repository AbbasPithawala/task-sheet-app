const User = require('../models/model-user')
const Task = require('../models/model-task')
const express = require('express')
const router = express.Router()
const session = require('express-session')
const auth = require('../middleware/auth')
const popup = require('node-popup')

router.get('/', (req, res)=>{
    res.render('admin_regis', {
        title: 'Admin Registeration'
    })
})
router.get('/user/register', (req, res)=>{
    if(req.session.adminID){
        res.render('register', {
            title: "Register"
        })
    }else{
        res.redirect('/user')
    }
})

router.get("/user/edit_profile", auth, async (req, res)=>{
    if(req.session.userID){
        const user = await User.findOne({_id: req.session.userID}) 
        res.render("edit_profile", {user: user})
    }else{
        res.redirect('/user')
    }
})

router.post("/user/edit", auth, async (req, res)=>{
    if(req.session.userID){
        console.log(req.body)
        const user = await User.findOne({_id: req.session.userID})
        const data = req.body
        const updates = Object.keys(data)
        updates.forEach((update) => user[update] = data[update])
        await user.save()
        res.send("user profile updated")
    }else{
        res.redirect("/user")
    }
})

router.post('/user', async (req, res)=>{
    //console.log("dbfsdmn")
    //console.log(req.body)
    const user = new User(req.body)
    console.log(user)
    try{
          
        const token = await user.generateAuthToken()
        await user.save()
        var msg = 'User register successfull'
        console.log(msg)
        
    }catch(e){
        var msg = 'User register not successfull'
        console.log(msg)
        // res.render('/user/register')
    }
    
})

router.post('/admin', async (req, res)=>{
    //console.log("dbfsdmn")
    //console.log(req.body)
    const user = new User(req.body)
    console.log(user)
    try{
          
        const token = await user.generateAuthToken()
        user.user_type = 1
        await user.save()
        var msg = 'User register successfull'
        console.log(msg)
         res.redirect('/')
    }catch(e){
        var msg = 'User register not successfull'
        console.log(msg)
        res.render('/')
    }
    
})

router.get('/user', async (req, res)=>{
    res.render('login', {
        title: "Login"
    })
})

router.post('/user/login', async (req, res)=>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        //console.log(user)
        const token = await user.generateAuthToken()
        if(user.user_type === 1){
            req.session.adminID = user._id
            req.session.tokenId = token
            req.session.save()
            res.redirect('/admin/admin_dash')
        }else if(user.user_type === 0 && user.status===true){
            req.session.userID = user._id
            req.session.tokenId = token
            req.session.save()
            res.redirect('/user/dashboard')
        }else{
            res.redirect('/user')
        }
    }catch(e){
        res.redirect('/user')
    }
})

router.get('/user/dashboard', async (req, res)=>{
    if(req.session.userID){
        const id = req.session.userID
        var allTasks = await Task.find({owner: id}).sort({date: "descending"})
        let i = 1

        allTasks =  allTasks.map((d)=>{ 
            const x = new Date(d.start_time).toLocaleTimeString()
            const y = new Date(d.date).toLocaleDateString()
            if(d.end_time){
                var z = new Date(d.end_time).toLocaleTimeString()
                var est = d.estimated_time.toFixed(2)
            }else{
                var z =  false
                var est = false
            }
            let obj = {
                num: i,
                date: y,
                status: d.status,
                _id: d._id,
                project: d.project,
                task: d.task,
                end_time: z,
                estimated_time: est,
                start_time: x,
                old_start_time: d.start_time,
                approved: d.approved          

            }
            i += 1
            return obj

        })
        //console.log(allTasks)
        //alert('Hello World!');
        res.render('dashboard', {tasks: allTasks})
    }else{
        res.redirect('/user')
    }
})


router.get('/admin/admin_dash', auth, async (req, res)=>{
    if(req.session.adminID){
        var users = await User.find({user_type: 0})
        users = users.map((d)=>{
            let obj = {
                _id: d._id,
                name: d.name
            }
            return obj
        })


        res.render('admin_dash', {users: users})
    }else{
        res.redirect('/user')
    }
    
})

router.get("/user/fetch_employee", auth, async (req, res)=>{
    if(req.session.adminID){
        var users = await User.find({user_type: 0})
        var num = 1
        users = users.map((d)=>{
            let obj =  {
                num: num,
                _id: d._id,
                name: d.name,
                status: d.status
            }
            num += 1
            return obj
        })
        res.render('manage_employee',{users: users})
    }else{
        res.redirect('/user')
    }
})

router.patch("/user/deactivate", auth, async(req, res)=>{
    //console.log(req.body)
    if(req.session.adminID){
        try{
        var user = await User.findOne({_id: req.body.id})
            if(req.body.command == 0){
                const data = {status: false}
                const updates = Object.keys(data)
                updates.forEach((update)=>user[update]=data[update])
                await user.save()
                res.send(user)
            }else{
                const data = {status: true}
                const updates = Object.keys(data)
                updates.forEach((update)=>user[update]=data[update])
                await user.save()
                res.send(user) 
            }
        }catch(e){
            res.redirect("/user/fetch_employee")
        }        
    }else{
        res.redirect('/user')
    }
})

// router.get('/user/logout', auth, async (req, res)=>{
//     try{
//         req.user.tokens = req.user.tokens.filter((token)=>{
//             return token.token != req.token
            
//         })

//         req.session.destroy(function(err) {
//             if(err){
//                 res.redirect('/user')
//             }
//           })
//         await req.user.save()
      
//         res.redirect('/user')
//     }catch(e){
//         res.redirect('/user')
//     }

// })

router.get('/user/logoutAll', auth,  async (req, res)=>{
    try{
        req.user.tokens = []
        req.session.destroy(function(err) {
            if(err){
                res.redirect('/user')
            }
          })
        await req.user.save()
        res.redirect('/user')
    }catch(e){
        res.redirect('/user')
    }
})




module.exports = router 