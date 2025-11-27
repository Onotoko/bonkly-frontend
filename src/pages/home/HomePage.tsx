export function HomePage() {
    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 bg-white border-b border-gray-100 z-10">
                <div className="flex items-center justify-between p-4">
                    <h1 className="text-xl font-heading font-bold text-primary">Bonkly</h1>
                    <button className="p-2">
                        {/* Search/Notifications icon */}
                    </button>
                </div>

                {/* Feed Tabs */}
                <div className="flex px-4 gap-2 pb-3">
                    {['Trending', 'New', 'For You'].map((tab) => (
                        <button
                            key={tab}
                            className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600"
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            {/* Feed Content */}
            <div className="p-4 space-y-4">
                <p className="text-center text-gray-400 py-20">
                    Meme feed will appear here
                </p>
            </div>
        </div>
    );
}