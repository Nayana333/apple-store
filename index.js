const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/Applestore");
const express = require("express");
const app = express();


app.use(express.static(__dirname + "/public"));
// Import and use the user route
const userRoute = require('./router/userRoute');
app.use('/', userRoute);
const adminRoute = require("./router/adminRoute");
app.use('/admin',adminRoute)
 

app.listen(3002, function () {
  console.log("Server is running");
});
