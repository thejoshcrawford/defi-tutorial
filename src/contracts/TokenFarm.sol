pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
  string public name = "Dapp Token Farm";
  // string public symbol = "DTF";
  address public owner;
  DappToken public dappToken;
  DaiToken public daiToken;

  address[] public stakers;
  mapping(address => uint) public stakingBalance;
  mapping(address => bool) public hasStaked;
  mapping(address => bool) public isStaking;

  constructor(DappToken _dappToken, DaiToken _daiToken) public {
    dappToken = _dappToken;
    daiToken = _daiToken;
    owner = msg.sender;
  }

  // 1. Stake Tokens
  function stakeTokens(uint _amount) public {
    require(_amount > 0, "amount cannot be 0");

    daiToken.transferFrom(msg.sender, address(this), _amount);

    // update balance
    stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

    // Add users to staked array for reward
    if(!hasStaked[msg.sender]) {
      stakers.push(msg.sender);
    }

    hasStaked[msg.sender] = true;
    isStaking[msg.sender] = true;
  }

  // 2. Unstake Tokens
  function unstakeTokens() public {
    // require(_amount > 0, "amount cannot be less than 0");

    uint balance = stakingBalance[msg.sender];

    require(balance > 0, "staking balance cannot be <= 0");

    daiToken.transfer(msg.sender, balance);

    stakingBalance[msg.sender] = 0;
    isStaking[msg.sender] = false;
  }

  // 3. Issue tokens (intereest)
  function issueTokens() public {
    require(msg.sender == owner, "caller must be owner");

    for (uint i = 0; i<stakers.length; i++){
      address recipient = stakers[i];
      uint balance = stakingBalance[recipient];
      if (balance > 0) {
        dappToken.transfer(recipient, balance);
      } 
    }
  }

}