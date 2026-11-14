import reference from '../../public/deployments/native-near.json';

export const deploymentReference = reference;
export const accountExplorer = (account: string) => 'https://testnet.nearblocks.io/address/' + encodeURIComponent(account);
export const transactionExplorer = (hash: string) => 'https://testnet.nearblocks.io/txns/' + encodeURIComponent(hash);
export const blockExplorer = (height: number) => 'https://testnet.nearblocks.io/blocks/' + height;
