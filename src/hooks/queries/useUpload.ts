import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { uploadService } from '../../services';

export const useUploadImage = () => {
    const [progress, setProgress] = useState(0);

    const mutation = useMutation({
        mutationFn: (file: File) => uploadService.image(file, setProgress),
        onSettled: () => setProgress(0),
    });

    return { ...mutation, progress };
};

export const useUploadVideo = () => {
    const [progress, setProgress] = useState(0);

    const mutation = useMutation({
        mutationFn: (file: File) => uploadService.video(file, setProgress),
        onSettled: () => setProgress(0),
    });

    return { ...mutation, progress };
};