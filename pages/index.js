import { useMoralis, useMoralisQuery } from "react-moralis"
import NFTBox from "../components/NftBox"
export default function Home() {
    //how do we show recently listed nfts
    //we will index the events off-chain adn then read from our database
    //set up a server to listen from those events to be fired and we will add them to a database to query
    const { isWeb3Enabled, account } = useMoralis()
    const { data: listedNfts, isFetching: fetchingListedNfts } = useMoralisQuery(
        //tableName
        //function for the query
        "ActiveItem",
        (query) => query.limit(10).descending("tokenId")
    )

    return (
        <div className="container mx-auto">
            <h1 className="py-4 px-4 font-bold text-2xl">Recently listed</h1>
            <div className="grid grid-cols-3 gap-5">
                {isWeb3Enabled ? (
                    <>
                        {" "}
                        {fetchingListedNfts ? (
                            <div>Loading...</div>
                        ) : (
                            listedNfts.map((nft) => {
                                const { seller, price, tokenId, nftAddress, marketplaceAddress } =
                                    nft.attributes

                                return (
                                    <NFTBox
                                        key={nft.id}
                                        seller={seller}
                                        tokenId={tokenId}
                                        price={price}
                                        nftAddress={nftAddress}
                                        marketplaceAddress={marketplaceAddress}
                                    />
                                )
                            })
                        )}
                    </>
                ) : (
                    <div>Web 3 currently not enabled</div>
                )}
            </div>
        </div>
    )
}
