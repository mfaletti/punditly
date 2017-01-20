'use strict';

exports.port = process.env.PORT || 8000;
exports.env = process.env.NODE_ENV || 'dev';
exports.mongodb = {
  uri: process.env.MONGODB_URI || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'localhost/pd'
};
exports.solr = {
	port: '8080',
  host: 'localhost'
};

exports.companyName = 'Punditly, Inc.';
exports.projectName = 'Punditly';
exports.systemEmail = '';
exports.cryptoKey = process.env.CRYPTO_KEY || 'Pund1Tly$';
exports.jwt_secret = process.env.JWT_SECRET || 'Pund1tly';

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
    user: process.env.SMTP_USERNAME || 'deji@punditly.com',
    password: process.env.SMTP_PASSWORD || 'funb@lls',
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    ssl: true
  }
};