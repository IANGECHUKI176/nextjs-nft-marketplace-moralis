import { ConnectButton } from "web3uikit"
import Link from "next/link"
const Header = () => {
    return (
        <nav className="py-5 border-b-2 flex items-center justify-between">
            <h1 className="py-4 px-4 text-3xl font-bold">Nft Marketplace</h1>
            <div className="flex items-center justify-between space-x-6">
                {" "}
                <Link href="/">Home</Link>
                <Link href="/sell-nft">Sell nft </Link>
                <ConnectButton moralisAuth={false}/>
            </div>
        </nav>
    )
}

export default Header
