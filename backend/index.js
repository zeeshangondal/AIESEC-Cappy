const express = require("express");
const mongoose = require("mongoose")
const app = express();
const path = require('path');

app.use(express.json())
require("dotenv").config();
const cors = require("cors")

const userRouter = require("./Routes/userRoutes");
const epRouter = require("./Routes/epRoutes");

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

// app.use(express.static(path.join(__dirname,'public')));
// app.use("/files",express.static('public/uploads'));

app.use( '/user', userRouter)
app.use( '/ep', epRouter)


app.get('*' , (req,res)=>{
    res.sendFile(path.join(__dirname,'public','index.html'))
})


// app.post("/upload",upload,(req,res)=>{
//     console.log(req.body.file)
//     res.send("Upload")
// })


app.listen(process.env.PORT||3005 , ()=>{
    console.log(`App Listning at Port 3005`)
})


mongoose.connect(process.env.DB_URL).then(err=>{
        console.log("Connected")
})