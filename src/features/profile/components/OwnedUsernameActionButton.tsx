import { useState, useCallback } from 'react'
import { useNameTradeList } from '@/hooks/contract/useNameTradeListingsMutations'
import { useNameTradeStartAuction } from '@/hooks/contract/useNameTradeAuctionsMutations'
import { parseEther, type Address } from 'viem'
import { useBaseAuth } from '@/hooks/auth/useBaseAuth'
import { getNameTradePublicClient, getNameTradeWalletClient } from '@/config/contract/client'
import { resolveNameTradeContractConfig } from '@/config/contract/config'
import ListModal from './ListModal'
import { ERC721_APPROVAL_ABI } from '../constant/approval.const'
import AuctionModal from './AuctionModal'

type ActionsProps = { contractAddress: string; tokenId: string }

function OwnedUsernameActions({ contractAddress, tokenId }: ActionsProps) {
  const [listError, setListError] = useState<string | null>(null)

  const [auctionError, setAuctionError] = useState<string | null>(null)

  const listMutation = useNameTradeList()
  const startAuctionMutation = useNameTradeStartAuction()
  const { switchToNameTradeChain } = useBaseAuth()

  const ensureApproved = useCallback(async (nftAddress: string) => {
    const publicClient = getNameTradePublicClient()
    const walletClient = getNameTradeWalletClient()
    if (!walletClient) throw new Error('Wallet unavailable')

    const [owner] = await walletClient.getAddresses()
    if (!owner) throw new Error('No wallet address available')

    const { address: operator, chain } = resolveNameTradeContractConfig()

    const approved = (await publicClient.readContract({
      address: nftAddress as Address,
      abi: ERC721_APPROVAL_ABI,
      functionName: 'isApprovedForAll',
      args: [owner as Address, operator as Address],
    })) as boolean

    if (!approved) {
      const hash = await walletClient.writeContract({
        address: nftAddress as Address,
        abi: ERC721_APPROVAL_ABI,
        functionName: 'setApprovalForAll',
        args: [operator as Address, true],
        account: owner,
        chain,
      })
      await publicClient.waitForTransactionReceipt({ hash })
    }
  }, [])

  const handleSubmitList = async (data: { price: number }) => {
    const { price } = data
    setListError(null)
    try {
      if (!price || Number(price) <= 0) {
        throw new Error('Enter a valid price in ETH.')
      }
      await switchToNameTradeChain()
      await ensureApproved(contractAddress)
      let tx = await listMutation
        .mutateAsync({
          nft: contractAddress,
          tokenId,
          price: parseEther(String(price)),
        })
        .catch(async (err) => {
          const msg = err instanceof Error ? err.message : String(err)
          const needsSwitch = /switch your wallet|wallet_switchethereumchain|chain/i.test(msg)
          if (needsSwitch) {
            await switchToNameTradeChain()
            await ensureApproved(contractAddress)
            return await listMutation.mutateAsync({
              nft: contractAddress,
              tokenId,
              price: parseEther(String(price)),
            })
          }
          throw err
        })
      await tx.waitForReceipt()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to list. Try again.'
      setListError(message)
    }
  }

  const handleSubmitAuction = async (data: { reservePrice: number; duration: number }) => {
    const { reservePrice, duration } = data
    setAuctionError(null)
    try {
      if (!reservePrice || Number(reservePrice) <= 0 || !duration || Number(duration) <= 0) {
        throw new Error('Enter a valid reserve price in ETH.')
      }
      await switchToNameTradeChain()
      await ensureApproved(contractAddress)
      let tx = await startAuctionMutation
        .mutateAsync({
          nft: contractAddress,
          tokenId,
          reservePrice: parseEther(String(reservePrice)),
          duration: duration,
        })
        .catch(async (err) => {
          const msg = err instanceof Error ? err.message : String(err)
          const needsSwitch = /switch your wallet|wallet_switchethereumchain|chain/i.test(msg)
          if (needsSwitch) {
            await switchToNameTradeChain()
            await ensureApproved(contractAddress)
            return await startAuctionMutation.mutateAsync({
              nft: contractAddress,
              tokenId,
              reservePrice: parseEther(String(reservePrice)),
              duration: duration,
            })
          }
          throw err
        })
      await tx.waitForReceipt()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start auction. Try again.'
      setAuctionError(message)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* <Modal
        trigger={
          <Button variant="secondary" size="sm" disabled={listMutation.isPending} loading={listMutation.isPending}>
            List
          </Button>
        }
        open={listOpen}
        onOpenChange={setListOpen}
      >
        <div className="flex flex-col gap-4">
          <Heading variant="h4" title="List Username" color="white" fontWeight={600} />
          <form className="flex flex-col gap-3" onSubmit={handleSubmitList}>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-300">Price (ETH)</span>
              <input
                type="number"
                step="any"
                min="0"
                value={listPrice}
                onChange={(e) => setListPrice(e.target.value)}
                className="w-full rounded-md border border-header bg-transparent px-3 py-2 text-white outline-none focus:border-primary"
                placeholder="0.00"
                required
              />
            </label>
            {listError && <span className="text-sm text-red-400">{listError}</span>}
            <div className="flex items-center gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setListOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={listMutation.isPending}>
                Confirm List
              </Button>
            </div>
          </form>
        </div>
      </Modal> */}
      <ListModal
        onSubmit={handleSubmitList}
        loading={listMutation.isPending}
        disabled={listMutation.isPending}
        error={listError}
        triggerSize="sm"
      />
      {/* 
      <Modal
        trigger={
          <Button
            variant="default"
            size="sm"
            disabled={startAuctionMutation.isPending}
            loading={startAuctionMutation.isPending}
          >
            Auction
          </Button>
        }
        open={auctionOpen}
        onOpenChange={setAuctionOpen}
      >
        <div className="flex flex-col gap-4">
          <Heading variant="h4" title="Start Auction" color="white" fontWeight={600} />
          <form className="flex flex-col gap-3" onSubmit={handleSubmitAuction}>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-300">Reserve Price (ETH)</span>
              <input
                type="number"
                step="any"
                min="0"
                value={reservePrice}
                onChange={(e) => setReservePrice(e.target.value)}
                className="w-full rounded-md border border-header bg-transparent px-3 py-2 text-white outline-none focus:border-primary"
                placeholder="0.00"
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-300">Duration (seconds)</span>
              <input
                type="number"
                min="1"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(e.target.value)}
                className="w-full rounded-md border border-header bg-transparent px-3 py-2 text-white outline-none focus:border-primary"
                placeholder="86400"
                required
              />
            </label>
            {auctionError && <span className="text-sm text-red-400">{auctionError}</span>}
            <div className="flex items-center gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setAuctionOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={startAuctionMutation.isPending}>
                Start Auction
              </Button>
            </div>
          </form>
        </div>
      </Modal> */}
      <AuctionModal
        onSubmit={handleSubmitAuction}
        loading={startAuctionMutation.isPending}
        disabled={startAuctionMutation.isPending}
        error={auctionError}
        triggerSize="sm"
      />
    </div>
  )
}

export default OwnedUsernameActions
