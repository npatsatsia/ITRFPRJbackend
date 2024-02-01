require('dotenv').config();
const path = require('path')
const express = require('express')
const session = require('express-session');
const app = express()
const http = require('http');
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const sessionOptions = require('./config/sessionOptions')
const { logger } = require('./middleware/logEvents')
const credentials = require('./middleware/credentials')
const errorHandler = require('./middleware/errorHandler')
const verifyJWT = require('./middleware/verifyJWT')
const cookieParser = require('cookie-parser')
const {runMDB, client} = require('./config/dbConnection')
const { setupWebSocket } = require('./config/websocket');
const passport = require('passport')


const PORT = process.env.PORT || 3500

// const server = http.createServer(app);

app.use(logger)

app.use(session(sessionOptions));

app.use(passport.initialize())
app.use(passport.session())

app.use(credentials)
app.use(cors(corsOptions))
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser())



app.use('/', require('./routes/root'))
app.use('/register', require('./routes/register'))
app.use('/login', require('./routes/login'))
app.use('/auth', require('./routes/api/socialAuth'))
app.use('/refresh', require('./routes/refreshToken'))
app.use('/logout', require('./routes/logout'))
app.use('/categories', require('./routes/api/categories'))
app.use('/collection', require('./routes/api/singleCollection'))

app.use(verifyJWT)
app.use('/users', require('./routes/api/management'))

app.use('/collections', require('./routes/api/collections'))
app.use('/items', require('./routes/api/items'))
app.use('/collections/image', require('./routes/api/image'))
app.use('/tags', require('./routes/api/tags'))

// setupWebSocket(server);


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