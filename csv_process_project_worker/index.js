require("dotenv").config()
const csv = require("fast-csv");
const connectToMongo = require("./db");
var amqp = require("amqplib/callback_api");
const { S3 } = require("aws-sdk")

connectToMongo();

const Products = require("./models/products");
const FileStatus = require("./models/fileStatus")
const { Readable } = require("stream");
const { s3Uploadv2 } = require("./s3Service");
const s3 = new S3()

amqp.connect("amqp://localhost", function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = "test-queue-1";

    channel.assertQueue(queue, {
      durable: false,
    });

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    channel.consume(queue, async function (msg) {

        let params = {
            Bucket : process.env.AWS_BUCKET_NAME,
            Key : `uploads/${msg.content.toString()}`,
        }

        await FileStatus.findOneAndUpdate({InputName : msg.content.toString()},{Status : "Worker Assigned"});

        s3.getObject(params, async(err, data) => {
            let bufs = []
            const csvStream = csv.format({headers : ['S. No','Product Name','Input Image Urls','Output Image Urls']})
            csvStream.on("data", function(data){
                bufs.push(data)
            }).on("end", async function(){
                let buf = Buffer.concat(bufs)
                let filename = msg.content.toString();
                let tempLen = filename.length
                let newFilename = filename.slice(0,tempLen-4) + "-output" + filename.slice(tempLen-4,tempLen)
                let result = await s3Uploadv2(buf,newFilename);
                await FileStatus.findOneAndUpdate({InputName : msg.content.toString()},{Status : "Processed"});
                console.log(result)
            }).on("error", function(err){
                console.log(err)
            })
            if(err){
                console.log(err)
            }else{
                const fileDataStream = Readable.from(data.Body)
                
                fileDataStream.pipe(csv.parse({headers : true}))
                .on('error', error => console.log(error))
                .on('data', async(row) =>{
                    let myArray = row["Input Image Urls"].split(",")
                    let myArrayLen = myArray.length
                    let completeArrayStr = ""
                    for(let i = 0; i < myArrayLen; ++i){
                        let tempLen = myArray[i].length
                        let tempStr1 = myArray[i].slice(0,24)
                        let tempStr2 = myArray[i].slice(24,tempLen);
                        let completeStr = tempStr1 + "-output" + tempStr2
                        if(completeArrayStr === ""){completeArrayStr = completeStr}
                        else{completeArrayStr = completeArrayStr + "," + completeStr}
                    }
                    csvStream.write([row["S. No"],row["Product Name"],row["Input Image Urls"],completeArrayStr])
                    let newProduct = new Products({
                        "S. No" : row["S. No"],
                        "Product Name" : row["Product Name"],
                        "Input Image Urls" : row["Input Image Urls"],
                        "Output Image Urls" : completeArrayStr
                    })
                    await newProduct.save();
                })
                .on('end', rowCount =>{
                    console.log(`Parsed ${rowCount} rows`)
                    csvStream.end();
                })
            }
        })
    },
    {
        noAck: true,
    }
    );
  });
});

