import { useState } from "react";

const TagsInput = () => {
  const [tags, setTags] = useState([]);
  const [value, setValue] = useState("");

  const addTag = (text) => {
    if (!text.trim()) return;
    setTags((prev) => [...prev, text.trim()]);
  };

  const removeTag = (index) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (value.trim()) {
        addTag(value);
        setValue("");
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border-2 rounded-xl font-semibold p-1 min-h-[48px]">
      {tags.map((tag, i) => (
        <div
          key={i}
          className="flex items-center gap-3 bg-primary/60 p-3 rounded-xl text-sm"
        >
          <span>{tag}</span>
          <button
            onClick={() => removeTag(i)}
            className="text-gray-600 hover:text-black"
          >
            &times;
          </button>
        </div>
      ))}

      <input
        className="outline-none bg-transparent flex-1 px-2 min-w-[100px]"
        placeholder="Enter tags to describe your item"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

export default TagsInput;