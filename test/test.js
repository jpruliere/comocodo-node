'use strict';

const { assert, expect } = require('chai');
const server = require('../server');
const request = require('http');
const nes = require('nes');

describe('Comocodo Testing', function() {
    it('should validate if server is running', function() {
        return server.inject({
            url: '/room/testMocha'
        }).then(
            function (response) {
                assert.strictEqual(response.statusCode, 200);
            }
        )
    });
    it('should invalidate if auth strategy lets anyone pass', function() {
        return server.inject({
            url: '/room/testMocha/get'
        }).then(
            function (response) {
                assert.strictEqual(response.statusCode, 401);
            }
        )
    });
    it('should validate if auth strategy over WS is up', async function() {
        let client = new nes.Client('ws://localhost:3000');
        
        await client.connect({
            auth: {
                headers: {
                    authorization: 'Basic ' + Buffer.from('Mocha:', 'binary').toString('base64')
                }
            }
        });
    });
});