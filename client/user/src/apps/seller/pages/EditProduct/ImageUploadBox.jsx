import React, { useRef } from "react";
import removeIcon from "@assets/images/_removeIcon.svg";
import cameraIcon from "@assets/images/_cameraIcon.svg";

const ImageUploadBox = ({ images = [], onImagesChange }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Convert new files to URLs
    const newImageUrls = files.map((file) => URL.createObjectURL(file));
    
    // Append to existing images
    const updatedImages = [...images, ...newImageUrls];
    onImagesChange(updatedImages);
  };

  const handleRemove = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Product Images (Min 4)
      </label>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Render Existing Images */}
        {images.map((img, index) => (
          <div key={index} className="aspect-square relative rounded-xl border border-gray-200 overflow-hidden group">
            <img 
              src={img} 
              alt={`Upload ${index}`} 
              className="w-full h-full object-cover" 
            />
            
            {/* Main Image Badge */}
            {index === 0 && (
                <div className="absolute top-2 left-2 bg-[#AD9C86] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    MAIN
                </div>
            )}

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
            >
              <img src={removeIcon} className="w-4 h-4" alt="Remove" />
            </button>
          </div>
        ))}

        {/* Upload Button (Always Visible) */}
        <div 
          onClick={() => fileInputRef.current.click()}
          className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#AD9C86] hover:bg-[#F9F9F9] transition gap-2"
        >
          <img src={cameraIcon} className="w-8 h-8 opacity-40" alt="Upload" />
          <span className="text-xs text-gray-400 font-medium">Add Image</span>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            multiple 
            accept="image/*"
            onChange={handleFileChange} 
          />
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-2">
        * The first image will be the main cover image.
      </p>
    </div>
  );
};

export default ImageUploadBox;