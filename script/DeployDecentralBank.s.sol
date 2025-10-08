pragma solidity 0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {DecentralBank} from "../src/DecentralBank.sol";
import {Tether} from "../src/Tether.sol";
import {RWD} from "../src/RWD.sol";

contract DeployDecentralBank is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy the Tether contract
        Tether tether = new Tether();

        // 2. Deploy the RWD contract
        RWD rwd = new RWD();

        // 3. Deploy the DecentralBank contract, passing in the new token addresses
        DecentralBank bank = new DecentralBank(rwd, tether);

        // 4. Transfer the full RWD supply to the DecentralBank
        // The full supply is already minted to the deployer (msg.sender) when RWD is created.
        rwd.transfer(address(bank), rwd.totalSupply());

        // 5. Transfer 100 Tether tokens (mUSDT) to the deployer's address for testing
        // This is necessary because the Tether constructor mints the supply to its deployer.
        // We ensure the deployer's address has the mUSDT needed to stake later.
        tether.transfer(msg.sender, 1000 * 10 ** tether.decimals());

        console.log("Tether deployed to:", address(tether));
        console.log("RWD deployed to:", address(rwd));
        console.log("DecentralBank deployed to:", address(bank));
        console.log("Transferred RWD supply to DecentralBank:", rwd.totalSupply());
        console.log("Minted 1000 mUSDT to deployer for staking:", 1000 * 10 ** tether.decimals());

        vm.stopBroadcast();
    }
}
