import { GoogleGenAI, Modality, Part } from "@google/genai";
import { ImageFile } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
        const model = 'gemini-2.5-flash-image';
        const parts: Part[] = [];
        
        let prompt = `
        당신은 의류 상품을 위한 홍보 브로슈어를 만드는 전문 그래픽 디자이너입니다.
        여러 이미지를 입력받아 하나의 완성된 브로슈어 이미지를 생성해야 합니다.
        `;

        // 1. Product Image
        parts.push({
            inlineData: {
                mimeType: productImage.mimeType,
                data: productImage.base64,
            },
        });
        prompt += "\n- 첫 번째 이미지는 홍보할 주요 의류 상품입니다.";

        let imageCounter = 1;

        // 2. Person Image
        if (personImage) {
            imageCounter++;
            parts.push({
                inlineData: {
                    mimeType: personImage.mimeType,
                    data: personImage.base64,
                },
            });
            prompt += `\n- ${imageCounter}번째 이미지는 모델입니다. 이 모델이 첫 번째 이미지의 의류 상품을 착용한 모습을 자연스럽게 만들어주세요.`;
        }
        
        // 3. Background Image
        if (backgroundOption === 'upload' && backgroundImage) {
            imageCounter++;
            parts.push({
                inlineData: {
                    mimeType: backgroundImage.mimeType,
                    data: backgroundImage.base64,
                },
            });
            prompt += `\n- ${imageCounter}번째 이미지를 배경으로 사용하세요. 상품${personImage ? '과 모델' : ''}을 이 배경에 자연스럽게 합성해주세요.`;
        } else if (backgroundDescription.trim()) {
            prompt += `\n- 배경은 다음 텍스트 설명을 기반으로 생성해주세요: "${backgroundDescription}"`;
        }
        
        // 4. Promo Text and font instructions
        if (promoText.trim()) {
            prompt += `\n- 홍보 문구: "${promoText}"`;
            prompt += `\n- 홍보 문구의 폰트 스타일은 '${fontStyle}' 느낌으로, 색상은 '${fontColor}'(으)로 적용해주세요.`;
        }

        // 5. Style and final instructions
        if (generateVariations) {
            prompt += `
            \n- 최종적으로, 위 요소들을 모두 활용하여 4개의 서로 다른 스타일(미니멀리스트, 빈티지, 럭셔리, 활기찬)을 적용한 2x2 그리드 형태의 단일 이미지를 생성해주세요.
            - 각 그리드 셀은 완벽한 브로슈어 시안이어야 합니다.
            - 4개의 시안은 시각적으로 뚜렷하게 구분되어야 하며, 각 스타일에 맞는 디자인과 레이아웃을 가져야 합니다.
            - 홍보 문구도 각 스타일에 어울리게 배치해주세요.`;
        } else {
            if (brochureStyle !== '기본') {
                prompt += `\n- 전체적인 브로슈어 스타일은 '${brochureStyle}' 느낌으로 만들어주세요.`;
            }
            prompt += `
            \n- 최종 이미지에는 제공된 홍보 문구를 세련되고 읽기 쉽게 포함해야 합니다.
            - 상품(그리고 모델이 있다면 모델)의 그림자, 조명 등을 배경과 잘 어울리도록 처리하여 통일성 있고 전문적으로 보이는 단일 제품 브로슈어 이미지를 만들어주세요.`;
        }

        parts.push({ text: prompt });

        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: parts,
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              const base64ImageBytes: string = part.inlineData.data;
              return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }

        throw new Error("API로부터 이미지를 수신하지 못했습니다.");

    } catch (error) {
        console.error("Error generating brochure:", error);
        if (error instanceof Error) {
            throw new Error(`브로슈어 생성에 실패했습니다: ${error.message}`);
        }
        throw new Error("알 수 없는 오류가 발생했습니다.");
    }
}