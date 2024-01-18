// const passport = require('passport')
// const GoogleStrategy = require('passport-google-oauth2').Strategy
// const {handleAuth} = require('./authController')
// const {registerUser} = require('./registerController')
// const { client } = require('../config/dbConnection')

// const db = client.db('ITransitionPRJ');
// const usersCollection = db.collection('usersData');

// const GOOGLE_CLIENT_ID = "147436814396-ka7b04642v1dqtaqvnlr089olhetpk5s.apps.googleusercontent.com";
// const GOOGLE_CLIENT_SECRET = "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";

// const googleOauth = () => {
//     passport.use(new GoogleStrategy({
//         clientID:     GOOGLE_CLIENT_ID,
//         clientSecret: GOOGLE_CLIENT_SECRET,
//         callbackURL: "http://localhost:3000/googleauth",
//         passReqToCallback   : true
//       },
//   async function handleGoogleOAuth(profile, email, done) {
//     const foundUser = await usersCollection.findOne({ email });

//     if(foundUser) {
//         handleAuth({email, oAuth: 'google'})
//     }else {
//         registerUser({email, username: profile.displayName, oAuth: 'google'})
//     }
//     return done(null, profile);
//   }
//   ));
//     passport.serializeUser(function(user, done){
//     done(null, user)
//   })
  
// }
 
// module.exports = {googleOauth}