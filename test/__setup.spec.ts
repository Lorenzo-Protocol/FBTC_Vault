import { Signer, Wallet } from 'ethers';
import { ethers, upgrades } from 'hardhat';
import {
  revertToSnapshot,
  takeSnapshot,
} from './helpers/utils';
import { FBTC__factory, LockedFBTC__factory, FBTC_Vault__factory, FBTC, LockedFBTC, FBTC_Vault } from '../typechain-types';


export let accounts: Signer[];
export let deployer: Signer;
export let lorenzoAdmin: Signer;
export let user: Signer;
export let deployerAddress: string;
export let lorenzoAdminAddress: string;
export let userAddress: string;
export let FBTC_VaultProxyAddress: string;

export let lockedFBTCAddress: string;
export let fbtcAddress: string;

export let fbtc: FBTC;
export let lockedFBTC: LockedFBTC;

export let fBTCVaultProxy: FBTC_Vault;

export function makeSuiteCleanRoom(name: string, tests: () => void) {
  describe(name, () => {
    beforeEach(async function () {
      await takeSnapshot();
    });
    tests();
    afterEach(async function () {
      await revertToSnapshot();
    });
  });
}

before(async function () {

  accounts = await ethers.getSigners();
  deployer = accounts[0];
  lorenzoAdmin = accounts[1];
  user = accounts[2];

  deployerAddress = await deployer.getAddress();
  lorenzoAdminAddress = await lorenzoAdmin.getAddress();
  userAddress = await user.getAddress();

  fbtc = await new FBTC__factory(deployer).deploy();
  fbtcAddress = await fbtc.getAddress();
  console.log("fbtc address: ", fbtcAddress)

  lockedFBTC = await new LockedFBTC__factory(deployer).deploy();
  lockedFBTCAddress = await lockedFBTC.getAddress();
  console.log("lockedFBTC address: ", lockedFBTCAddress)

  const FBTC_Vault = await ethers.getContractFactory("FBTC_Vault");
  const FBTC_VaultProxy = await upgrades.deployProxy(FBTC_Vault, [deployerAddress, lorenzoAdminAddress, fbtcAddress, 5000000]);
  await FBTC_VaultProxy.waitForDeployment()
  FBTC_VaultProxyAddress = await FBTC_VaultProxy.getAddress()
  console.log("bridgeProxy address: ", FBTC_VaultProxyAddress)
  console.log("bridgeProxy admin address: ", await upgrades.erc1967.getAdminAddress(FBTC_VaultProxyAddress))
  console.log("bridgeProxy implement address: ", await upgrades.erc1967.getImplementationAddress(FBTC_VaultProxyAddress))
  fBTCVaultProxy = FBTC_Vault__factory.connect(FBTC_VaultProxyAddress, deployer);
});
