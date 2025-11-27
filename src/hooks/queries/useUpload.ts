import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { uploadService } from '../../services';

/**
 * Upload meme media (image or video)
 */
export const useUploadMedia = () => {
    const [progress, setProgress] = useState(0);

    const mutation = useMutation({
        mutationFn: (file: File) => uploadService.uploadMedia(file, setProgress),
        onSettled: () => setProgress(0),
    });

    return { ...mutation, progress };
};

/**
 * Upload avatar image
 */
export const useUploadAvatar = () => {
    const [progress, setProgress] = useState(0);

    const mutation = useMutation({
        mutationFn: (file: File) => uploadService.uploadAvatar(file, setProgress),
        onSettled: () => setProgress(0),
    });

    return { ...mutation, progress };
};