export function ActivateSuccessPage() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm space-y-8 text-center">
                {/* Success Icon */}
                <div className="text-6xl">🎉</div>

                {/* Hero */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-heading font-bold text-gray-900">
                        You did it, Meme Overlord
                    </h1>
                    <p className="text-gray-600">
                        Your BONK has landed, your Laughs are loaded, and your meme wallet
                        is live.
                    </p>
                </div>

                {/* Info */}
                <p className="text-sm text-gray-500">
                    You can now post, Love, and Laugh your way to fame (and BONK).
                </p>

                {/* CTA */}
                <button className="w-full h-12 bg-secondary text-white font-semibold rounded-full">
                    Start Laughing →
                </button>

                <p className="text-sm text-gray-400">
                    Post your first meme and make the internet lose it.
                </p>
            </div>
        </div>
    );
}
