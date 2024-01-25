
const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express')


const client = new MongoClient(process.env.MONGODB_URI, {
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