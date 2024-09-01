const { S3 } = require("aws-sdk")

exports.s3Uploadv2 = async(file,tempFilename) => {
    
    const s3 = new S3()

    const params = {
        Bucket : process.env.AWS_BUCKET_NAME,
        Key : `uploads/${tempFilename}`,
        Body : file,
    }

    return await s3.upload(params).promise();
}