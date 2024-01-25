const {BlobServiceClient} = require("@azure/storage-blob")
require('dotenv').config();
const { client } = require('../config/dbConnection')
const { v4: uuidv4 } = require('uuid');

const db = client.db('ITransitionPRJ');
const collectionsData = db.collection('collections');
const usersData = db.collection('usersData');
const itemsData = db.collection('items');

const blobServiceClient = new BlobServiceClient(`https://itrprj.blob.core.windows.net/collections?sp=racwd&st=2024-01-12T11:22:07Z&se=2024-07-31T19:22:07Z&spr=https&sv=2022-11-02&sr=c&sig=9SvQVKBCgHShITy61KC%2FXNjZeaWuCqxkUQPqbnu%2FiFo%3D`);

async function extractMetadata(headers) {
  const contentType = headers['content-type'];
  const collectionId = headers['x-collection-id'];
  const targetIsMain = headers['x-collection-target'];
  const targetIsCollections = headers['x-item-target'];
  const fileTypeStr = contentType.split('/')[1];
  const fileType = fileTypeStr.split(', ')[0]
  return { fileType, collectionId, targetIsMain, targetIsCollections };
}

async function streamToBuffer(dataStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    dataStream.on('data', (chunk) => chunks.push(chunk));
    dataStream.on('end', () => resolve(Buffer.concat(chunks)));
    dataStream.on('error', reject);
  });
}

async function uploadImageStreamed(blobName, dataStream, collection) {
  const containerClient = blobServiceClient.getContainerClient(collection);

  const blobClient = containerClient.getBlockBlobClient(blobName);

  const buffer = await streamToBuffer(dataStream);

  let contentType;
  const lowerBlobName = blobName.toLowerCase();
  if (lowerBlobName.endsWith('.png')) {
    contentType = 'image/png';
  } else if (lowerBlobName.endsWith('.jpeg') || lowerBlobName.endsWith('.jpg')) {
    contentType = 'image/jpeg';
  } else {
    contentType = 'image/png';
  }

  await blobClient.uploadData(buffer, { contentType });

  return blobClient.url;
}


  async function handleImageUpload(req, res) {
    res.setHeader('Content-Type', 'application/json');
    if (req.originalUrl === '/collections/image/upload' && req.method === 'POST') {
      let imageUrl = ''
      try {
        const { fileType, collectionId, targetIsMain, targetIsCollections } = await extractMetadata(req.headers);
        const generatedUUID = uuidv4()
        const imageName = `${generatedUUID + '.' + fileType}`


        if(!collectionId && targetIsMain === "main_images") {
          imageUrl = await uploadImageStreamed(imageName, req, 'main_images')

        }else if (collectionId && targetIsMain === "main_images") {
          imageUrl = await uploadImageStreamed(imageName, req, 'main_images')

          await collectionsData.updateOne(
            { id: collectionId },
            { $set: { image: imageUrl } }
          )

        }else if (targetIsCollections) {
          imageUrl = await uploadImageStreamed(imageName, req, targetIsCollections)
        }


        res.writeHead(201);
        res.end(JSON.stringify({ imageUrl, imageName }));
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
      const imageName = req.body.imageName;
      const targetIsCollections = req.headers["x-collection-target"]
      const targetIsItems = req.headers["x-item-target"]


      if (targetIsItems && imageName) {
        const containerClient = blobServiceClient.getContainerClient(targetIsItems)
        const blobClient = containerClient.getBlockBlobClient(imageName)

        await blobClient.delete();

      } else if (targetIsCollections && targetIsCollections !== "add collection" && imageName) {
        const containerClient = blobServiceClient.getContainerClient('main_images')
        const blobClient = containerClient.getBlockBlobClient(imageName)

        await blobClient.delete();

        await collectionsData.updateOne(
          { id: targetIsCollections },
          { $set: { image: '' } }
        )
      } else if (targetIsCollections === "add collection" && imageName) {
        const containerClient = blobServiceClient.getContainerClient('main_images')
        const blobClient = containerClient.getBlockBlobClient(imageName)

        await blobClient.delete();
      }
      
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