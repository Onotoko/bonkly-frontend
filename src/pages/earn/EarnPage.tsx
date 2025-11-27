export function EarnPage() {
    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-white p-4 border-b border-gray-100">
                <h1 className="text-xl font-heading font-bold">Earn</h1>
            </header>

            {/* Balance Cards */}
            <div className="p-4 space-y-4">
                {/* BONK Balance */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">Your Earnings</p>
                    <p className="text-3xl font-bold">100.3 K</p>
                    <p className="text-xs text-gray-400">Balance</p>
                </div>

                {/* Laugh Power */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">Laugh Power</p>
                    <p className="text-3xl font-bold">378k <span className="text-sm">dBonk</span></p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button className="h-12 bg-secondary text-white rounded-xl font-medium">
                        Add BONK
                    </button>
                    <button className="h-12 bg-primary text-white rounded-xl font-medium">
                        Withdraw BONK
                    </button>
                </div>

                {/* Rewards Section */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <p className="font-semibold">Rewards</p>
                        <button className="text-primary text-sm">Claim All</button>
                    </div>
                    <p className="text-center text-gray-400 py-8">
                        Your rewards will appear here
                    </p>
                </div>
            </div>
        </div>
    );
}