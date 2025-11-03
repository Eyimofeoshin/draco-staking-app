// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {DecentralBank} from "../src/DecentralBank.sol";
import {Tether} from "../src/Tether.sol";
import {RWD} from "../src/RWD.sol";

contract DecentralBankTest is Test {
    DecentralBank public decentralBank;
    Tether public tether;
    RWD public rwd;

    address public owner;
    address public customer;

    function tokens(uint256 number) public pure returns (uint256) {
        return number * 10 ** 18;
    }

    function setUp() public {
        owner = address(0x72AA20A2CeEEe5726896F9545affb9672b8D6F8A);
        customer = address(0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2);

        vm.startPrank(owner);
        tether = new Tether();
        rwd = new RWD();
        decentralBank = new DecentralBank(rwd, tether);
        vm.stopPrank();

        vm.prank(owner);
        rwd.transfer(address(decentralBank), tokens(1000000));

        vm.prank(owner);
        tether.transfer(customer, tokens(100));
    }

    function testMockTetherDeployment() public view {
        string memory name = tether.name();
        assertEq(name, "Mock Tether Token");
    }

    function testRewardTokenDeployment() public view {
        string memory name = rwd.name();
        assertEq(name, "Reward Token");
    }

    function testDecentralBankDeployment() public view {
        string memory name = decentralBank.name();
        assertEq(name, "Decentral Bank");
    }

    function testDecentralBankHasTokens() public view {
        uint256 balance = rwd.balanceOf(address(decentralBank));
        assertEq(balance, tokens(1000000));
    }

    function testDepositTokens() public {
        vm.startPrank(customer);
        tether.approve(address(decentralBank), tokens(100));
        decentralBank.depositTokens(tokens(100));
        vm.stopPrank();

        assertEq(tether.balanceOf(customer), tokens(0));

        assertEq(tether.balanceOf(address(decentralBank)), tokens(100));

        assertTrue(decentralBank.isStaking(customer));
        assertEq(decentralBank.stakingBalance(customer), tokens(100));
    }

    function testIssueTokens() public {
        vm.startPrank(customer);
        tether.approve(address(decentralBank), tokens(100));
        decentralBank.depositTokens(tokens(100));
        vm.stopPrank();

        vm.prank(owner);
        decentralBank.issueTokens();

        uint256 expectedReward = decentralBank.stakingBalance(customer) / 9;
        assertEq(rwd.balanceOf(customer), expectedReward);

        vm.prank(customer);
        vm.expectRevert("caller must be the owner");
        decentralBank.issueTokens();
    }

    function testUnstakeTokens() public {
        vm.startPrank(customer);
        tether.approve(address(decentralBank), tokens(100));
        decentralBank.depositTokens(tokens(100));
        vm.stopPrank();

        vm.prank(customer);
        decentralBank.unstakeTokens();

        assertEq(tether.balanceOf(customer), tokens(100));

        assertEq(tether.balanceOf(address(decentralBank)), tokens(0));

        assertFalse(decentralBank.isStaking(customer));
        assertEq(decentralBank.stakingBalance(customer), 0);
    }

    function testUnstakeRevertsForZeroBalance() public {
        vm.prank(customer);
        vm.expectRevert("staking balance cannot be less than zero");
        decentralBank.unstakeTokens();
    }

    function testIssueTokensWithMultipleStakers() public {
        address customer2 = address(0xDeadBeefBabe);

        vm.prank(owner);
        tether.transfer(customer2, tokens(100));
        vm.stopPrank();

        vm.startPrank(customer);
        tether.approve(address(decentralBank), tokens(100));
        decentralBank.depositTokens(tokens(100));
        vm.stopPrank();

        vm.startPrank(customer2);
        tether.approve(address(decentralBank), tokens(50));
        decentralBank.depositTokens(tokens(50));
        vm.stopPrank();

        vm.prank(owner);
        decentralBank.issueTokens();

        assertEq(rwd.balanceOf(customer), decentralBank.stakingBalance(customer) / 9);

        assertEq(rwd.balanceOf(customer2), decentralBank.stakingBalance(customer2) / 9);
    }
}
