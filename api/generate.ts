
import { GoogleGenAI, Modality, Part } from "@google/genai";

export const config = {
  runtime: 'edge',
};

// types.ts의 인터페이스를 여기에 복사하여 경로 문제를 방지합니다.
interface ImageFile {
  base64: string;
  mimeType: string;
}

// API 키는 서버의 환경 변수에서 읽어옵니다.
const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey });


export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const {
            productImage,
            backgroundOption,
            backgroundImage,
            backgroundDescription,
            promoText,
            personImage,
            fontStyle,
            fontColor,
            brochureStyle,
            generateVariations
        }: {
            productImage: ImageFile;
            backgroundOption: 'upload' | 'describe';
            backgroundImage: ImageFile | null;
            backgroundDescription: string;
            promoText: string;
            personImage: ImageFile | null;
            fontStyle: string;
            fontColor: string;
            brochureStyle: string;
            generateVariations: boolean;
        } = await request.json();

        if (!productImage) {
            return new Response(JSON.stringify({ error: 'Product image is required.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        const model = 'gemini-2.5-flash-image';
        const parts: Part[] = [];
        
        let prompt = `
        당신은 의류 상품을 위한 홍보 브로슈어를 만드는 전문 그래픽 디자이너입니다.
        여러 이미지를 입력받아 하나의 완성된 브로슈어 이미지를 생성해야 합니다.
        `;

        parts.push({
            inlineData: {
                mimeType: productImage.mimeType,
                data: productImage.base64,
            },
        });
        prompt += "\n- 첫 번째 이미지는 홍보할 주요 의류 상품입니다.";

        let imageCounter = 1;

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
        
        if (backgroundOption === 'upload' && backgroundImage) {
            imageCounter++;
            parts.push({
                inlineData: {
                    mimeType: backgroundImage.mimeType,
                    data: backgroundImage.base64,
                },
            });
            prompt += `\n- ${imageCounter}번째 이미지를 배경으로 사용하세요. 상품${personImage ? '과 모델' : ''}을 이 배경에 자연스럽게 합성해주세요.`;
        } else if (backgroundDescription && backgroundDescription.trim()) {
            prompt += `\n- 배경은 다음 텍스트 설명을 기반으로 생성해주세요: "${backgroundDescription}"`;
        }
        
        if (promoText && promoText.trim()) {
            prompt += `\n- 홍보 문구: "${promoText}"`;
            prompt += `\n- 홍보 문구의 폰트 스타일은 '${fontStyle}' 느낌으로, 색상은 '${fontColor}'(으)로 적용해주세요.`;
        }

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

        const responseFromGemini = await ai.models.generateContent({
            model: model,
            contents: {
                parts: parts,
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of responseFromGemini.candidates[0].content.parts) {
            if (part.inlineData) {
              const base64ImageBytes: string = part.inlineData.data;
              const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
              
              return new Response(JSON.stringify({ imageUrl }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              });
            }
        }

        throw new Error("API로부터 이미지를 수신하지 못했습니다.");

    } catch (error) {
        console.error("Error in /api/generate:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return new Response(JSON.stringify({ error: `브로슈어 생성에 실패했습니다: ${errorMessage}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
