'use strict';

var async = require('async');
var cheerio = require('cheerio');
var config = require('../config/config');
var GithubApi = require('github');
var https = require('https');
var moment = require('moment');
var q = require('q');
var util = require('util');

function github() {
    this.github = new GithubApi({
        // --- [required] ---
        version: '3.0.0'
        // --- [optional] ---
        // debug: true,
        // protocol: 'https',
        // host: 'github.my-GHE-enabled-company.com',
        // pathPrefix: '/api/v3', // for some GHEs
        // timeout: 5000,
        // headers: {
        //     'user-agent': 'My-Cool-GitHub-App', // GitHub is happy with a unique user agent
        // }
    });
    if (!config.github || !config.github.token) {
        throw new Error('Github token is not yet defined in config file.');
    }
    this.github.authenticate({
        type: 'oauth',
        token: config.github.token
    });
}

github.prototype.getRepos = function() {
    var deferred = q.defer();

    this.github.repos.getAll({
        type: 'public',
        sort: 'pushed',
        direction: 'desc'
    }, function(githubErr, githubRes) {
        if (githubErr) {
            deferred.reject(githubErr);
            return;
        }

        async.map(githubRes, function(item, callback) {
            var badge = util.format(
                'https://api.travis-ci.org/%s.svg?branch=%s',
                item.full_name,
                item.default_branch
            );
            callback(null, {
                name: item.name,
                description: item.description,
                fullname: item.full_name,
                branch: item.default_branch,
                url: item.html_url,
                language: item.language,
                forks: item.forks_count,
                stars: item.stargazers_count,
                watches: item.subscribers_count,
                badge: badge
            });
        }, function(asyncErr, asyncData) {
            if (asyncErr) {
                deferred.reject(asyncErr);
                return;
            }
            deferred.resolve(asyncData);
        });
    });

    return deferred.promise;
}

github.prototype.getActivities = function() {
    this.github.repos.getFromUserPublic({
        user: 'waltzofpearls'
    }, function(err, res) {
        //
    });
}

github.prototype.getContributions = function() {
    var data = '';
    var deferred = q.defer();
    var url = util.format(
        'https://github.com/users/%s/contributions',
        config.github.username
    );

    var req = https.get(url, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            data += chunk;
        });
        res.on('end', function() {
            var $ = cheerio.load(data);
            var contributions = {};
            var timestamp;

            // parse svg return from github, extract date and count from each
            // [svg > g > g >rect], convert date to unix timestamp and push
            // each day's contribution data to contributions array
            $('g > g > rect').each(function(i, rect) {
                timestamp = moment($(rect).attr('data-date'), 'YYYY-MM-DD').format('X');
                contributions[timestamp] = +$(rect).attr('data-count');
            });

            deferred.resolve(contributions);
        });
    });

    req.end();

    return deferred.promise;
}

module.exports = github;
