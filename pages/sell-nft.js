import { Button, Form, useNotification } from "web3uikit"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import networkMapping from "../constants/networkMapping.json"
import basicNftAbi from "../constants/BasicNft.json"
import { ethers } from "ethers"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
export default function Home() {
    const { chainId,account,isWeb3Enabled } = useMoralis()
    const { runContractFunction } = useWeb3Contract()
    const dispatch = useNotification()
    const [proceeds, setProceeds] = useState("0")
    const chainIdString = chainId ? parseInt(chainId).toString() : "31337"
    const marketplaceAddress = networkMapping[chainIdString]["NftMarketplace"][0]

    const approveAndList = async (data) => {
        console.log("Approving...")
        const nftAddress = data.data[0].inputResult
        const tokenId = data.data[1].inputResult
        const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString()
        const approveOptions = {
            abi: basicNftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                tokenId,
            },
        }
        await runContractFunction({
            params: approveOptions,
            onError: (error) => console.log(error),
            onSuccess:()=> handleApproveSuccess(nftAddress, tokenId, price),
        })
    }
    async function handleApproveSuccess(nftAddress, tokenId, price) {
        console.log("Ok time to approve")
        const listOptions = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params: {
                nftAddress: nftAddress,
                tokenId: tokenId,
                price: price,
            },
        }
        await runContractFunction({
            params: listOptions,
            onError: (error) => console.log(error),
            onSuccess: handleListSuccess,
        })
    }
    async function handleListSuccess(tx) {
        await tx.wait(1)
        dispatch({
            position: "topR",
            message: "Nft listed",
            title: "Nft listing",
            type: "success",
        })
    }
    const setUpUI=async()=>{
       const returnedProceeds= await runContractFunction({
            params:{
                abi:nftMarketplaceAbi,
                contractAddress:marketplaceAddress,
                functionName:"getProceeds",
                params:{
                    seller:account
                }
            },
            onError:(error)=>console.log(error)
        })
          if (returnedProceeds) {
              setProceeds(returnedProceeds.toString())
               console.log("proceeds", returnedProceeds.toString())
          }
       
    }
    useEffect(()=>{
        if(isWeb3Enabled){
            setUpUI()
        }
    },[proceeds])
      const handleWithdrawSuccess = async (tx) => {
          await tx.wait(1)
          dispatch({
              type: "success",
              message: "Withdrawing proceeds",
              position: "topR",
          })
      }
    return (
        <div>
            <Form
                onSubmit={approveAndList}
                data={[
                    {
                        name: "Nft Address",
                        value: "",
                        type: "text",
                        width: "50%",
                        key: "nftAddress",
                    },
                    {
                        name: "token ID",
                        value: "",
                        type: "number",
                        width: "50%",
                        key: "tokenId",
                    },
                    {
                        name: "Price(ETH)",
                        value: "",
                        type: "number",
                        key: "price",
                    },
                ]}
                title="Sell your nfts"
                id="main form"
            ></Form>
            <div>Withdraw {proceeds} proceeds</div>
            {proceeds != "0" ? (
                <Button
                    onClick={() => {
                        runContractFunction({
                            params: {
                                abi: nftMarketplaceAbi,
                                contractAddress: marketplaceAddress,
                                functionName: "withdrawProceeds",
                                params: {},
                            },
                            onError: (error) => console.log(error),
                            onSuccess: handleWithdrawSuccess,
                        })
                    }}
                    text="Withdraw"
                    type="button"
                />
            ) : (
                <div>No proceeds detected</div>
            )}
        </div>
    )
}
