// const Auth0Strategy = require('passport-auth0');

// module.exports = (passport) => {
//   const strategy = new Auth0Strategy({
//     domain: 'your-auth0-domain',
//     clientID: 'your-client-id',
//     clientSecret: 'your-client-secret',
//     callbackURL: 'http://your-callback-url',
//   }, (accessToken, refreshToken, extraParams, profile, done) => {
//     // Use the profile information (e.g., profile.id) to create or find a user account
//     return done(null, profile);
//   });

//   passport.use(strategy);

//   passport.serializeUser((user, done) => {
//     done(null, user);
//   });

//   passport.deserializeUser((user, done) => {
//     done(null, user);
//   });
// };
