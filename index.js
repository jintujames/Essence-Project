const express = require('express');

const app = express();
 
const mongoose = require('mongoose');
// mongoose.connect('mongodb://127.0.0.1:27017/Lancome');


const url='mongodb+srv://jintujames444:refreshing@cluster0.bhbg5kr.mongodb.net/Essence?retryWrites=true&w=majority'
const dbConnect=async(req,res)=>{
    try {
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            ssl: true,
            tlsAllowInvalidCertificates: true,
        });
        
        console.log('db connected');
    } catch (error) {
        console.log('mongo db connection error', error);
    }
}

dbConnect()



const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');

app.use(express.static('public'));
app.use('/',userRoute);

app.use('/admin',adminRoute);

app.listen(2001, () => {
    console.log('server started');

})

