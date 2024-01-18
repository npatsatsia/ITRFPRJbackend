require('dotenv').config();
const path = require('path')
const express = require('express')
const app = express()
const http = require('http');
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const { logger } = require('./middleware/logEvents')
const credentials = require('./middleware/credentials')
const errorHandler = require('./middleware/errorHandler')
const verifyJWT = require('./middleware/verifyJWT')
const cookieParser = require('cookie-parser')
const {runMDB, client} = require('./config/dbConnection')
const { setupWebSocket } = require('./config/websocket');


const PORT = process.env.PORT || 3500

const server = http.createServer(app);

app.use(logger)
app.use(credentials)
app.use(cors(corsOptions))
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser())

app.use('/', require('./routes/root'))
app.use('/register', require('./routes/register'))
app.use('/login', require('./routes/auth'))
app.use('/refresh', require('./routes/refreshToken'))
app.use('/logout', require('./routes/logout'))
app.use('/categories', require('./routes/api/categories'))

app.use(verifyJWT)
app.use('/users', require('./routes/api/management'))

app.use('/collections', require('./routes/api/collections'))
app.use('/collections/items', require('./routes/api/items'))
app.use('/collections/image', require('./routes/api/image'))

setupWebSocket(server);


app.all('*', (req, res) => {
    res.status(404)
    if(req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    }else if(req.accepts('json')) {
        res.json({error: "404 not found"})
    }else {
        res.type('txt').send('404 not found')
    }
    
})

app.use(errorHandler)

process.on('SIGINT', async () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  await client.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  await client.close();
  process.exit(0);
});

process.on('SIGUSR2', async () => {
  console.log('Received SIGUSR2. Shutting down gracefully...');
  await client.close();
  process.exit(0);
});

const startServer = async () => {
  await runMDB();
  app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
  });
};

startServer();


// const http = require('http');
// const { BlobServiceClient } = require('@azure/storage-blob');
// const { MongoClient } = require('mongodb');
// require('dotenv').config();
// const express = require('express');
// const app = express();
// // const streamToBuffer = require('stream-to-buffer');
// const cors = require('cors');
// const { corsOptions } = require('./config/corsOptions'); // Assuming you have corsOptions defined in 'config/corsOptions'

// // Load in environment variables
// const mongodbUri = "mongodb+srv://npatsatsia1:180897Pat$0@arch.dsnfjjv.mongodb.net/?retryWrites=true&w=majority";
// const accountName = process.env.ACCOUNT_NAME;
// const sasToken = "sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2024-01-12T00:11:48Z&st=2024-01-11T16:11:48Z&spr=https&sig=iCqvujQ%2BlZmGY0KLbDSYOuHRAyfytGUHM%2FZlDOVVSmY%3D";
// const containerName = process.env.CONTAINER_NAME;

// // Establishes a connection with Azure Blob Storage
// const blobServiceClient = new BlobServiceClient(`https://itrprj.blob.core.windows.net/collections?sp=racwd&st=2024-01-12T11:22:07Z&se=2024-07-31T19:22:07Z&spr=https&sv=2022-11-02&sr=c&sig=9SvQVKBCgHShITy61KC%2FXNjZeaWuCqxkUQPqbnu%2FiFo%3D`);
// const containerClient = blobServiceClient.getContainerClient(containerName);

// // Connect to MongoDB
// const client = new MongoClient(mongodbUri); 
// client.connect();

// async function extractMetadata(headers) {
//   const contentType = headers['content-type'];
//   const fileType = contentType.split('/')[1];
//   const contentDisposition = headers['content-disposition'] || '';
//   const caption = headers['x-image-caption'] || 'No caption provided';
//   const matches = /filename="([^"]+)"/i.exec(contentDisposition);
//   const fileName = matches?.[1] || `image-${Date.now()}.${fileType}`;
//   return { fileName, caption, fileType };
// }

// // async function uploadImageStreamed(blobName, dataStream) {
// //   console.log(dataStream)
// //   const blobClient = containerClient.getBlockBlobClient(blobName);
// //   await blobClient.uploadStream(dataStream);
// //   return blobClient.url;
// // }

// async function streamToBuffer(dataStream) {
//   return new Promise((resolve, reject) => {
//     const chunks = [];
//     dataStream.on('data', (chunk) => chunks.push(chunk));
//     dataStream.on('end', () => resolve(Buffer.concat(chunks)));
//     dataStream.on('error', reject);
//   });
// }

// async function uploadImageStreamed(blobName, dataStream) {
//   const blobClient = containerClient.getBlockBlobClient(blobName);

//   // Convert the dataStream to a buffer
//   const buffer = await streamToBuffer(dataStream);
//   // console.log(buffer)

//   // Upload the image to Azure Blob Storage with the correct content type
//   await blobClient.uploadData(buffer, { contentType: 'image/png' });

//   return blobClient.url;
// }

// async function storeMetadata(name, caption, fileType, imageUrl) {
//   const collection = client.db("ITransitionPRJ").collection('items');
//   await collection.insertOne({ name, caption, fileType, imageUrl });
// }

// async function handleImageUpload(req, res) {
//   console.log(req.headers)
//   res.setHeader('Content-Type', 'application/json');
//   if (req.url === '/collections' && req.method === 'POST') {
//     try {
//       // Extract metadata from headers
//       const { fileName, caption, fileType } = await extractMetadata(req.headers);
//       // Upload the image as a to Azure Storage Blob as a stream
//       const imageUrl = await uploadImageStreamed(fileName, req);


//       // Store the metadata in MongoDB
//       await storeMetadata(fileName, caption, fileType, imageUrl);

//       res.writeHead(201);
//       res.end(JSON.stringify({ message: 'Image uploaded and metadata stored successfully', imageUrl }));
//     } catch (error) {
//       console.error('Error:', error);
//       res.writeHead(500);
//       res.end(JSON.stringify({ error: 'Internal Server Error' }));
//     }
//   } else {
//     res.writeHead(404);
//     res.end(JSON.stringify({ error: 'Not Found' }));
//   }
// }

// // CORS setup
// app.use(cors(corsOptions));

// // Handle image upload
// app.post('/collections', handleImageUpload);

// const port = 3500;
// const server = http.createServer(app);
// server.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// })
