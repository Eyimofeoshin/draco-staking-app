// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/Tether.sol";
import "../src/RWD.sol";
import "../src/DecentralBank.sol";

contract IssueTokens is Script {
    Tether public tether;
    RWD public rwd;
    DecentralBank public decentralBank;
    address public owner = address(0x1);

    function run() external {
        // Deploy contracts
        vm.prank(owner);
        tether = new Tether();
        vm.prank(owner);
        rwd = new RWD();
        vm.prank(owner);
        decentralBank = new DecentralBank(rwd, tether);

        // Issue tokens from the owner's address
        vm.prank(owner);
        decentralBank.issueTokens();
        
        console.log("Tokens have been issued successfully!");
    }
}
