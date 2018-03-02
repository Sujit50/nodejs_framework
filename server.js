require('dotenv-expand')(require('dotenv').config({silent: true}))
require('babel-polyfill');

if (process.env.NODE_ENV == 'development') {
    require('babel-register');
    require('./server/src/app');
} else if (process.env.NODE_ENV == 'production') {
    require('./server/dist/app');
}