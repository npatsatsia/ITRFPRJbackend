
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://npatsatsia1:180897Pat$0@arch.dsnfjjv.mongodb.net/?retryWrites=true&w=majority";
const express = require('express')
const app = express()
const PORT = process.env.PORT || 4000


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const runMDB = async () => {
  try {
    await client.connect();

    await client.db("admin").command({ ping: 1 });
    
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    await client.close();
  }
}



module.exports = { runMDB, client }