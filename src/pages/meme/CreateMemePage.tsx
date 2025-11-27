export function CreateMemePage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 bg-white border-b border-gray-100 z-10 p-4 flex items-center justify-between">
                <button className="text-gray-600">Cancel</button>
                <h1 className="font-heading font-bold">Create Meme</h1>
                <button className="text-primary font-semibold">Post</button>
            </header>

            {/* Content */}
            <div className="p-4">
                <p className="text-center text-gray-400 py-20">
                    Create meme flow will appear here
                </p>
            </div>
        </div>
    );
}