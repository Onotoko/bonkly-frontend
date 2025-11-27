export function EditProfilePage() {
    return (
        <div className="min-h-screen bg-white">
            <header className="p-4 border-b border-gray-100 flex items-center justify-between">
                <button className="text-gray-600">Cancel</button>
                <h1 className="font-heading font-bold">Edit Profile</h1>
                <button className="text-primary font-semibold">Save</button>
            </header>
            <div className="p-4">
                <p className="text-center text-gray-400 py-20">
                    Edit profile form will appear here
                </p>
            </div>
        </div>
    );
}
