import { useRef, useState } from "react";

const ImageUploadBox = () => {
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    const arr = [...files].slice(0, 20); // cap if needed
    const mapped = arr.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...mapped]);
  };

  const onInputChange = (e) => {
    handleFiles(e.target.files);
  };

  const onDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (i) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  };

  return (
    <div
      className="border-2 border-gray-300 rounded-xl p-4 flex items-start flex-wrap gap-3"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {/* Add Button (always at current end, top-left initially) */}
      <button
        type="button"
        className="w-20 h-20 rounded-lg border border-gray-400 
                   flex items-center justify-center text-gray-500 hover:bg-gray-100"
        onClick={() => fileInputRef.current.click()}
      >
        +
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onInputChange}
      />

      {/* Image Previews */}
      {images.map((img, i) => (
        <div key={i} className="relative w-20 h-20">
          <img
            src={img.preview}
            className="w-full h-full object-cover rounded-lg"
          />
          <button
            type="button"
            className="absolute -top-2 -right-2 bg-white border border-gray-400 
                       w-6 h-6 rounded-full text-xs flex items-center justify-center"
            onClick={() => removeImage(i)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export default ImageUploadBox;