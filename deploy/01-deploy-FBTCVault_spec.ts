/* Imports: Internal */
import { DeployFunction } from 'hardhat-deploy/dist/types'
import { ethers, upgrades } from 'hardhat';

const deployFn: DeployFunction = async (hre) => {
  const [deployer, admin] = await ethers.getSigners();
  console.log("deployer: ", deployer.address, " admin: ", admin.address);
  
  const fbtc = "0x037017580b1Ed99952a006b5197592B1AA08A166";

  const FBTC_Vault = await ethers.getContractFactory("FBTC_Vault");
  const proxy = await upgrades.deployProxy(FBTC_Vault, [deployer.address, admin.address, fbtc, 10000000]);
  await proxy.waitForDeployment()
  
  const proxyAddress = await proxy.getAddress()
  console.log("proxy address: ", proxyAddress)
  console.log("admin address: ", await upgrades.erc1967.getAdminAddress(proxyAddress))
  console.log("implement address: ", await upgrades.erc1967.getImplementationAddress(proxyAddress))
}

// This is kept during an upgrade. So no upgrade tag.
deployFn.tags = ['DeployFBTCVault']

export default deployFn
