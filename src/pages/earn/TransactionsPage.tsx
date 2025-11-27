export function TransactionsPage() {
    return (
        <div className="min-h-screen bg-white">
            <header className="sticky top-0 bg-white border-b border-gray-100 p-4">
                <button className="text-gray-600">← Back</button>
                <h1 className="font-heading font-bold mt-2">Transaction History</h1>
            </header>
            <div className="p-4">
                <p className="text-center text-gray-400 py-20">
                    Transaction history will appear here
                </p>
            </div>
        </div>
    );
}
