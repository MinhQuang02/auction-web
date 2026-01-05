import React from "react";
import removeIcon from "@assets/images/_removeIcon.svg";

const ImageUrlInputList = ({ images, onImagesChange }) => {
  const handleInputChange = (index, value) => {
    const updatedImages = [...images];
    updatedImages[index] = value;
    onImagesChange(updatedImages);
  };

  const handleAddInput = () => {
    onImagesChange([...images, ""]);
  };

  const handleRemoveInput = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
          <div>
             <label className="block text-sm font-semibold text-gray-700">
               Product Image URLs
             </label>
             <p className="text-xs text-gray-500 mt-1">
                Paste direct links (e.g., https://i.imgur.com/...). The first link is your Main Cover.
             </p>
          </div>
          <span className={`text-xs font-bold ${images.filter(i=>i).length < 4 ? 'text-red-500' : 'text-green-600'}`}>
              {images.filter(i=>i).length} / 4 Min Required
          </span>
      </div>

      {images.map((url, index) => (
        <div key={index} className="flex items-center gap-2 group relative">
          
          <div className="relative flex-1">
             <input
                type="url"
                placeholder={index === 0 ? "Paste MAIN COVER image URL here..." : `Paste additional image URL #${index} here...`}
                value={url}
                onChange={(e) => handleInputChange(index, e.target.value)}
                className={`w-full p-3 pr-32 border rounded-xl focus:ring-2 ring-[#8C7963] outline-none text-sm font-medium transition-all
                    ${index === 0 ? "border-[#AD9C86] bg-[#AD9C86]/5 shadow-sm" : "border-gray-300 focus:border-[#AD9C86]"}
                    ${url && !url.match(/^https?:\/\/.+/) ? "border-red-300 text-red-600" : ""}
                `}
              />
              
              {index === 0 && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-white border border-[#AD9C86] text-[#AD9C86] text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wider select-none pointer-events-none">
                      Main Cover
                  </div>
              )}
          </div>

           <button
              type="button"
              onClick={() => handleRemoveInput(index)}
              className={`p-3 rounded-xl transition shrink-0 border border-transparent
                  ${images.length > 1 ? 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}
              `}
              disabled={images.length <= 1}
              title="Remove URL"
            >
              <img src={removeIcon} className={`w-5 h-5 ${images.length <= 1 ? 'opacity-50' : ''}`} alt="Remove" />
            </button>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddInput}
        className="mt-2 px-5 py-2.5 text-sm font-bold text-[#AD9C86] bg-[#AD9C86]/10 border-2 border-[#AD9C86]/20 rounded-xl hover:bg-[#AD9C86]/20 hover:border-[#AD9C86]/40 transition flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Another URL Field
      </button>
    </div>
  );
};

export default ImageUrlInputList;