// getting-started.js
const mongoose = require('mongoose');

connectToMongo().catch(err => console.log(err));

async function connectToMongo() {
  await mongoose.connect(process.env.MONGO_URI);
}

module.exports = connectToMongo;