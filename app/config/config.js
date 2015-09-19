'use strict';

exports.port = process.env.PORT || 8000;
exports.env = process.env.NODE_ENV || 'dev';
exports.mongodb = {
  //uri: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost:27017/pd',
  uri: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'localhost/pd'
};
exports.solr = {
	port: '8080'
};

exports.companyName = 'Punditly, Inc.';
exports.projectName = 'Punditly';
exports.systemEmail = '';
exports.cryptoKey = 'Pund1Tly$';
exports.loginAttempts = {
  forIp: 50,
  forIpAndUser: 7,
  logExpiration: '30m'
};
exports.requireAccountVerification = false;
exports.smtp = {
  from: {
    name: process.env.SMTP_FROM_NAME || exports.projectName,
    address: process.env.SMTP_FROM_ADDRESS || exports.systemEmail
  },
  credentials: {
    user: process.env.SMTP_USERNAME || 'your@email.addy',
    password: process.env.SMTP_PASSWORD || 'bl4rg!',
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    ssl: true
  }
};
exports.oauth = {
  twitter: {
    key: process.env.TWITTER_OAUTH_KEY || '',
    secret: process.env.TWITTER_OAUTH_SECRET || ''
  },
  facebook: {
    key: process.env.FACEBOOK_OAUTH_KEY || '',
    secret: process.env.FACEBOOK_OAUTH_SECRET || ''
  },
  github: {
    key: process.env.GITHUB_OAUTH_KEY || '',
    secret: process.env.GITHUB_OAUTH_SECRET || ''
  },
  google: {
    key: process.env.GOOGLE_OAUTH_KEY || '',
    secret: process.env.GOOGLE_OAUTH_SECRET || ''
  }
};