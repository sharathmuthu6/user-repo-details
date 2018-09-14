var express = require('express');
var request = require('supertest');
var expect = require('chai').expect;
var nock = require('nock');
var path = require('path')
var configFilePath = path.join(path.dirname(__dirname), 'test/config.json')
var fs = require('jsonfile')
var config = fs.readFileSync(configFilePath)


describe('Git User Repos Unit Testcases', function() {

    let server;
    let userResponse = config.userDetails
    let repoResponse = config.repoDetails
    beforeEach(function () {
        server = require('../app')
        nock('https://api.github.com')
            .get('/users/sharathmuthu6')
            .reply(200, userResponse);
        nock('https://api.github.com')
            .get('/users/sharathmuthu6/repos?page=1&per_page=100')
            .reply(200, repoResponse);
    })

    it('Unit test for GET on /', function testGet(done) {
        request(server)
            .get('/')
            .expect(200,function (err, res) {
                expect(res.statusCode).to.equal(200)
                done()
            })
    })

    it('Unit test for POST on /data', function testPost(done) {
        this.timeout(12000);
        request(server)
            .post('/data')
            .send({ username: 'sharathmuthu6' })
            .expect(200, function (err, res) {
                expect(res.statusCode).to.equal(200)
                done()
            })

    })

});

