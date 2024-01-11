require('dotenv').config();
const path = require('path')
const express = require('express')
const app = express()
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const { logger } = require('./middleware/logEvents')
const credentials = require('./middleware/credentials')
const errorHandler = require('./middleware/errorHandler')
const verifyJWT = require('./middleware/verifyJWT')
const cookieParser = require('cookie-parser')
const {runMDB, client} = require('./config/dbConnection')

const PORT = process.env.PORT || 3500

app.use(logger)

app.use(credentials)

app.use(cors(corsOptions))

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(cookieParser())

app.use('/', require('./routes/root'))
app.use('/register', require('./routes/register'))
app.use('/auth', require('./routes/auth'))
app.use('/refresh', require('./routes/refreshToken'))
app.use('/logout', require('./routes/logout'))

app.use(verifyJWT)
app.use('/users', require('./routes/api/management'))

app.use('/collections/options', require('./routes/api/collections'))
app.use('/collections/items', require('./routes/api/items'))

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