import HBox from "@shared/components/HBox";

const PriceInput = ({ className = "" }) => {
  return (
    <HBox
      className={`
            gap-0 border-2 border-gray-300 rounded-xl overflow-hidden
            focus-within:border-black
            ${className}
            `}
    >
      <div className="w-14 h-14 flex items-center justify-center font-semibold bg-gray-200 text-gray-600">
        $
      </div>

      <input
        type="text"
        placeholder="Input price"
        className="
                flex-1 p-3 bg-transparent
                outline-none border-none
                focus:outline-none focus:border-none
            "
      />
    </HBox>
  );
};

export default PriceInput;
