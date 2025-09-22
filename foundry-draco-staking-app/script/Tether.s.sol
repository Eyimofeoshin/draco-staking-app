// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {Tether} from "../src/Tether.sol";

contract DeployTether is Script {
    function run() external returns (address) {
        
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        
        vm.startBroadcast(deployerPrivateKey);

        
        Tether tether = new Tether();

        
        vm.stopBroadcast();
        
        console.log("Tether deployed to:", address(tether));
        return address(tether);
    }
}
