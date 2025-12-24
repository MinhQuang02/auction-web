import { useState } from "react";

const PillSwitch = ({ className="" }) => {
  const [on, setOn] = useState(false);

  return (
    <div
      onClick={() => setOn(!on)}
      className={`
        w-12 h-6 rounded-full p-1 cursor-pointer transition relative
        ${on ? "bg-primary" : "bg-gray-300"}
        ${className}
      `}
    >
      <div
        className={`
          w-4 h-4 bg-white rounded-full shadow
          transition-transform
          ${on ? "translate-x-6" : "translate-x-0"}
        `}
      />
    </div>
  );
};

export default PillSwitch;
