'use strict';

// modules
const chai = require('chai');
chai.use(require("chai-as-promised"));
const expect = chai.expect;
const server = require('../server');
const request = require('http');
const nes = require('nes');
const sc = require('../plugins/_scripts');

// mocks
const testRoom = 'mochaTest';
const testString = 'Laput4n maCh1ne--' + Math.random();

const john = new nes.Client('ws://localhost:3000');
const johnWSCreds = {
    auth: {
        headers: {
            authorization: 'Basic ' + Buffer.from('john:', 'binary').toString('base64')
        }
    },
    reconnect: false
};

const mary = new nes.Client('ws://localhost:3000');
const maryWSCreds = {
    auth: {
        headers: {
            authorization: 'Basic ' + Buffer.from('mary:', 'binary').toString('base64')
        }
    },
    reconnect: false
}

describe('Server configuration', function() {

    it('server is running', function() {
        expect(server.inject({
            url: '/room/' + testRoom
        })).to.eventually.be.fulfilled.then((response) => {
            expect(response.statusCode).to.equal(200);
        });
    });
    
    it('server can write in "rooms" folder', function() {
        expect(sc.save(testRoom, testString)).to.eventually.be.fulfilled;
    });
    
    it('server can read from "rooms" folder', function() {
        expect(sc.load(testRoom)).to.eventually.equal(testString);
    });
});



describe('App configuration', function() {

    it('auth strategy over HTTP is up', function() {
        expect(server.inject({
            url: '/room/' + testRoom + '/get'
        })).to.eventually.be.fulfilled.then((response) => {
            expect(response.statusCode).to.equal(401);
        });
    });

    it('auth strategy over WS is up', async function() {
        await expect(john.connect(johnWSCreds)).to.eventually.be.fulfilled;
    });

    it('user gets the right room\'s script', async function() {
        await expect(john.request('/room/' + testRoom + '/get')).to.eventually.be.fulfilled
            .then((response) => expect(response.payload).to.equal(testString));
    });
});

describe('Behavior tests', function() {

    it ('user logs in upon getting the script', function() {
        expect(server.app.userLog[testRoom][john.id]).to.equal('john');
    });

    // clean up
    after(() => {
        sc.nuke(testRoom);
    });
});