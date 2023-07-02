const BonafydeToken = artifacts.require('BonafydeToken');
const truffleAssert = require('truffle-assertions');
let correctUnlockCode = web3.utils.sha3('test'); //test is the password
let timestampLockedFrom = Math.round(Date.now() / 1000) + 3; //lock it in 3 seconds to test unlock
let unlockCodeHash = web3.utils.sha3(correctUnlockCode); //double hashed
contract('BonafydeToken: test mint and lock', (accounts) => {
    const [deployerAddress, tokenHolderOneAddress, tokenHolderTwoAddress] = accounts;
    it('is possible to mint tokens for the minter role and royalties available', async () => {
        let token = await BonafydeToken.deployed();
        await token.mint(tokenHolderOneAddress, timestampLockedFrom, unlockCodeHash); //minting works
        // let id = await token.getCurrentID()-1;
        // assert.equal(id, 0);
        //royalties wont work with mintable up
        token.setRoyalties(0, accounts[0], 1000);
        token.getRaribleV2Royalties(0);
        await truffleAssert.fails(token.transferFrom(deployerAddress, tokenHolderOneAddress, 0)); //transferring for others doesn't work
        //but transferring in general works
        await truffleAssert.passes(
            token.transferFrom(tokenHolderOneAddress, tokenHolderTwoAddress, 0, { from: tokenHolderOneAddress }),
        );
    });
    it('is not possible to transfer locked tokens', async () => {
        //unless we wait 4 seconds and the token will be locked
        let token = await BonafydeToken.deployed();
        await new Promise((res) => {
            setTimeout(res, 4000);
        });
        await truffleAssert.fails(
            token.transferFrom(tokenHolderTwoAddress, tokenHolderOneAddress, 0, { from: tokenHolderTwoAddress }),
            truffleAssert.ErrorType.REVERT,
            'BonafydeToken: Token locked',
        );
    });
    it('is not possible to unlock tokens for anybody else than the token holder', async () => {
        let token = await BonafydeToken.deployed();
        await truffleAssert.fails(
            token.unlockToken(correctUnlockCode, 0, { from: deployerAddress }),
            truffleAssert.ErrorType.REVERT,
            'BonafydeToken: Only the Owner can unlock the Token',
        );
    });
    it('is not possible to unlock tokens without the correct unlock code', async () => {
        let token = await BonafydeToken.deployed();
        let wrongUnlockCode = web3.utils.sha3('Santa Lucia');
        await truffleAssert.fails(
            token.unlockToken(wrongUnlockCode, 0, { from: tokenHolderTwoAddress }),
            truffleAssert.ErrorType.REVERT,
            'BonafydeToken: Unlock Code Incorrect',
        );
        await truffleAssert.passes(token.unlockToken(correctUnlockCode, 0, { from: tokenHolderTwoAddress }));
        await truffleAssert.passes(
            token.transferFrom(tokenHolderTwoAddress, deployerAddress, 0, { from: tokenHolderTwoAddress }),
        );
    });
    it('is possible to unlock the token and transfer it again', async () => {
        let token = await BonafydeToken.deployed();
        await truffleAssert.passes(token.unlockToken(correctUnlockCode, 0, { from: deployerAddress }));
        await truffleAssert.passes(
            token.transferFrom(deployerAddress, tokenHolderTwoAddress, 0, { from: deployerAddress }),
        );
        let tokenOwner = await token.ownerOf(0);
        assert.equal(tokenOwner, tokenHolderTwoAddress, 'The Owner is not the correct address');
    });
    it('is possible to retrieve the correct token URI and ID', async () => {
        let token = await BonafydeToken.deployed();
        let metadata = await token.tokenURI(0);
        assert.equal("https://bonafyde.io/metadata/0.json", metadata);
        
        // assert.equal('https://gateway.pinata.cloud/ipfs/abc', metadata);
    })
});