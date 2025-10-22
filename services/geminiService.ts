
import { ImageFile } from '../types';

export async function generateBrochure(
    productImage: ImageFile,
    backgroundOption: 'upload' | 'describe',
    backgroundImage: ImageFile | null,
    backgroundDescription: string,
    promoText: string,
    personImage: ImageFile | null,
    fontStyle: string,
    fontColor: string,
    brochureStyle: string,
    generateVariations: boolean
): Promise<string> {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productImage,
                backgroundOption,
                backgroundImage,
                backgroundDescription,
                promoText,
                personImage,
                fontStyle,
                fontColor,
                brochureStyle,
                generateVariations,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || '알 수 없는 서버 오류가 발생했습니다.');
        }

        return result.imageUrl;

    } catch (error) {
        console.error("Error calling /api/generate:", error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("알 수 없는 오류가 발생했습니다.");
    }
}
