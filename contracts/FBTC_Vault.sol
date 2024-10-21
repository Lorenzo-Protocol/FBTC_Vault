// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ILockedFBTC} from "./interfaces/ILockedFBTC.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FBTC_Vault is PausableUpgradeable, OwnableUpgradeable {
    error InvalidParams();
    error LessThanMinimumWithdrawAmount();
    error NoPermission();

    address public lockedFBTC;
    address public fbtc;
    address public lorenzoAdmin;

    uint256 public minimumWithdrawAmount;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev This modifier reverts if the caller is not the configured lorenzo admin.
     */
    modifier onlyLorenzoAdmin() {
        if (msg.sender != lorenzoAdmin) {
            revert NoPermission();
        }
        _;
    }

    function initialize(
        address owner_,
        address lorenzoAdmin_,
        address fbtc_,
        uint256 minimumWithdrawAmount_
    ) external initializer {
        __Pausable_init();
        __Ownable_init(owner_);

        if (
            fbtc_ == address(0) ||
            lorenzoAdmin_ == address(0) ||
            minimumWithdrawAmount_ <= 1000000
        ) {
            revert InvalidParams();
        }
        fbtc = fbtc_;
        lorenzoAdmin = lorenzoAdmin_;
        minimumWithdrawAmount = minimumWithdrawAmount_;
    }

    // =========================
    // =====Owner functions=====
    // =========================

    function setLockedFBTC(address lockedFBTC_) external onlyOwner {
        if (lockedFBTC_ == address(0)) {
            revert InvalidParams();
        }
        lockedFBTC = lockedFBTC_;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function setMinimumWithdrawAmount(
        uint256 minimumWithdrawAmount_
    ) external onlyLorenzoAdmin {
        if (minimumWithdrawAmount_ <= 1000000) {
            revert InvalidParams();
        }
        minimumWithdrawAmount = minimumWithdrawAmount_;
    }

    function withdrawNativeBTC() external whenNotPaused onlyLorenzoAdmin {
        uint256 balance = IERC20(fbtc).balanceOf(address(this));
        if (balance < minimumWithdrawAmount) {
            revert LessThanMinimumWithdrawAmount();
        }
        ILockedFBTC(lockedFBTC).mintLockedFbtcRequest(balance);
    }
}
