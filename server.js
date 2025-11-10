const express=require('express');
const mongoose= require('mongoose');
const bodyParser= require('body-parser');
const router= require('./Routes/routes');
const cors = require('cors');
const app= express();
const port=3000;
const url="mongodb://mongo-db:27017/dataSyncTask"; //"mongodb://localhost:27017/dataSyncTask";
const reminderQueue = require('./Jobs/queues/reminderQueues');

app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}));
app.use('/uploads', express.static('uploads'));

mongoose.connect(url).then((res)=>{
    console.log("Db connected successfully")
})
.catch((err)=>{
    console.log("there is error")
})

app.use('/',router)
app.get('/test-job', async (req, res) => {
    console.log("adding job-->>")
  await reminderQueue.add('test-job', { alertId: '671be1275aa3f5cf24b4e31c', userId: 'u1' });
  console.log("done job:)")
 return res.send('Job added to queue');
});
// app.listen(port,()=>{
//     console.log("server is running on port 3000")
// })

app.listen(port, '0.0.0.0', () => {
  console.log("server is running on port 3000");
});

