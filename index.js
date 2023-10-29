const express = require('express');

const app = express();
const mongoose = require('mongoose');

// MongoDB connection URI
const url = 'mongodb+srv://jintujames444:refreshing@cluster0.bhbg5kr.mongodb.net/Essence?retryWrites=true&w=majority';

const dbConnect = async () => {
    try {
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
           // You can remove this line, as it's not necessary in recent versions of Mongoose.
            tlsAllowInvalidCertificates: true,  // Use this for testing with self-signed certificates.
        });

        console.log('db connected');
    } catch (error) {
        console.log('mongo db connection error', error);
    }
}

dbConnect();




const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');

app.use(express.static('public'));
app.use('/',userRoute);

app.use('/admin',adminRoute);

app.listen(2001, () => {
    console.log('server started');
})