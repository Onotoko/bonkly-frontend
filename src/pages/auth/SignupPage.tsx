export function SignupPage() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-heading font-bold text-gray-900">
                        Almost there!
                    </h1>
                    <p className="text-gray-600">
                        Choose your username to complete signup.
                    </p>
                </div>

                {/* Username Input */}
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="@username"
                        className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl"
                    />
                </div>

                <button className="w-full h-12 bg-primary text-white font-semibold rounded-full">
                    Continue
                </button>
            </div>
        </div>
    );
}