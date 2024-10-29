/* Imports: Internal */
import { DeployFunction } from 'hardhat-deploy/dist/types'
import { ethers, upgrades } from 'hardhat';
import { FBTC__factory, FBTC_Vault__factory } from '../typechain-types';
import { MAX_UINT256 } from '../test/helpers/constants';

const deployFn: DeployFunction = async (hre) => {
  const [deployer, admin] = await ethers.getSigners();
  
  const lockedFBTC = "0xcb94dF7530c469c1BcD1F63F364df591207585c2";
  const fbtc = "0x037017580b1Ed99952a006b5197592B1AA08A166";

  const proxy = "0x8178438BE19Da2166D2b46B1F5d58e6FEA38C797";
  const fBTC_VaultProxy = FBTC_Vault__factory.connect(proxy)
  // const fBTC = FBTC__factory.connect(fbtc)
  // const tx = await fBTC.connect(admin).approve(lockedFBTC, MAX_UINT256);
  // await tx.wait();

  // const tx = await fBTC_VaultProxy.connect(deployer).setLockedFBTC(lockedFBTC);
  // await tx.wait();
  // console.log("setLockedFBTC: ");

  //console.log(await fBTC_VaultProxy.connect(deployer).minimumWithdrawAmount())
  const tx = await fBTC_VaultProxy.connect(admin).withdrawNativeBTC();
  await tx.wait();
  console.log("withdrawNativeBTC: ");
}

// This is kept during an upgrade. So no upgrade tag.
deployFn.tags = ['QueryFBTCVault']

export default deployFn
