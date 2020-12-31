require('dotenv').config();
let express = require('express');
let app = express();
let http = require('http').Server(app);
let path = require('path');
const usersRouter = require('./routes/usersRouter');
const mongoose = require('mongoose');
const expressSession = require('express-session');
const { ExpressOIDC } = require('@okta/oidc-middleware');
const url = require('url');
var okta = require("@okta/okta-sdk-nodejs");

const fields = [
  { name: 'username', label: 'Username' },
  { name: 'password', label: 'Password', type: 'password' }
];

var oktaClient = new okta.Client({
  orgUrl: '{yourOktaOrgUrl}',
  token: '{yourOktaToken}'
});
const oidc = new ExpressOIDC({
  appBaseUrl: process.env.HOST_URL,
  issuer: `${process.env.OKTA_ORG_URL}/oauth2/default`,
  client_id: process.env.OKTA_CLIENT_ID,
  client_secret: process.env.OKTA_CLIENT_SECRET,
  redirect_uri: `${process.env.HOST_URL}/authorization-code/callback`,
  scope: 'openid profile email',
  routes: {
    login: {
      viewHandler: (req, res) => {
        const baseUrl = url.parse(process.env.ISSUER).protocol + '//' + url.parse(process.env.ISSUER).host;
        // Render your custom login page, you must create this view for your application and use the Okta Sign-In Widget
        res.render('custom-login', {
          csrfToken: req.csrfToken(),
          baseUrl: baseUrl,
          fields,
          clientId: process.env.OKTA_CLIENT_ID,
          redirectUri: `${process.env.HOST_URL}/authorization-code/callback`,
          issuer: `${process.env.OKTA_ORG_URL}/oauth2/default`
        });
      }
    }
  }
});

const uri = `mongodb+srv://main-user:${process.env.mongodbPass}@cluster0.bgfyf.mongodb.net/development?retryWrites=true&w=majority`;
const PORT = process.env.PORT || 6969;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', function() {
  console.log('connection with db established')
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(expressSession({
    secret: process.env.APP_SECRET,
    resave: false,
    saveUninitialized: true
  })
);
app.use(oidc.router);
app.use((req, res, next) => {
  if (!req.userinfo) {
    return next();
  }
  oktaClient.getUser(req.userinfo.sub)
    .then(user => {
      req.user = user;
      res.locals.user = user;
      next();
    }).catch(err => {
      next(err);
    });
});
function loginRequired(req, res, next) {
  if (!req.user) {
    return res.status(401).render("unauthenticated");
  }
  next();
}

app.use('/register', require('./routes/register'));
app.use('/', require('./routes/index'));

app.use('/users', usersRouter);

http.listen(PORT, () => {
    console.log('listening on', + PORT);
})