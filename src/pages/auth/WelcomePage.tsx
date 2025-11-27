export function WelcomePage() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm space-y-8">
                {/* Hero */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-heading font-bold text-gray-900">
                        Welcome, degen.
                    </h1>
                    <p className="text-gray-600">
                        You're one BONK away from monetizing your meme addiction.
                    </p>
                </div>

                {/* OAuth Buttons */}
                <div className="space-y-3">
                    <button className="w-full h-12 bg-secondary text-white font-semibold rounded-full flex items-center justify-center gap-3">
                        {/* Google Icon */}
                        <span>Sign in with Google</span>
                    </button>

                    <button className="w-full h-12 bg-primary text-white font-semibold rounded-full flex items-center justify-center gap-3">
                        {/* Apple Icon */}
                        <span>Sign in with Apple</span>
                    </button>
                </div>
            </div>
        </div>
    );
}