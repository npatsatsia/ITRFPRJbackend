const {BlobServiceClient} = require("@azure/storage-blob")
require('dotenv').config();
const { client } = require('../config/dbConnection')
const { v4: uuidv4 } = require('uuid');

const db = client.db('ITransitionPRJ');
const collectionsData = db.collection('collections');

const blobServiceClient = new BlobServiceClient(`https://itrprj.blob.core.windows.net/collections?sp=racwd&st=2024-01-12T11:22:07Z&se=2024-07-31T19:22:07Z&spr=https&sv=2022-11-02&sr=c&sig=9SvQVKBCgHShITy61KC%2FXNjZeaWuCqxkUQPqbnu%2FiFo%3D`);


async function extractMetadata(headers) {
  const contentType = headers['content-type'];
  const fileTypeStr = contentType.split('/')[1];
  const fileType = fileTypeStr.split(', ')[0]
  return { fileType };
}

async function streamToBuffer(dataStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    dataStream.on('data', (chunk) => chunks.push(chunk));
    dataStream.on('end', () => resolve(Buffer.concat(chunks)));
    dataStream.on('error', reject);
  });
}

async function uploadImageStreamed(blobName, dataStream, exitingCollectionName) {
    const containerClient = blobServiceClient.getContainerClient(exitingCollectionName);
  
    const blobClient = containerClient.getBlockBlobClient(blobName);
    
    const buffer = await streamToBuffer(dataStream);
    
    await blobClient.uploadData(buffer, { contentType: 'image/png' });
    
    return blobClient.url;
  }

  async function handleImageUpload(req, res) {
    res.setHeader('Content-Type', 'application/json');
    if (req.originalUrl === '/collections/image/upload' && req.method === 'POST') {
      try {
        const { fileType } = await extractMetadata(req.headers);
        const generatedUUID = uuidv4()
        const imageName = `${generatedUUID + '.' + fileType}`
        const imageUrl = req.body.collectionId? await uploadImageStreamed(imageName, req, req.body.collectionId) : await uploadImageStreamed(imageName, req, generatedUUID);
        
        res.writeHead(201);
        res.end(JSON.stringify({ imageUrl }));
      } catch (error) {
        console.error('Error:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not Found' }));
    }
  }


async function handleImageDelete(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.originalUrl === '/collections/image/delete' && req.method === 'POST') {
    try {
      const url = req.body.url;
      const blobName = url.substring(url.lastIndexOf('/') + 1).split('?')[0];

      const blobClient = containerClient.getBlockBlobClient(blobName);
      await blobClient.delete();
      
      res.writeHead(200);
      res.end(JSON.stringify({ message: 'File deleted successfully' }));
    } catch (error) {
      console.error('Error:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
}



module.exports = {handleImageUpload, handleImageDelete}