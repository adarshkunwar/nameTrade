# NameTrade – Technical Documentation

## Overview
NameTrade is a decentralized Basenames NFT marketplace on Base. The app comprises a React + TypeScript frontend (Vite) that integrates with a NameTrade Solidity contract (Foundry) and external GraphQL data sources for collection/item data. State is managed with Redux Toolkit and React Query; wallet and chain connectivity uses Wagmi + Viem.


## Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, React Router, React Query, Redux Toolkit
- **Web3**: wagmi, viem (public/wallet clients), Base chains, coinbase wallet integration
- **Backend/Contracts**: Solidity (Foundry), OpenZeppelin
- **APIs/Data**: GraphQL endpoints (collection/profile items), axios/fetch

## Smart Contracts (Foundry)
- Workspace in `server/` with `foundry.toml`, contracts in `server/src/`, tests in `server/test/`.
- Common tasks:
  - Build: `forge build`
  - Test: `forge test`
  - Anvil local node: `anvil`
- Frontend constants generator: `server/script/generateConstants.mjs`
  - Reads `server/out/NameTrade.sol/NameTrade.json` ABI
  - Writes `src/constants/abi.json` and `src/constants/index.ts`
  - Default testnet contract address is set in the script; adjust as needed



## Contract Integration
- Resolve config: `src/config/contract/config.ts`
  - Networks: `mainnet` (Base) and `testnet` (Base Sepolia)
  - Addresses: from `src/constants/index.ts` (`NAME_TRADE_MAINNET_CONTRACT_ADDRESS`, `NAME_TRADE_CONTRACT_TESTNET_ADDRESS`)
  - ABI: from `src/constants/abi.json`
  - Default RPCs use env overrides or sane defaults.
- Clients: `src/config/contract/client.ts`
  - Public client: cached by network+rpc URL
  - Wallet client: constructed from `window.nameTradeProvider` (or returns null if absent)
- Hooks:
  - `useNameTradeContract` returns `{ config, publicClient, walletClient }`
  - `useNameTradeRead<T>` wraps `publicClient.readContract` with React Query
  - `useNameTradeWriteMutation` wraps `walletClient.writeContract` and handles:
    - Chain checks and EIP-1193 `wallet_switchEthereumChain`/`wallet_addEthereumChain`
    - Address requesting via `requestAddresses`
    - Optional value and invalidations
    - wallet connection via **coinbase wallet**



# Routes:
  - `/` → `features/home`
  - `/username/:tokenId` → `features/username`
  - `/profile/:walletAddress` → `features/profile`



## State & Data Layer
- **Redux Toolkit**: `config/store.ts`, `config/store/authSlice.ts`
  - Auth state is persisted with `encryptedLocalStorage` (keys: `accessToken`, `guestToken`, `wallet_address`, etc.).
  - `useAuth` hook exposes `signIn`/`signOut` and derived state, backed by `hooks/auth/api.ts` (mocked for now).
- **React Query**: Configured in `main.tsx` with sensible defaults (no retry, no refetch on focus). Used heavily for reads from Viem and GraphQL.


## Off-chain Data (GraphQL)
- Home collection items:
  - Endpoint and query: `features/home/constant/query.const.ts`
  - Fetchers: `features/home/api/collection.api.ts` (axios) and `features/home/api/collectionItems.ts` (fetch)
  - Service interface: `features/home/services/CollectionService.ts`
- Profile items:
  - Endpoint and query: `features/profile/constant/query.const.ts`
  - Service: `features/profile/services/ProfileItemsService.ts`

Both GraphQL modules read `VITE_COLLECTION_ITEMS_ENDPOINT` with default `https://gql.opensea.io/graphql`.


## UI & Components
- Layout: `components/layout/Layout.tsx`, `components/layout/Header.tsx`, `components/layout/page404.tsx`
- UI primitives: `components/ui/*` (Button, Modal, Table, Tabs, etc.)
- Feature components: `features/*/components/*`


## Path Aliases (Vite)
Configured in `vite.config.ts`:
- `@` → `src`
- `@components`, `@ui`, `@layout`, `@utils`, `@hooks`, `@services`, `@types`, `@features`, `@config`

Use these imports instead of relative deep paths.


## Development
- Install: `yarn install`
- Dev server: `yarn dev`
- Lint: `yarn lint`
- Build: `yarn build`
- Preview: `yarn preview`



## Configuration Details
- Wagmi (`src/config/wagmi.ts`):
  - Chains: `mainnet`, `base`
  - Transports: `http()` per chain (env-configurable via Viem clients)
- Contract defaults (`src/config/contract/config.ts`):
  - `resolveDefaultNetwork()` currently returns `'mainnet'`
  - Override per-call via `network` or `rpcUrlOverride`


## Security Considerations
- Secret handling: `VITE_SECRET_KEY` secures `encryptedLocalStorage`. Ensure it’s set in production builds.
- Provider access: wallet methods are gated and validated; chain switching is attempted with fallbacks.
- Never commit real private keys; use environment-based RPCs and wallet providers.


## Extending the App
- Add a contract read:
  - Use `useNameTradeRead` with `functionName` and `args`
  - Provide a `select` to shape the result
- Add a contract write:
  - Use `useNameTradeWriteMutation({ functionName, getArgs, getValue, invalidateQueries })`
  - Handle UI states with `mutation.isPending/isError/isSuccess`
- Add a new route:
  - Append to `RouteList` and create the feature module under `src/features/<name>`


## Troubleshooting
- Wallet client is null: ensure `window.nameTradeProvider` or integrate Wagmi connectors for end-user wallets.
- Wrong chain errors: app will request `wallet_switchEthereumChain`; ensure RPC URLs are correct.
- GraphQL errors: verify `VITE_COLLECTION_ITEMS_ENDPOINT`; inspect server responses for `errors[]`.

