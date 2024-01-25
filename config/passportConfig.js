const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const passport = require('passport')
const { client } = require('./dbConnection')
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken')

const db = client.db('ITransitionPRJ');
const usersCollection = db.collection('usersData');

function isLoggedin (req, res, next) {
    // req.profile? next() : res.status(401)
    console.log("logged in")
}

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "https://itrabackend-0a797af92f8e.herokuapp.com/auth/github/callback",
    scope: ['user:email', 'read:user'],
    passReqToCallback: true
  },
  async function(request, accessjwt, refreshjwt, profile, done) {
    await client.connect();

    const email = profile.emails[0].value

    if (!email) {
        return done(null, false, {
          error: 'EmailNotAvailable',
          message: 'User email not provided. Please grant access to your email during authentication.'
        });
    }

    const foundUser = await usersCollection.findOne({ email: email })

    if (foundUser && foundUser.active && foundUser.googleId) {
        const result = await usersCollection.updateOne(
            { email: email },
            { $set: { githubId: profile.id } }
        );
    } else if(foundUser && !foundUser.active) {
            return done(null, false, {
                error: 'AccountBlocked',
                message: 'Your account has been blocked. Please contact admin for assistance.'
            });
    } else if(!foundUser){
        const newUser = {
            userId: uuidv4(),
            githubId: profile.id,
            username: profile.username.toLowerCase(),
            email: email,
            role: '2001',
            active: true
          };
          const result = await usersCollection.insertOne(newUser);
    }

    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "email": email,
                "role": "2001"
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
        { "email": email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
    );
    await usersCollection.updateOne(
        { email: email },
        { $set: { refreshToken: refreshToken } }
    );


    function setCookies(request, refreshToken) {
        request.res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
    } // maybe we need this:  secure: true,
    setCookies(request, refreshToken);
    done(null, { role: "2001", accessToken, username: profile.username });
  }
));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://itrabackend-0a797af92f8e.herokuapp.com/auth/google/callback",
    passReqToCallback: true
  },
  async function(request, accessjwt, refreshjwt, profile, done) {
    await client.connect();
    const email = profile.email || profile._json.email;

    const foundUser = await usersCollection.findOne({ email: email })
    if (foundUser && foundUser.active && foundUser.githubId) {
        const result = await usersCollection.updateOne(
            { email: email },
            { $set: { googleId: profile.id } }
        );
    }else if(foundUser && !foundUser.active) {
        return done(null, false, {
            error: 'AccountBlocked',
            message: 'Your account has been blocked. Please contact admin for assistance.'
        })
    } else if(!foundUser){
        const newUser = {
            googleId: profile.id,
            userId: uuidv4(),
            username: profile.displayName.toLowerCase(),
            email: email,
            role: '2001',
            active: true
          };
          const result = await usersCollection.insertOne(newUser);
    }

    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "email": email,
                "role": "2001"
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
        { "email": email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
    );
    await usersCollection.updateOne(
        { email: email },
        { $set: { refreshToken: refreshToken } }
    );


    function setCookies(request, refreshToken) {
        request.res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
    } // maybe we need this:  secure: true,
    setCookies(request, refreshToken);
    done(null, { role: "2001", accessToken, username: profile.displayName });
  }
));


passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

  module.exports = {isLoggedin}