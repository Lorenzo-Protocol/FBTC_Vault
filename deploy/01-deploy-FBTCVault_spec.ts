/* Imports: Internal */
import { DeployFunction } from 'hardhat-deploy/dist/types'
import { ethers, upgrades } from 'hardhat';

const deployFn: DeployFunction = async (hre) => {
  const [deployer] = await ethers.getSigners();
  
  const lorenzoAdmin = "0xcF93cD03eD618A31688860e01F450f9989764e87";
  const fbtc = "0x23396cF9b7D7d8fC4b5cB271C5d8f6f3b32fF9bF";

  const FBTC_Vault = await ethers.getContractFactory("FBTC_Vault");
  const proxy = await upgrades.deployProxy(FBTC_Vault, [deployer.address, lorenzoAdmin, fbtc, 50000000]);
  await proxy.waitForDeployment()
  
  const proxyAddress = await proxy.getAddress()
  console.log("proxy address: ", proxyAddress)
  console.log("admin address: ", await upgrades.erc1967.getAdminAddress(proxyAddress))
  console.log("implement address: ", await upgrades.erc1967.getImplementationAddress(proxyAddress))
}

// This is kept during an upgrade. So no upgrade tag.
deployFn.tags = ['DeployStakePlanHub']

export default deployFn
