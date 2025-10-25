import fs from 'fs/promises';
import path from 'path';

const CONTRACT_ARTIFACT_PATH = path.resolve(process.cwd(), '../server/out/NameTrade.sol/NameTrade.json');
const FRONTEND_CONSTANTS_DIR = path.resolve(process.cwd(), '../src/constants');
const ABI_FILE_PATH = path.resolve(FRONTEND_CONSTANTS_DIR, 'abi.json');
const INDEX_FILE_PATH = path.resolve(FRONTEND_CONSTANTS_DIR, 'index.ts');

const SEPOLIA_CONTRACT_ADDRESS = '0x2A6f460129DBAeB66Fda5FcbD5b3b0CCf7791Bfd';

async function main() {
    try {
        console.log('Reading contract artifact...');
        const artifactContent = await fs.readFile(CONTRACT_ARTIFACT_PATH, 'utf-8');
        const { abi } = JSON.parse(artifactContent);

        console.log(`Ensuring directory exists: ${FRONTEND_CONSTANTS_DIR}`);
        await fs.mkdir(FRONTEND_CONSTANTS_DIR, { recursive: true });

        console.log(`Writing ABI to ${ABI_FILE_PATH}`);
        await fs.writeFile(ABI_FILE_PATH, JSON.stringify(abi, null, 2));

        console.log(`Creating constants file at ${INDEX_FILE_PATH}`);
        const indexContent = `import abi from './abi.json';

export const NAME_TRADE_CONTRACT_ADDRESS = '${SEPOLIA_CONTRACT_ADDRESS}';
export const NAME_TRADE_ABI = abi;
`;
        await fs.writeFile(INDEX_FILE_PATH, indexContent);

        console.log('✅ Successfully generated frontend constants!');

    } catch (error) {
        console.error('❌ Error generating frontend constants:', error);
        process.exit(1);
    }
}

main();
