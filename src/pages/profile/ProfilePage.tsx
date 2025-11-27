export function ProfilePage() {
    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-white p-4 border-b border-gray-100 flex items-center justify-between">
                <h1 className="text-xl font-heading font-bold">Profile</h1>
                <button className="text-gray-600">⚙️</button>
            </header>

            {/* Profile Info */}
            <div className="bg-white p-4">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full" />
                    <div>
                        <h2 className="font-bold text-lg">Bronkly</h2>
                        <p className="text-gray-500">@bronkly</p>
                    </div>
                </div>

                <p className="mt-4 text-gray-600">
                    Lorem ipsum is placeholder text commonly used in the graphic
                </p>

                <div className="flex gap-6 mt-4">
                    <div>
                        <span className="font-bold">100k</span>
                        <span className="text-gray-500 text-sm ml-1">Followers</span>
                    </div>
                    <div>
                        <span className="font-bold">100k</span>
                        <span className="text-gray-500 text-sm ml-1">Following</span>
                    </div>
                </div>

                <button className="mt-4 w-full h-10 border border-gray-200 rounded-full font-medium">
                    Edit profile
                </button>
            </div>

            {/* User's Memes Grid */}
            <div className="p-4">
                <p className="text-center text-gray-400 py-20">
                    User's memes grid will appear here
                </p>
            </div>
        </div>
    );
}
