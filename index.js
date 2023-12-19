const mongoose = require('mongoose');
require("dotenv").config()
mongoose.connect(process.env.MONGO_URL)
.then((e)=>console.log('Mongo connected sucessfully'));
const express = require("express");
const app = express();

app .set('view engine','ejs');
app.set('views', './views/admin');
app.use(express.static('public'))
app.use(express.static(__dirname + "/public"))
app.use("/public", express.static("public", { "extensions":["js"]}));


app.use(express.static(__dirname + "/public"));
const userRoute = require('./router/userRoute');
app.use('/', userRoute);
const adminRoute = require("./router/adminRoute");
app.use('/admin',adminRoute)
 

app.listen(3002, function () {
  console.log("Server is running");
});

