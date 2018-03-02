import BattleModel from '../models/BattleModel';
import _ from 'underscore';

export default class BattleController {
    getDistinctLocation(req, res) {
        BattleModel.distinct('location', { location: { $ne: '' } }, function (err, battle) {
            if (err) return res.json({ status: 'error', message: err });
            return res.json({ status: 'success', data: battle });
            console.log('asd')
        });
    }

    getBattleCount(req, res) {
        BattleModel.count({}, function (err, count) {
            if (err) return res.json({ status: 'error', message: err });
            return res.json({status: 'success', count: count});
        });
    }

    async getBattleStats(req, res) {
        let _this = exports.default;
        let battle_type = await _this.statsQueryBuilder([{'$match' : {'battle_type': {'$ne': ''}}},{'$group':{_id: '$battle_type'}}]);

        let responseData = {
            'most_active': {
                'attacker_king': await _this.statsQueryBuilder([{"$sortByCount": '$attacker_king'}], "_id"),
                'defender_king': await _this.statsQueryBuilder([{"$sortByCount": "$defender_king"}], "_id"),
                'region': await _this.statsQueryBuilder([{"$sortByCount": "$region"}], "_id"),
                'name': await _this.statsQueryBuilder([{"$sortByCount": "$name"}], "_id"),
            },
            'attacker_outcome': {
                'win': await _this.statsQueryBuilder([{'$match' : {'attacker_outcome': 'win'}}, {"$sortByCount": "$attacker_outcome"}], "count"),
                'loss': await _this.statsQueryBuilder([{'$match' : {'attacker_outcome': 'loss'}}, {"$sortByCount": "$attacker_outcome"}], "count"),
            },
            'battle_type': _.pluck(battle_type, '_id'),
            'defender_size': {
                'average': await _this.statsQueryBuilder([{'$match' : {'defender_size': {'$ne': ''}}},{'$group': {_id: null, avg: {'$avg':"$defender_size"}}}], 'avg'),
                'min': await _this.statsQueryBuilder([{'$match' : {'defender_size': {'$ne': ''}}},{'$group': {_id: null, min: {'$min':"$defender_size"}}}], 'min'),
                'max': await _this.statsQueryBuilder([{'$match' : {'defender_size': {'$ne': ''}}},{'$group': {_id: null, max: {'$max':"$defender_size"}}}], 'max')
            }
        }
        return res.json({ status: 'success', data: responseData });
    }

    getSearchResults(req, res) {
        BattleModel.apiQuery(req.query, function (err, data) {
            if (err) return res.json({ status: 'error', message: err });
            return res.json({ status: 'success', data: data });
        });
    }

    static statsQueryBuilder(condition, fetch) {
        if(fetch) condition.push({"$limit": 1});
        return new Promise(resolve => {
            BattleModel.aggregate(condition).
            then(function (data) {
                if(fetch) resolve(data[0][fetch]);
                resolve(data)
            });
        });
    }
}