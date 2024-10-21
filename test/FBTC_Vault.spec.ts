
import { expect } from 'chai';
import {
    deployer,
    fbtc,
    FBTC_VaultProxyAddress,
    fBTCVaultProxy,
    lockedFBTCAddress,
    lorenzoAdmin,
    makeSuiteCleanRoom,
    user,
    userAddress,
} from './__setup.spec';
import { ERRORS } from './helpers/errors';
import { ethers } from 'hardhat';
import { ZERO_ADDRESS } from './helpers/constants';
  
makeSuiteCleanRoom('FBTC Vault Test', function () {
    context('Generic', function () {

        context('Negatives', async function () {

            it('failed to setLockedFBTC if not have permission', async function () {
                await expect(fBTCVaultProxy.connect(user).setLockedFBTC(userAddress)).to.be.revertedWithCustomError(fBTCVaultProxy, ERRORS.OwnableUnauthorizedAccount);
            });

            it('failed to setLockedFBTC if use zero address', async function () {
                await expect(fBTCVaultProxy.connect(deployer).setLockedFBTC(ZERO_ADDRESS)).to.be.revertedWithCustomError(fBTCVaultProxy, ERRORS.InvalidParam);
            });

            it('failed to pause if not have permission', async function () {
                await expect(fBTCVaultProxy.connect(user).pause()).to.be.revertedWithCustomError(fBTCVaultProxy, ERRORS.OwnableUnauthorizedAccount);
            });

            it('failed to unpause if not have permission', async function () {
                await expect(fBTCVaultProxy.connect(user).unpause()).to.be.revertedWithCustomError(fBTCVaultProxy, ERRORS.OwnableUnauthorizedAccount);
            });

            it('failed to setLorenzoAdmin if not have permission', async function () {
                await expect(fBTCVaultProxy.connect(user).setLorenzoAdmin(userAddress)).to.be.revertedWithCustomError(fBTCVaultProxy, ERRORS.OwnableUnauthorizedAccount);
            });

            it('failed to setMinimumWithdrawAmount if not have permission', async function () {
                await expect(fBTCVaultProxy.connect(user).setMinimumWithdrawAmount(10000000)).to.be.revertedWithCustomError(fBTCVaultProxy, ERRORS.NoPermission);
            });

            it('failed to setMinimumWithdrawAmount if less than 1000000', async function () {
                await expect(fBTCVaultProxy.connect(lorenzoAdmin).setMinimumWithdrawAmount(1000000)).to.be.revertedWithCustomError(fBTCVaultProxy, ERRORS.InvalidParam);
            });

            it('failed to withdrawNativeBTC if not have permission', async function () {
                await expect(fBTCVaultProxy.connect(user).withdrawNativeBTC()).to.be.revertedWithCustomError(fBTCVaultProxy, ERRORS.NoPermission);
            });

            it('failed to withdrawNativeBTC if lockedBTC not be initialized', async function () {
                await expect(fBTCVaultProxy.connect(lorenzoAdmin).withdrawNativeBTC()).to.be.revertedWithCustomError(fBTCVaultProxy, ERRORS.InvalidParam);
            });

            it('failed to withdrawNativeBTC if balance less than minimumWithdrawAmount', async function () {
                await expect(fBTCVaultProxy.connect(deployer).setLockedFBTC(lockedFBTCAddress)).to.be.not.reverted;
                await expect(fbtc.connect(deployer).mint(FBTC_VaultProxyAddress, 1000)).to.be.not.reverted;
                await expect(fBTCVaultProxy.connect(lorenzoAdmin).withdrawNativeBTC()).to.be.revertedWithCustomError(fBTCVaultProxy, ERRORS.LessThanMinimumWithdrawAmount);
            });
        })
        context('Scenarios', async function () {
            it('success setLockedFBTC', async function () {
                await expect(fBTCVaultProxy.connect(deployer).setLockedFBTC(userAddress)).to.be.not.reverted;
            });

            it('success setLorenzoAdmin', async function () {
                await expect(fBTCVaultProxy.connect(deployer).setLorenzoAdmin(userAddress)).to.be.not.reverted;
            });

            it('success pause', async function () {
                await expect(fBTCVaultProxy.connect(deployer).pause()).to.be.not.reverted;
            });

            it('success unpause', async function () {
                await expect(fBTCVaultProxy.connect(deployer).pause()).to.be.not.reverted;
                await expect(fBTCVaultProxy.connect(deployer).unpause()).to.be.not.reverted;
            });

            it('success setMinimumWithdrawAmount', async function () {
                await expect(fBTCVaultProxy.connect(lorenzoAdmin).setMinimumWithdrawAmount(10000000)).to.be.not.reverted;
            });

            it('success withdrawNativeBTC', async function () {
                await expect(fBTCVaultProxy.connect(deployer).setLockedFBTC(lockedFBTCAddress)).to.be.not.reverted;
                await expect(fbtc.connect(deployer).mint(FBTC_VaultProxyAddress, 10000000)).to.be.not.reverted;
                await expect(fBTCVaultProxy.connect(lorenzoAdmin).withdrawNativeBTC()).to.be.not.reverted;
            });
        })
    })
})