const Migrations = artifacts.require('BiometricContract');
const Contract = artifacts.require('Contract');
const axios = require("axios");
// const Migrations = artifacts.require('BiometricContract');

// IWorldID _worldId,
//   string memory _appId,
//   string memory _actionId



module.exports = async function (deployer) {
  const worldIDAddress = await axios.get(
    "https://developer.worldcoin.org/api/v1/contracts"
  );
    // .then((res) => res.json())
    // .then(
    //   (res) => res.find(({ key }) => key == "staging.semaphore.wld.eth").value
    // );
  // console.log(worldIDAddress.data); // array
  const worldIdKey = worldIDAddress.data.find(({ key }) => key == "staging.semaphore.wld.eth").value
  // console.log(worldId)
  await deployer.deploy(Migrations);
  await deployer.deploy(Contract,worldIdKey,"app_staging_5aab1ea1961f7ff5b8730d4cf509e0ab","submit");
};
