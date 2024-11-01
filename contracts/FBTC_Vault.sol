// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ILockedFBTC} from "./interfaces/ILockedFBTC.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FBTC_Vault is PausableUpgradeable, OwnableUpgradeable {
    error InvalidParam();
    error LessThanMinimumWithdrawAmount();
    error NoPermission();
    error MintLockedFbtcRequestFailed();
    error UninitializedLockedFBTC();

    event LockedFBTCSet(address lockedFBTC);
    event LorenzoAdminSet(address lorenzoAdmin);
    event MinimumWithdrawAmountSet(uint256 minimumWithdrawAmount);
    event WithdrawNativeBTC(uint256 amount, uint256 realAmount);
    event Initialize(
        address owner,
        address lorenzoAdmin,
        address fbtc,
        uint256 minimumWithdrawAmount
    );
    event Approve2LockedFBTC(address lockedFBTC, uint256 amount);

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
        if (
            owner_ == address(0) ||
            fbtc_ == address(0) ||
            lorenzoAdmin_ == address(0) ||
            minimumWithdrawAmount_ <= 1000000
        ) {
            revert InvalidParam();
        }
        __Pausable_init();
        __Ownable_init(owner_);

        fbtc = fbtc_;
        lorenzoAdmin = lorenzoAdmin_;
        minimumWithdrawAmount = minimumWithdrawAmount_;
        emit Initialize(owner_, lorenzoAdmin_, fbtc_, minimumWithdrawAmount_);
    }

    // =========================
    // =====Owner functions=====
    // =========================

    function setLockedFBTC(address lockedFBTC_) external onlyOwner {
        if (lockedFBTC_ == address(0)) {
            revert InvalidParam();
        }
        lockedFBTC = lockedFBTC_;
        IERC20(fbtc).approve(lockedFBTC, type(uint256).max);
        emit LockedFBTCSet(lockedFBTC);
    }

    function approve2LockedFBTC(uint256 amount) external onlyOwner {
        IERC20(fbtc).approve(lockedFBTC, amount);
        emit Approve2LockedFBTC(lockedFBTC, amount);
    }

    function setLorenzoAdmin(address newLorenzoAdmin_) external onlyOwner {
        if (newLorenzoAdmin_ == address(0)) {
            revert InvalidParam();
        }
        lorenzoAdmin = newLorenzoAdmin_;
        emit LorenzoAdminSet(newLorenzoAdmin_);
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
            revert InvalidParam();
        }
        minimumWithdrawAmount = minimumWithdrawAmount_;
        emit MinimumWithdrawAmountSet(minimumWithdrawAmount);
    }

    function withdrawNativeBTC() external whenNotPaused onlyLorenzoAdmin {
        if (lockedFBTC == address(0)) {
            revert UninitializedLockedFBTC();
        }
        uint256 balance = IERC20(fbtc).balanceOf(address(this));
        if (balance < minimumWithdrawAmount) {
            revert LessThanMinimumWithdrawAmount();
        }
        uint256 realAmount = ILockedFBTC(lockedFBTC).mintLockedFbtcRequest(
            balance
        );
        if (realAmount == 0) {
            revert MintLockedFbtcRequestFailed();
        }
        emit WithdrawNativeBTC(balance, realAmount);
    }
}
