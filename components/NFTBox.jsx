import { useMoralis, useWeb3Contract } from "react-moralis"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import nftAbi from "../constants/BasicNft.json"
import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, useNotification } from "web3uikit"
import { ethers } from "ethers"
import UpdateListingModal from "./UpdateListingModal"
function truncateStr(fullStr, strLen) {
    if (fullStr.length < strLen) return fullStr
    const separator = "..."
    const separatorLength = separator.length

    const charsToShow = strLen - separatorLength
    const frontChars = Math.floor(charsToShow / 2)
    const backChars = Math.ceil(charsToShow / 2)
    return fullStr.substr(0, frontChars) + separator + fullStr.substr(fullStr.length - backChars)
}
export default function NFTBox({ price, tokenId, nftAddress, marketplaceAddress, seller }) {
    const [imageUri, setImageUri] = useState("")
    const [tokenDescription, setTokenDescription] = useState("")
    const [tokenName, setTokenName] = useState("")
    const { isWeb3Enabled, account } = useMoralis()
    const [showModal, setShowModal] = useState(false)
    const dispatch=useNotification()
    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: nftAbi,
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId: tokenId,
        },
    })
    const { runContractFunction: buyItem } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "buyItem",
        msgValue: price,
        params: {
            tokenId,
            nftAddress,
        },
    })

    const updateUI = async () => {
        const tokenURI = await getTokenURI()
        if (tokenURI) {
            //IPFS Gateway :server that returns IPFS files from http request
            const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")

            const tokenResponse = await (await fetch(requestURL)).json()
            const imageUri = tokenResponse.image
            const imageUriUrl = imageUri.replace("ipfs://", "https://ipfs.io/ipfs/")
            setImageUri(imageUriUrl)
            setTokenDescription(tokenResponse.description)
            setTokenName(tokenResponse.name)
            //we could render image on server and just call our server
            //only for testnets and mainnets-moralis hooks
        }
    }
    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])
    const isOwnedByUser = seller === account || seller === undefined

    const formattedSellerAddress = isOwnedByUser ? "you" : truncateStr(seller || "", 13)

    const handleBuyItemSuccess=async(tx)=>{
        await tx.wait(1)
        dispatch({
            position:"topR" ,
            type:"success",
            message:"Item bought",
            title:"item bought"
        })
    }
    const handleCardClick = () => {
        isOwnedByUser
            ? setShowModal(!showModal)
            : buyItem({ onError: (error) => console.log(error),onSuccess:handleBuyItemSuccess })
    }
    
    return (
        <div>
            <div>
                {imageUri ? (
                    <div>
                        <UpdateListingModal
                            isVisible={showModal}
                            nftAddress={nftAddress}
                            tokenId={tokenId}
                            onClose={() => setShowModal(!showModal)}
                            marketplaceAddress={marketplaceAddress}
                        />
                        <Card
                            title={tokenName}
                            description={tokenDescription}
                            onClick={handleCardClick}
                        >
                            <div className="flex flex-col items-end gap-2 p-2">
                                <div>#{tokenId}</div>
                                <div className="italic text-sm">
                                    Owned by {formattedSellerAddress}
                                </div>
                                <Image
                                    loader={() => imageUri}
                                    src={imageUri}
                                    height={"100"}
                                    width={"100"}
                                />
                                <div className="font-bold">
                                    {ethers.utils.formatUnits(price, "ether")} ETH
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <>Loading...</>
                )}
            </div>
        </div>
    )
}
