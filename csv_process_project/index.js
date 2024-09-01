require("dotenv").config()
const express = require("express");
var cors = require("cors");
var amqp = require('amqplib/callback_api');

const multer  = require('multer');
const { s3Uploadv2, getFileFromS3} = require("./s3Service");
const FileStatus = require("./models/fileStatus");
const connectToMongo = require("./db");

const upload = multer({})


const app = express();
const port = 5000;

var globalChannel, globalConnection;  //global variables
connectQueue()
connectToMongo();

app.use(cors());
app.use(express.json());

//Available Routes

app.post("/upload_file", upload.single('file'), async(req, res) => {
    try{
        var tempFilename = Date.now() + '-' + Math.round(Math.random() * 1e9) + '-' + req.file.originalname;
        const result = await s3Uploadv2(req.file, tempFilename)
        
        console.log(result)

        await globalChannel.sendToQueue("test-queue-1", Buffer.from(tempFilename))

        let tempLen = tempFilename.length
        let newFilename = tempFilename.slice(0,tempLen-4) + "-output" + tempFilename.slice(tempLen-4,tempLen)
        let fileStat = new FileStatus({
            'InputName' : tempFilename,
            'OutputName' : newFilename,
            'Status' : "pending"
        })
        let fileResult = await fileStat.save()

        res.json({req_id : fileResult._id})
    }catch(err) {
        console.log(err)
        res.status(400).send({error : "Server Error"})
    }
})

app.get("/checkStatus/:id",async(req, res) => {
    try{
        let fileStat = await FileStatus.findById(req.params.id)

        res.status(200).send({status : fileStat.Status})
    }catch(err){
        console.log(err)
        res.status(400).send({error : "Server Error"})
    }
})

app.get("/getFile/:id", async(req, res) => {
    try{
        let fileStat = await FileStatus.findById(req.params.id)

        if(fileStat.Status === "Processed"){
            let fileToSend = await getFileFromS3(fileStat.OutputName)
            fileToSend.pipe(res);
        }
    }catch(err){
        console.log(err)
        res.status(400).send({error : "Server Error"})
    }
})

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`CSV Processing app listening on port ${port}`);
});

//Helper Functions

async function connectQueue() {
    try {
        amqp.connect('amqp://localhost', function(error0, connection) {
            if (error0) {
              throw error0;
            }
            globalConnection = connection
            connection.createChannel(function(error1, channel) {
              if (error1) {
                throw error1;
              }
              let queue = "test-queue-1"
              channel.assertQueue(queue, {
                durable: false
              });

              globalChannel = channel
            });
        });
        
    } catch (error) {
        console.log(error)
    }
}