import React, { useState, useCallback } from 'react';
import { ImageFile } from './types';
import { generateBrochure } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import { LoadingSpinner } from './components/icons';

type BackgroundOption = 'upload' | 'describe';

const App: React.FC = () => {
    const [productImage, setProductImage] = useState<ImageFile | null>(null);
    const [backgroundImage, setBackgroundImage] = useState<ImageFile | null>(null);
    const [backgroundDescription, setBackgroundDescription] = useState<string>('');
    const [promoText, setPromoText] = useState<string>('');
    const [backgroundOption, setBackgroundOption] = useState<BackgroundOption>('describe');
    const [personImage, setPersonImage] = useState<ImageFile | null>(null);
    const [fontStyle, setFontStyle] = useState<string>('기본');
    const [fontColor, setFontColor] = useState<string>('블랙');

    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const isGenerationDisabled = !productImage || (backgroundOption === 'upload' && !backgroundImage) || (backgroundOption === 'describe' && !backgroundDescription.trim());

    const handleGenerate = useCallback(async () => {
        if (isGenerationDisabled) return;

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const result = await generateBrochure(
                productImage!,
                backgroundOption,
                backgroundImage,
                backgroundDescription,
                promoText,
                personImage,
                fontStyle,
                fontColor
            );
            setGeneratedImage(result);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    }, [productImage, backgroundOption, backgroundImage, backgroundDescription, promoText, personImage, fontStyle, fontColor, isGenerationDisabled]);
    
    const fontStyles = ['기본', '세리프', '산세리프', '손글씨'];
    const fontColors = [
        { name: '블랙', hex: '#111827' },
        { name: '화이트', hex: '#F9FAFB' },
        { name: '레드', hex: '#EF4444' },
        { name: '블루', hex: '#3B82F6' },
        { name: '골드', hex: '#F59E0B' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-center text-indigo-600">AI 의류 브로슈어 제작기</h1>
                    <p className="text-center text-gray-500 mt-1">AI로 간편하게 만드는 나만의 상품 광고 이미지</p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Input Section */}
                    <div className="space-y-8">
                        {/* Step 1 */}
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <h2 className="text-xl font-semibold mb-1"><span className="text-indigo-500 font-bold">Step 1.</span> 상품 사진 올리기</h2>
                            <p className="text-sm text-gray-500 mb-4">광고할 의류 상품의 사진을 업로드해주세요.</p>
                            <ImageUploader id="product-image" label="상품 이미지" onImageUpload={setProductImage} />
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                             <h2 className="text-xl font-semibold mb-1"><span className="text-indigo-500 font-bold">Step 2.</span> 배경 선택하기</h2>
                             <p className="text-sm text-gray-500 mb-4">상품 사진에 적용할 배경을 선택해주세요.</p>
                            <div className="flex rounded-md shadow-sm mb-4">
                                <button
                                    onClick={() => setBackgroundOption('describe')}
                                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-md transition-colors ${backgroundOption === 'describe' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                                >
                                    글로 설명하기
                                </button>
                                <button
                                    onClick={() => setBackgroundOption('upload')}
                                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-r-md transition-colors ${backgroundOption === 'upload' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                                >
                                    이미지 업로드
                                </button>
                            </div>

                            {backgroundOption === 'describe' ? (
                                <div>
                                    <label htmlFor="bg-desc" className="block text-md font-medium text-gray-700 mb-2">배경 설명</label>
                                    <textarea
                                        id="bg-desc"
                                        rows={4}
                                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        placeholder="예: 햇살이 좋은 파리의 노천 카페, 미니멀한 화이트 스튜디오"
                                        value={backgroundDescription}
                                        onChange={(e) => setBackgroundDescription(e.target.value)}
                                    />
                                </div>
                            ) : (
                                <ImageUploader id="background-image" label="배경 이미지" onImageUpload={setBackgroundImage} />
                            )}
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                             <h2 className="text-xl font-semibold mb-1"><span className="text-indigo-500 font-bold">Step 3.</span> 홍보 문구 쓰기 (선택)</h2>
                             <p className="text-sm text-gray-500 mb-4">이미지에 추가할 광고 문구를 입력해주세요.</p>
                            <textarea
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                                placeholder="예: 2024 S/S 신상품, 30% 특별 할인!"
                                value={promoText}
                                onChange={(e) => setPromoText(e.target.value)}
                            />
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">폰트 스타일</label>
                                    <div className="flex flex-wrap gap-2">
                                        {fontStyles.map(style => (
                                            <button key={style} onClick={() => setFontStyle(style)} className={`px-3 py-1.5 text-sm rounded-full transition-colors ${fontStyle === style ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">폰트 색상</label>
                                    <div className="flex items-center space-x-3">
                                        {fontColors.map(color => (
                                            <button key={color.name} onClick={() => setFontColor(color.name)} style={{ backgroundColor: color.hex }} className={`w-8 h-8 rounded-full border-2 transition-all ${fontColor === color.name ? 'ring-2 ring-offset-2 ring-indigo-500 border-white' : 'border-gray-300'}`}>
                                                <span className="sr-only">{color.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                         {/* Step 4 */}
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <h2 className="text-xl font-semibold mb-1"><span className="text-indigo-500 font-bold">Step 4.</span> 모델 사진 넣기 (선택)</h2>
                            <p className="text-sm text-gray-500 mb-4">모델 사진을 업로드하면 상품을 착용한 모습으로 이미지를 생성해줍니다.</p>
                            <ImageUploader id="person-image" label="모델 이미지" onImageUpload={setPersonImage} />
                        </div>
                    </div>

                    {/* Output Section */}
                    <div className="sticky top-8 self-start">
                         <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <h2 className="text-2xl font-bold mb-4 text-center">AI 생성 결과</h2>
                            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border border-dashed">
                                {isLoading ? (
                                    <div className="text-center">
                                        <LoadingSpinner className="w-16 h-16 text-indigo-500 mx-auto" />
                                        <p className="mt-4 text-gray-600">브로슈어를 만들고 있어요... (최대 1분 소요)</p>
                                    </div>
                                ) : error ? (
                                    <div className="text-center text-red-500 p-4">
                                        <p>오류가 발생했습니다:</p>
                                        <p className="text-sm mt-2">{error}</p>
                                    </div>
                                ) : generatedImage ? (
                                    <img src={generatedImage} alt="Generated Brochure" className="w-full h-full object-contain rounded-lg" />
                                ) : (
                                    <p className="text-gray-500">왼쪽 항목을 입력하고 생성 버튼을 누르세요.</p>
                                )}
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerationDisabled || isLoading}
                                className="w-full mt-6 bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                            >
                                {isLoading && <LoadingSpinner className="w-5 h-5 mr-3" />}
                                {isLoading ? '생성 중...' : '✨ 브로슈어 생성하기'}
                            </button>
                            {generatedImage && !isLoading && (
                                <a
                                    href={generatedImage}
                                    download="ai_brochure.png"
                                    className="w-full mt-3 bg-green-500 text-white font-bold py-3 px-4 rounded-md hover:bg-green-600 transition-all flex items-center justify-center text-center"
                                >
                                    이미지 다운로드
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;