// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {Tether} from "../src/Tether.sol";
import {RWD} from "../src/RWD.sol";
import {DecentralBank} from "../src/DecentralBank.sol";

contract DeployDecentralBank is Script {
    function run() external returns (address) {
        

        // Start broadcasting transactions.
        vm.startBroadcast();

        // Deploy the Tether and RWD contracts first, as they are dependencies.
        Tether tether = new Tether();
        console.log("Tether deployed to:", address(tether));
        
        RWD rwd = new RWD();
        console.log("RWD deployed to:", address(rwd));

        // Now, deploy the DecentralBank contract, passing the addresses of Tether and RWD.
        DecentralBank decentralBank = new DecentralBank(rwd, tether);

        // Stop broadcasting transactions.
        vm.stopBroadcast();
        
        console.log("DecentralBank deployed to:", address(decentralBank));
        return address(decentralBank);
    }
}
