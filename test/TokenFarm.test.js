const { assert } = require('chai');
const { default: Web3 } = require('web3');

const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken"); 
const TokenFarm = artifacts.require("TokenFarm");

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether')
}

contract('TokenFarm', ([owner, investor]) => {
  let daiToken, dappToken, tokenFarm;

  before(async () => {
    daiToken = await DaiToken.new() 
    dappToken = await DappToken.new() 
    tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address) 

    await dappToken.transfer(tokenFarm.address, tokens('1000000'));
  
    await daiToken.transfer(investor, tokens('100'), { from: owner });
  })

  describe('Mock Dai deployment', async() => {
    it('has a name', async () => {
      
      const name = await daiToken.name()
      assert.equal(name, 'Mock DAI Token')
    })
  })

  describe('Dapp Token deployment', async() => {
    it('has a name', async () => {
      
      const name = await dappToken.name()
      assert.equal(name, 'DApp Token')
    })
  })

  describe('Token Farm deployment', async() => {
    it('has a name', async () => {
      
      const name = await tokenFarm.name()
      assert.equal(name, 'Dapp Token Farm')
    })

    it('contract has tokens', async () => {
      const balance = await dappToken.balanceOf(tokenFarm.address);
      assert.equal(balance.toString(), tokens('1000000'))
    })
  })

  describe('Farming tokens', async () => {
    it('rewards investor for staking mDai tokens', async () => {
       let result = await daiToken.balanceOf(investor);
       assert.equal(result.toString(), tokens('100'), 'correct investor wallet balance before staking')

       await daiToken.approve(tokenFarm.address, tokens('100'), {from: investor});
       await tokenFarm.stakeTokens(tokens('100'), {from: investor});
       
       result = await daiToken.balanceOf(investor);
       assert.equal(result.toString(), tokens('0'), 'investor balance is 0')

       result = await tokenFarm.stakingBalance(investor);
       assert.equal(result.toString(), tokens('100'), 'investor staking balance is 100')

       result = await tokenFarm.isStaking(investor);
       assert.equal(result.toString(), 'true', 'investor is staking')

       // issue tokens
       await tokenFarm.issueTokens({from: owner});

       result = await dappToken.balanceOf(investor);
       assert.equal(result.toString(), tokens('100'), 'investor gets token reward')

       await tokenFarm.issueTokens({from: investor}).should.be.rejected;

       await tokenFarm.unstakeTokens({from: investor});
      
       result = await daiToken.balanceOf(investor);
       assert.equal(result.toString(), tokens('100'), 'investor balance is 100')

       result = await daiToken.balanceOf(tokenFarm.address);
       assert.equal(result.toString(), tokens('0'), 'token farm balance is 0')

       result = await tokenFarm.stakingBalance(investor);
       assert.equal(result.toString(), tokens('0'), 'investor staking balance is 0')

       result = await tokenFarm.isStaking(investor);
       assert.equal(result.toString(), 'false', 'investor is staking')


    })
  })

})