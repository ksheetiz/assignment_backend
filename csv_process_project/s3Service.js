const { S3 } = require("aws-sdk")

const s3 = new S3()

exports.s3Uploadv2 = async(file,tempFilename) => {

    const params = {
        Bucket : process.env.AWS_BUCKET_NAME,
        Key : `uploads/${tempFilename}`,
        Body : file.buffer,
    }

    return await s3.upload(params).promise();
}

exports.getFileFromS3 = async(fileName) => {
    let params = {
        Bucket : process.env.AWS_BUCKET_NAME,
        Key : `uploads/${fileName}`,
    }

    return s3.getObject(params).createReadStream();
}