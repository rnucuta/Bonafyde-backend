const BFToken = artifacts.require("BonafydeToken");

module.exports = function (deployer) {
  deployer.deploy(BFToken);
};