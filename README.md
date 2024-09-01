
# CSV Process Assignment

Build a system to efficiently process image data from CSV files.




## API Reference

#### Upload CSV File

```http
  POST /upload_file
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `file` | `File` | **Required**. CSV file |

#### Get File Status

```http
  GET /checkStatus/${id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Required**. Request Id |

#### Get File Download

```http
  GET /getFile/${id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Required**. Request Id |



## Postman API Workspace

`https://www.postman.com/material-astronaut-46130843/workspace/public-workspace/collection/26688143-b14f186d-a9b4-44e4-9860-9d439bd80e91?action=share&creator=26688143`
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file


`ANOTHER_API_KEY`

`AWS_ACCESS_KEY_ID`

`AWS_SECRET_ACCESS_KEY`

`AWS_BUCKET_NAME`

`AWS_REGION`

`MONGO_URI`

## Tech Stack

**Server:** Node, Express, RabbitMQ

**Database:** MongoDB, AWS S3

