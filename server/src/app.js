import express from 'express';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import debug from 'debug';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mustacheExpress from 'mustache-express';
import index from './routes/index';

dotenv.config();

const app = express();
const port = process.env.NODE_PORT || 8000;

const log = {
	error: debug('app:error'),
	success: debug('app:success'),
};

// DB CONNECT START
if (log.error.enabled) mongoose.set('debug', true);

const db = mongoose.connection;
const dbconn = process.env.DB_CONNECTION || 'mongodb';
const dbport = process.env.DB_PORT || '1233';
const dbhost = process.env.DB_HOST || 'localhost';
const dbname = process.env.DB_DATABASE || 'localhost';
const dbuser = process.env.DB_USERNAME || 'root';
const dbpass = process.env.DB_PASSWORD || '123456';

mongoose.connect(`${dbconn}://${dbuser}:${dbpass}@${dbhost}:${dbport}/${dbname}`);
db.on('error', console.error.bind(console, 'connection error:'));
// DB CONNECT END

app.use(helmet());
app.use(cookieParser());
app.use(csrf({ cookie: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('views', 'views');
app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.use('/', index);

app.listen(port, () => {
	console.log(`Express server listening at port ${port}`)
});