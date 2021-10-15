const express = require('express')
const userRouter = require('./router/router-user')
const taskRouter = require('./router/router-task')
require('./db/mongoose')
const session  = require('express-session')

const path = require('path')
const hbs = require('hbs')
const app = express()
const port = process.env.PORT

const publicPathDirectory = path.join(__dirname, '../public')
const viewPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: false}))
app.use(session({
    secret: 'Abbas0987',
    resave: false,
    saveUninitialized: true,
  }))
app.set('views', viewPath)
app.use(express.static(publicPathDirectory))
hbs.registerPartials(partialsPath)

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)




app.listen(port, ()=>{
    console.log("Server is running on port " + port)
}) 