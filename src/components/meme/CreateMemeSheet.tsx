import { useNavigate } from 'react-router-dom';
import { Upload, Sparkles } from 'lucide-react';
import { BottomSheet, Button } from '@/components/ui';

interface CreateMemeSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateMemeSheet({ isOpen, onClose }: CreateMemeSheetProps) {
    const navigate = useNavigate();

    const handleUpload = () => {
        onClose();
        navigate('/create?mode=upload');
    };

    const handleAI = () => {
        onClose();
        navigate('/create?mode=ai');
    };

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} title="How do you want to meme today?">
            <div className="space-y-3 p-4">
                {/* Upload option */}
                <button
                    onClick={handleUpload}
                    className="flex w-full items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 text-left transition-colors hover:bg-gray-50"
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7CB342]/10">
                        <Upload className="h-6 w-6 text-[#7CB342]" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Upload Media</h3>
                        <p className="text-sm text-gray-500">
                            Upload Image or Video
                        </p>
                        <p className="text-xs text-[#7CB342]">
                            Free. Instant. No credits needed.
                        </p>
                    </div>
                </button>

                {/* AI option */}
                <button
                    onClick={handleAI}
                    className="flex w-full items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 text-left transition-colors hover:bg-gray-50"
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E53935]/10">
                        <Sparkles className="h-6 w-6 text-[#E53935]" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Generate with AI</h3>
                        <p className="text-sm text-gray-500">
                            Costs Credits (powered by BONK)
                        </p>
                    </div>
                </button>

                {/* Cancel */}
                <Button
                    variant="ghost"
                    onClick={onClose}
                    className="w-full text-gray-500"
                >
                    Cancel
                </Button>
            </div>
        </BottomSheet>
    );
}