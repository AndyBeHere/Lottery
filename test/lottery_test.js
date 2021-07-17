const { forwardTime } = require("../utils/test-helper")
const { assert } = require('chai')
const ganache = require('ganache-core')
const truffleAssert = require('truffle-assertions')
const toWei = (value) => web3.utils.toWei(String(value))
const Dai = artifacts.require('Dai')

const Lottery = artifacts.require('Lottery')
const { LinkToken } = require("@chainlink/contracts/truffle/v0.4/LinkToken")
const VRFCoordinatorMock = artifacts.require('VRFCoordinatorMock')

contract("Lottery", accounts => {
    let lottery, dai, vrfCoordinatorMock, seed, link, keyhash, fee
    const defaultAccount = accounts[0]
    const player1 = accounts[1]
    const player2 = accounts[2]
    const player3 = accounts[3]
    // describe('request a random number', () => {
    it ('init', async() => {
        keyhash = '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4'
        fee = '100000000000000000' 
        seed = 123
        link = await LinkToken.new({from: defaultAccount})
        dai = await Dai.new({from: defaultAccount})
        vrfCoordinatorMock = await VRFCoordinatorMock.new(link.address, {from: defaultAccount})
        lottery = await Lottery.new(
            dai.address, vrfCoordinatorMock.address, link.address,  keyhash, {from: defaultAccount}
        )
    })

    it('starts in closed state', async () => {
        assert(await lottery.lotteryState() == Lottery.LotteryState.CLOSED)
    })

    // end state: a lottery on, player1-one bet
    it('Disallow entrants without enough money', async () =>{
        await lottery.startLottery({from: defaultAccount})
        await truffleAssert.reverts(
            lottery.enter({from: player1}),
            "enter fail: Dai insufficient!"
        )  
        // deposit Dai to player1
        await dai.transfer(player1, '100000000000000000000', {from: defaultAccount})
        await link.transfer(lottery.address, toWei(1), {from: defaultAccount})

        let balance_player1_start = await dai.balanceOf(player1, {from: player1})
        const oneBet = await lottery.oneBet({from: player1})
        await dai.approve(lottery.address, '100000000000000000000', {from: player1})

        // interact with chainlink
        let transaction = await lottery.enter({from: player1})
        let requestId = transaction.receipt.rawLogs[3].topics[0]
        await vrfCoordinatorMock.callBackWithRandomness(requestId, '3', lottery.address, {from: defaultAccount})

        assert.equal(
            BigInt(balance_player1_start), BigInt(oneBet) + BigInt(await dai.balanceOf(player1, {from: player1}), 
            "player1's dai unbalanced"
        ))

        assert.equal(
            BigInt(await dai.balanceOf(lottery.address)), BigInt(oneBet),
            "lottery's dai unbalanced"
        )
    })
    
    // end state: player1 - 1 bet; player2 - 6 bets; player3 - 1 bet
    it('before lottery closed', async () => {
        await dai.transfer(player2, '100000000000000000000', {from: defaultAccount})
        await dai.transfer(player3, '100000000000000000000', {from: defaultAccount})
        await dai.approve(lottery.address, '100000000000000000000', {from: player2})
        await dai.approve(lottery.address, '100000000000000000000', {from: player3})

        transaction = await lottery.enter({from: player2})
        requestId = transaction.receipt.rawLogs[3].topics[0]
        await vrfCoordinatorMock.callBackWithRandomness(requestId, '102343', lottery.address, {from: defaultAccount})

        transaction = await lottery.enter({from: player2})
        requestId = transaction.receipt.rawLogs[3].topics[0]
        await vrfCoordinatorMock.callBackWithRandomness(requestId, '202343', lottery.address, {from: defaultAccount})

        transaction = await lottery.enter({from: player2})
        requestId = transaction.receipt.rawLogs[3].topics[0]
        await vrfCoordinatorMock.callBackWithRandomness(requestId, '302343', lottery.address, {from: defaultAccount})

        transaction = await lottery.enter({from: player2})
        requestId = transaction.receipt.rawLogs[3].topics[0]
        await vrfCoordinatorMock.callBackWithRandomness(requestId, '402343', lottery.address, {from: defaultAccount})
    
        transaction = await lottery.enter({from: player2})
        requestId = transaction.receipt.rawLogs[3].topics[0]
        await vrfCoordinatorMock.callBackWithRandomness(requestId, '502343', lottery.address, {from: defaultAccount})

        transaction = await lottery.enter({from: player2})
        requestId = transaction.receipt.rawLogs[3].topics[0]
        await vrfCoordinatorMock.callBackWithRandomness(requestId, '602343', lottery.address, {from: defaultAccount})

        transaction = await lottery.enter({from: player3})
        requestId = transaction.receipt.rawLogs[3].topics[0]
        await vrfCoordinatorMock.callBackWithRandomness(requestId, '702343', lottery.address, {from: defaultAccount})

        console.log('randomnessGet is: ' + BigInt(await lottery.randomnessGet({from: defaultAccount})))
        console.log('Dai balance is: ' + BigInt(await dai.balanceOf(lottery.address)))
        console.log('lottery state is: ' + (await lottery.lotteryState({from: defaultAccount})).toString())
        console.log(await lottery.getPlayers({from: defaultAccount}))
        // console.log(await lottery.recentWinners({from: defaultAccount}))
    })

    it('lottery closed too early', async () => { 
        await forwardTime(1)

        await truffleAssert.reverts(
                lottery.endLottery({from: defaultAccount}),
                "end fail: invalid time"
        )
        console.log('time 1 is: ' + await lottery.getTime({from: defaultAccount}))
    })


        // it('lottery closed in time', async () => { 
        //     await forwardTime(300)
        //     console.log('time 2 is: ' + await lottery.getTime({from: defaultAccount}))

        //     await truffleAssert.reverts(
        //         lottery.refund({from: defaultAccount}),
        //         "refund fail: invalid time"
        //     )

        //     transaction = await lottery.endLottery({from: defaultAccount})
        //     requestId = transaction.receipt.rawLogs[3].topics[0]
        //     await vrfCoordinatorMock.callBackWithRandomness(requestId, '702343', lottery.address, {from: defaultAccount})

        //     assert.equal(Lottery.LotteryState.CLOSED.toString(),
        //         (await lottery.lotteryState({from: defaultAccount})).toString(),
        //         'lottery state is not close!') 

        //     assert.equal("", (await lottery.getPlayers({from: defaultAccount})).toString())
            
        //     assert.equal(BigInt(await dai.balanceOf.call(player1, {from: player1})), BigInt(95000000000000000000))
        //     assert.equal(BigInt(await dai.balanceOf.call(player2, {from: player2})), BigInt(70000000000000000000))
        //     assert.equal(BigInt(await dai.balanceOf.call(player3, {from: player3})), BigInt(127000000000000000000))
        //     assert.equal(BigInt(await dai.balanceOf.call(defaultAccount, {from: defaultAccount})), BigInt(708000000000000000000))

        //     console.log('recent winners are: ', await lottery.getRecentWinners({from: defaultAccount}))
        //     console.log('recent winner number is: ', await lottery.getRecentWinNumber({from: defaultAccount}))
        // })
    
        it('lottery closed over time', async () => { 
            await forwardTime(600)
            console.log('time 2 is: ' + await lottery.getTime({from: defaultAccount}))
            console.log('owner is: ', await lottery.owner({from: defaultAccount}))
            console.log('default account is: ', defaultAccount)

            await truffleAssert.reverts(
                lottery.endLottery({from: defaultAccount}),
                "end fail: invalid time"
            )

            await truffleAssert.reverts(
                lottery.refund({from: player1}),
                "Ownable: caller is not the owner"
            )

            await truffleAssert.passes(
                lottery.refund({from: defaultAccount})
            )
            
            assert.equal(Lottery.LotteryState.CLOSED.toString(),
                (await lottery.lotteryState({from: defaultAccount})).toString(),
                'lottery state is not close!') 

            assert.equal("", (await lottery.getPlayers({from: defaultAccount})).toString())
            
            console.log(BigInt(await dai.balanceOf.call(player1, {from: player1})))
            console.log(BigInt(await dai.balanceOf.call(player2, {from: player1})))
            console.log(BigInt(await dai.balanceOf.call(player3, {from: player1})))
            console.log(BigInt(await dai.balanceOf.call(lottery.address, {from: player1})))

            console.log('recent winners are: ', await lottery.getRecentWinners({from: defaultAccount}))
            console.log('recent winner number is: ', await lottery.getRecentWinNumber({from: defaultAccount}))
        })
    
    })
// })
// })