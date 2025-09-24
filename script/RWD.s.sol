// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {RWD} from "../src/RWD.sol";

contract DeployRWD is Script {
    function run() external returns (address) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the RWD contract.
        RWD rwd = new RWD();

        // Stop broadcasting transactions.
        vm.stopBroadcast();

        console.log("RWD deployed to:", address(rwd));
        return address(rwd);
    }
}
