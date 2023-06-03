const Migrations = artifacts.require('BiometricContract');

module.exports = function (deployer) {
  deployer.deploy(Migrations);
};
