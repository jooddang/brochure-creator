
import React, { useState, useRef } from 'react';
import { ImageFile } from '../types';
import { UploadIcon, CheckCircleIcon, XCircleIcon } from './icons';

interface ImageUploaderProps {
    id: string;
    label: string;
    onImageUpload: (file: ImageFile | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, onImageUpload }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('이미지 파일만 업로드할 수 있습니다.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                setPreview(reader.result as string);
                setFileName(file.name);
                onImageUpload({ base64: base64String, mimeType: file.type });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClear = () => {
        setPreview(null);
        setFileName(null);
        onImageUpload(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="w-full">
            <label htmlFor={id} className="block text-md font-medium text-gray-700 mb-2">{label}</label>
            {preview ? (
                <div className="relative group w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex justify-center items-center">
                    <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain rounded-lg"/>
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <button onClick={handleClear} className="bg-red-500 text-white rounded-full p-3 hover:bg-red-600 transition-colors">
                            <XCircleIcon className="w-8 h-8"/>
                        </button>
                    </div>
                </div>
            ) : (
                <div 
                    className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col justify-center items-center text-center p-4 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <UploadIcon className="w-12 h-12 text-gray-400 mb-2"/>
                    <span className="text-sm text-gray-600">클릭하거나 파일을 드래그하여 업로드</span>
                    <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</span>
                </div>
            )}
            <input
                id={id}
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />
            {fileName && (
                <div className="mt-2 flex items-center text-sm text-green-600">
                    <CheckCircleIcon className="w-5 h-5 mr-2"/>
                    <span>{fileName}</span>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
