import express from 'express';
import BattleController from '../controllers/BattleController'
import redis from 'redis';
import expressLimiter from 'express-limiter';

const router = express.Router();

const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    db: process.env.REDIS_DATABASE || 1
});

const limiter = expressLimiter(router, redisClient);
const battleController = new BattleController();

limiter({
    path: '/',
    method: 'get',
    lookup: 'connection.remoteAddress',
    total: 100,
    expire: 1000 * 60 * 60,
    onRateLimited: function (req, res, next) {
        res.send({ message: 'Rate limit exceeded', status: 429 })
    }
});

router.get('/', function(req, res, next) {
    res.render('index', {name: 'Sujit'});
});
router.get('/list', battleController.getDistinctLocation);
router.get('/count', battleController.getBattleCount);
router.get('/stats', battleController.getBattleStats);
router.get('/search', battleController.getSearchResults);

module.exports = router;
