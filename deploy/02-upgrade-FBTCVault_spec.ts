/* Imports: Internal */
import { DeployFunction } from 'hardhat-deploy/dist/types'

import { ethers, upgrades } from 'hardhat';

const deployFn: DeployFunction = async (hre) => {
  const proxyAddr = "0x8178438BE19Da2166D2b46B1F5d58e6FEA38C797";
  const FBTC_Vault = await ethers.getContractFactory("FBTC_Vault");
  const proxy = await upgrades.upgradeProxy(proxyAddr, FBTC_Vault);
  await proxy.waitForDeployment()
  
  const proxyAddress = await proxy.getAddress()
  console.log("proxy address: ", proxyAddress)
  console.log("admin address: ", await upgrades.erc1967.getAdminAddress(proxyAddress))
  console.log("implement address: ", await upgrades.erc1967.getImplementationAddress(proxyAddress))
}

// This is kept during an upgrade. So no upgrade tag.
deployFn.tags = ['UpgradeFBTCVault']

export default deployFn