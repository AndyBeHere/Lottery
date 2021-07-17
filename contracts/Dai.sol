pragma solidity ^0.6.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Dai is ERC20("MakerDAO", "Dai") {
    constructor() public {
        _mint(msg.sender, 10**21);
    }
}