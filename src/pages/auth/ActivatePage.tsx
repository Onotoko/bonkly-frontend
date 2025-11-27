export function ActivatePage() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm space-y-8">
                {/* Hero */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-heading font-bold text-gray-900">
                        It's time to put your BONK where your meme is
                    </h1>
                    <p className="text-gray-600">
                        Deposit 40K BONK to unlock posting rights.
                    </p>
                </div>

                {/* Info */}
                <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">💪</span>
                        <span className="text-sm">80% becomes your Super Vote ammo</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">⚙️</span>
                        <span className="text-sm">20% keeps the meme servers running</span>
                    </div>
                </div>

                {/* Wallet Address */}
                <div className="space-y-2">
                    <p className="text-sm text-gray-500 text-center">
                        Send BONK to this address:
                    </p>
                    <div className="bg-gray-100 rounded-xl p-3 flex items-center gap-2">
                        <code className="flex-1 text-xs truncate">
                            12903jklsadjksadhasdy7829389324214sdsdf
                        </code>
                        <button className="text-primary text-sm font-medium">Copy</button>
                    </div>
                </div>

                {/* Proceed Button */}
                <button className="w-full h-12 bg-primary text-white font-semibold rounded-full">
                    I've Bonked → Proceed
                </button>
            </div>
        </div>
    );
}
