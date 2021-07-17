const Dai = artifacts.require('Dai')
const Lottery = artifacts.require('Lottery')
const { LinkToken } = require("@chainlink/contracts/truffle/v0.4/LinkToken")

module.exports = async (deployer, network, [defaultAccount]) => {
    if (!network.startsWith('kovan')) {
        console.log('Currently only works with Kovan!')
        LinkToken.setProvider(deployer.provider)
    } else {
        const KOVAN_KEYHASH = '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4'
        const KOVAN_VRF_COORDINATOR = '0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9'
        const KOVAN_LINK_TOKEN = '0xa36085F69e2889c224210F603D836748e7dC0088'
        const KOVAN_DAI_TOKEN = '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa'
        deployer.deploy(Lottery, KOVAN_DAI_TOKEN, KOVAN_VRF_COORDINATOR, KOVAN_LINK_TOKEN, KOVAN_KEYHASH)
    }
    
}
