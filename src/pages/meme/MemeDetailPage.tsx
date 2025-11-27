export function MemeDetailPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 bg-white border-b border-gray-100 z-10 p-4">
                <button className="text-gray-600">← Back</button>
            </header>

            {/* Content */}
            <div className="p-4">
                <p className="text-center text-gray-400 py-20">
                    Meme detail will appear here
                </p>
            </div>
        </div>
    );
}