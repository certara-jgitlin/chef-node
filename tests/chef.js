const chai = require('chai'),
    expect = chai.expect,
    chaiAsPromised = require('chai-as-promised'),
    chef = require('../chef'),
    key = require('fs').readFileSync(__dirname + '/fixtures/example.pem'),
    nock = require('nock');

chai.use(chaiAsPromised);

describe('chef', function () {
   describe('createClient', function () {
        it('should be a function', function () {
            expect(chef.createClient).to.be.a('function');
        });
    });

    describe('Client', function () {
        describe('Base URI', function () {
            beforeEach(function () {
                this.client = chef.createClient('test', key, {base: 'https://example.com'});
                nock('https://example.com').get('/nodes').reply(200, require('./fixtures/nodes_example.json'));
            });

            it('returns a promise when making a request', function () {
                var request = this.client.get('/nodes');
                expect(request).to.be.a('Promise');
                expect(request).to.be.fulfilled;
            });

            it('should use the base URI when none is given in the request', function () {
                return this.client.request('GET', '/nodes').then((result) => {
                    expect(result.url.href).to.eq('https://example.com/nodes');
                });
            });

            it('should use the URI in the argments if it is a full one', function () {
                return this.client.request('GET', 'https://example.com/nodes').then((result) => {
                    expect(result.url.href).to.eq('https://example.com/nodes');
                });
            });

            it('returns a list of nodes', function () {
                return this.client.get('https://example.com/nodes').then((result) => {
                    expect(result).to.have.own.property("foo.internal");
                    expect(result).to.have.own.property("bar.internal");
                    expect(result).to.have.own.property("baz.internal");
                    expect(result["foo.internal"]).to.eq("https://example.com/organizations/example/nodes/foo.internal");
                });
            });
        });
    });
});
