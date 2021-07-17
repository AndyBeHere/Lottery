# Project for DeepGo Interview
## Task
1. 具备管理员和参与者两种身份，管理员发起彩票活动，并设置彩票开奖时间，参与者在彩票发起至彩票开奖间可参与购买彩票； 
2. 每个参与者每次投资5DAI购买一注彩票，一个参与者可购买多注彩票；
3. 彩票中奖数字由4位0-9之间的数字构成，中奖数字随机生成，中奖者按购买对应数字的注数平分彩票池，平台收取20%的手续费；
4. 管理员可多次发起彩票活动，但是同一时间仅支持一个彩票活动存在；
5. 需提供接口查询往期彩票的中奖数字和中奖者；

## Solution
1. 权限：合约创建者设为管理员；其他地址为参与者。
2. 时间变量：
	- 设开启彩票blocktime为t1；
	- 参与者只能在 [t1, t1+5 minutes) 时段内进入彩池；
	- 开奖必须在（t1+5 minutes, t1+ 10 minutes] 时间段内完成，若超时未开奖，则此次无法开奖，需要由管理者返还彩池资金给参与者。
3. 随机数：
	- 参与者每次下注需向chainlink请求随机值用于计算1～9999的随机数作为参与者的开奖号；
	- 开奖时，需向chainlink请求随机值用于从所有开奖号中随机选取一个作为幸运数字开奖。
4. 查询往期彩票的中奖数字和中奖者
	- 调用view函数查看上一期中奖数字
	- 调用view函数查看上一期中奖者
	- ps: 由于时间不足，未实现所有往期信息的查询。

## Requirements

- NPM
- Truffle
- truffle chainlink smartcontractkit/box

## Installation

1. Install dependencies by running:

```
npm install

# OR...

yarn install
```

## Deploy

For deploying to the kovan network, Truffle will use `truffle-hdwallet-provider` for your mnemonic and an RPC URL. Set your environment variables `$RPC_URL` and `$MNEMONIC` before running:

```
truffle migrate --network kovan --reset
```

## Test

```
truffle test 
```



## Reference
- Based on Ethereum's Welfare Lottery solidity smart contract design: https://www.programmersought.com/article/3027737305/
- deployment tutorial: https://medium.com/coinmonks/5-minute-guide-to-deploying-smart-contracts-with-truffle-and-ropsten-b3e30d5ee1e
- chainlink tutorial: https://github.com/Ivan-on-Tech-Academy/chainlink_lottery_truffle