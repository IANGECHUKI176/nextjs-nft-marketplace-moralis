//create new table called "ActiveItem"
//Add items when they are listed on the marketplace
//remove items when they are removed from the marketplace

//const { default: Moralis } = require("moralis/types")

Moralis.Cloud.afterSave("ItemListed", async (request) => {
    //every event get triggered twice ->once on unconfirmed and once on confirmed
    const confirmed = request.object.get("confirmed")
    const logger = Moralis.Cloud.getLogger()
    logger.info("looking for confirmed tx...")
    if (confirmed) {
        logger.info("found item")
        const ActiveItem = Moralis.Object.extend("ActiveItem")

        // In case of listing update, search for already listed ActiveItem and delete
        const query = new Moralis.Query(ActiveItem)
        query.equalTo("nftAddress", request.object.get("nftAddress"))
        query.equalTo("tokenId", request.object.get("tokenId"))
        query.equalTo("marketplaceAddress", request.object.get("address"))
        query.equalTo("seller", request.object.get("seller"))
        logger.info(`Marketplace | Query: ${query}`)
        const alreadyListedItem = await query.first()
        console.log(`alreadyListedItem ${JSON.stringify(alreadyListedItem)}`)
        if (alreadyListedItem) {
            logger.info(`Deleting already listed :${request.object.get("tokenId")}`)
            alreadyListedItem.destroy()
            logger.info(
                `Deleted item with tokenId :${request.object.get(
                    "tokenId"
                )} at address:${request.object.get("address")} since the listing is being updated.`
            )
        }
        //add newItem
        const activeItem = new ActiveItem()
        activeItem.set("marketplaceAddress", request.object.get("address"))
        activeItem.set("nftAddress", request.object.get("nftAddress"))
        activeItem.set("tokenId", request.object.get("tokenId"))
        activeItem.set("seller", request.object.get("seller"))
        activeItem.set("price", request.object.get("price"))
        logger.info(
            `Adding address: ${request.object.get("address")},TokenId :${request.object.get(
                "tokenId"
            )}`
        )
        logger.info("saving...")
        await activeItem.save()
    }
})

Moralis.Cloud.afterSave("ItemCanceled", async (request) => {
    const confirmed = request.object.get("confirmed")
    const logger = Moralis.Cloud.getLogger()
    logger.info(`Marketplace | Object ${request.object}`)
    if (confirmed) {
        const ActiveItem = Moralis.Object.extend("ActiveItem")
        const query = new Moralis.Query(ActiveItem)
        query.equalTo("marketplaceAddress", request.object.get("address"))
        query.equalTo("nftAddress", request.object.get("nftAddress"))
        query.equalTo("tokenId", request.object.get("tokenId"))
        logger.info(`marketplace | Query:${query}`)
        const canceledItem = await query.first()

        logger.info(`marketplace | Canceled :${JSON.stringify(canceledItem)}`)

        if (canceledItem) {
            logger.info(
                `Deleting ${request.object.get("tokenId")} from address ${request.object.get(
                    "address"
                )} since it was canceled`
            )
            await canceledItem.destroy()
        } else {
            logger.info(
                `No item found with address: ${request.object.get(
                    "address"
                )} and tokenId :${request.object.get("tokenId")}`
            )
        }
    }
})

Moralis.Cloud.afterSave("ItemBought", async (request) => {
    const confirmed = request.object.get("confirmed")
    const logger = Moralis.Cloud.getLogger()
    logger.info(`marketplace | object ${request.object}`)
    if (confirmed) {
        logger.info("found item")
        const ActiveItem = Moralis.Object.extend("ActiveItem")
        const query = new Moralis.Query(ActiveItem)
        query.equalTo("marketplaceAddress", request.object.get("address"))
        query.equalTo("nftAddress", request.object.get("nftAddress"))
        query.equalTo("tokenId", request.object.get("tokenId"))
        logger.info(`marketplace | Query:${query}`)
        const boughtItem = await query.first()

        logger.info(`Marketplace | boughtItem: ${JSON.stringify(boughtItem)}`)
        if (boughtItem) {
            logger.info(`Deleting ${request.object.get("tokenId")}`)
            await boughtItem.destroy()
            logger.info(
                `Deleted item with tokenId ${request.object.get(
                    "tokenId"
                )} at address ${request.object.get("address")}`
            )
        } else {
            logger.info(
                `No item found at address :${request.object.get(
                    "address"
                )} and tokenId:${request.object.get("tokenid")}`
            )
        }
    }
})
