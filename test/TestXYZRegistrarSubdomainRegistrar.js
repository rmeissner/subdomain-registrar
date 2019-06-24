const ENS = artifacts.require("ENSRegistry");
const XYZRegistrarSubdomainRegistrar = artifacts.require("XYZRegistrarSubdomainRegistrar");
const HashRegistrar = artifacts.require("HashRegistrar");
const TestResolver = artifacts.require("TestResolver");

const utils = require('./helpers/Utils');

var namehash = require('eth-ens-namehash');
const sha3 = require('web3-utils').sha3;

contract('EthRegistrarSubdomainRegistrar', function (accounts) {
    var ens = null;
    var registrar = null;
    var resolver = null;

    before(async function () {
      ens = await ENS.deployed();
      dhr = await HashRegistrar.deployed();
      resolver = await TestResolver.deployed();

      await ens.setSubnodeOwner('0x0', sha3('xyz'), accounts[0]);

      resolver = await TestResolver.deployed();

      registrar = await XYZRegistrarSubdomainRegistrar.new(ens.address);
    });

    it('should set up a domain', async function () {
        await ens.setSubnodeOwner(sha3('xyz'), sha3('test'), accounts[0]);
  
        tx = await registrar.configureDomain('test', '10000000000000000', 100000, {from: accounts[0]});
        assert.equal(tx.logs.length, 1);
        assert.equal(tx.logs[0].event, 'DomainConfigured');
        assert.equal(tx.logs[0].args.label, sha3('test'));

        var domainInfo = await registrar.query(sha3('test'), '');
        assert.equal(domainInfo[0], 'test');
        assert.equal(domainInfo[1], '10000000000000000');
        assert.equal(domainInfo[2].toNumber(), 0);
        assert.equal(domainInfo[3].toNumber(), 100000);

        assert.equal(await ens.owner(namehash.hash('test.xyz')), registrar.address);
    });

    it("should fail to setup a domain if it hasn't been transferred", async function () {
        try {
            await registrar.configureDomain('test', '10000000000000000', 100000, {from: accounts[0]});
            assert.fail('Expected error not encountered');
        } catch (error) {
        }
    });

    it("should fail to register a subdomain if it hasn't been transferred", async function () {
        try {
            await registrar.register(sha3('foo'), 'test', accounts[0], accounts[0], resolver.address, {value: '10000000000000000'});
            assert.fail('Expected error not encountered');
        } catch (error) {
        }
    });
});
