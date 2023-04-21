

//import { SDK, Auth, TEMPLATES, Metadata } from '@infura/sdk';
require("dotenv").config();
infurasdk = require("@infura/sdk");
// require("@infura/sdk").Auth;

const auth = new infurasdk.Auth({
    projectId: "c8e2eac8938941cda5f51781e16d9711",
    secretId: "d1a19b9d221f4156b08fbc24b82e052d",
    privateKey: process.env.PRIVATE_KEY,
    chainId: 5,
  });

const sdk = new infurasdk.SDK(auth);

const tokenMetadata = sdk.api.getTokenMetadata({
    contractAddress: "0xb96fe037039Ef375150a3D70095B8990Bd3c1a55",
    tokenId: 0
  });
console.log('Token Metadata: \n', tokenMetadata);