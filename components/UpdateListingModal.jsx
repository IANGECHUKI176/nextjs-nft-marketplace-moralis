import { useState } from "react"
import { Modal, Input, useNotification } from "web3uikit"
import { useWeb3Contract } from "react-moralis"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import { ethers } from "ethers"
const UpdateListingModal = ({ nftAddress, tokenId, isVisible, onClose, marketplaceAddress }) => {
    const [priceUpdate, setPriceUpdate] = useState("")
    const dispatch = useNotification()
    const { runContractFunction: updateListing } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "updateListing",
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
            newPrice: ethers.utils.parseEther(priceUpdate || "0"),
        },
    })
    const handleUpdateListingSuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            position: "topR",
            message: "Listing updated",
            type: "success",
            title: "Please referesh and move blocks",
        })
        setPriceUpdate("0")
        onClose && onClose()
    }
   
    return (
        <Modal
            isVisible={isVisible}
            onCancel={onClose}
            onCloseButtonPressed={onClose}
            onOk={() => {
                updateListing({
                    onError: (error) => console.log(error),
                    onSuccess: handleUpdateListingSuccess,
                })
            }}
        >
            <h1>id:{tokenId}</h1>
            <Input
                type="number"
                name="newListing price"
                label="Update listing price in ETH"
                onChange={(e) => setPriceUpdate(e.target.value)}
            />
        </Modal>
    )
}

export default UpdateListingModal
