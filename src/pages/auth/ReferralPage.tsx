export function ReferralPage() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm space-y-8">
                {/* Hero */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-heading font-bold text-gray-900">
                        Access denied to normies
                    </h1>
                    <p className="text-gray-600">
                        Got the code? Prove your meme worth.
                    </p>
                </div>

                {/* Referral Code Input */}
                <div className="space-y-4">
                    <div className="text-center text-sm text-gray-500">
                        Your alphanumeric proof of coolness
                    </div>
                    {/* OTP Input placeholder */}
                    <div className="flex justify-center gap-2">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="w-12 h-14 border-2 border-gray-200 rounded-lg"
                            />
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <button className="w-full h-12 bg-primary text-white font-semibold rounded-full">
                    Unlock the chaos
                </button>

                {/* Help text */}
                <p className="text-center text-sm text-gray-400">
                    No code? Beg someone on X or Telegram
                </p>
            </div>
        </div>
    );
}