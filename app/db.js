const mongoose   = require('mongoose')
const config     = require('./config')
const db 		 = mongoose.connection

function connect() {
  mongoose.connect(config.DB, { auto_reconnect: true, useNewUrlParser: true, useFindAndModify: false })
    .catch((e) => {console.log(e)});
}

db.on('connecting', () => {
  console.info('Connecting to MongoDB...');
});

db.on('error', (error) => {
  console.error(`MongoDB connection error: ${error}`);
  mongoose.disconnect();
});

db.on('connected', () => {
  console.info('Connected to MongoDB.');
});

db.once('open', () => {
  //console.info('MongoDB connection opened!');
});

db.on('reconnected', () => {
  console.info('MongoDB reconnected.');
});

db.on('disconnected', () => {
  console.error(`MongoDB disconnected! Reconnecting in ${config.TIMEOUT / 1000}s...`);
  setTimeout(() => connect(), config.TIMEOUT);
});

module.exports = {
    DB: db,
    connect: connect
}
