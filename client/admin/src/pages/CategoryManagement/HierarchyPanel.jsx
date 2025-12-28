import React, { useState } from "react";
import { motion } from "framer-motion";
import HBox from "@/components/HBox";

const HierarchyPanel = ({
  data,
  onSelect,
  selectedIds = [],
  onToggleActive,
}) => {
  return (
    <div className="bg-lightGray rounded-md shadow-md flex flex-col overflow-y-auto py-4 w-full min-w-0">
      <div className="flex-1 flex flex-col">
        {data.map((item) => (
          <CategoryRow
            key={item.id}
            item={item}
            level={0}
            onSelect={onSelect}
            selectedIds={selectedIds}
            onToggleActive={onToggleActive}
          />
        ))}
      </div>
    </div>
  );
};

const CategoryRow = ({
  item,
  level,
  onSelect,
  selectedIds,
  onToggleActive,
}) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = item.children && item.children.length > 0;
  const isSelected = selectedIds.includes(item.id);

  return (
    <>
      <HBox
        className={`
          cursor-pointer font-semibold
          ${isSelected ? "opacity-100 bg-primary bg-opacity-60" : "opacity-50"}
          hover:opacity-100 hover:bg-primary hover:bg-opacity-60
          transition-colors transition-opacity
        `}
      >
        <div className="flex items-center w-full gap-2">
          {/* Arrow */}
          <div className="w-14 h-14 flex items-center justify-center">
            {hasChildren && (
              <div
                className="flex items-center justify-center cursor-pointer w-full h-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
              >
                <motion.div
                  className="transition-transform"
                  animate={{ rotate: expanded ? 90 : 0 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                    className="w-4 h-4 text-black"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </motion.div>
              </div>
            )}
          </div>

          {/* Label (select category) */}
          <span
            className="flex-1 truncate flex items-center min-h-14 cursor-pointer"
            style={{ paddingLeft: level * 20 }}
            onClick={() => onSelect(item.id)}
          >
            {item.label}
          </span>

          {/* Checkbox (toggle active) */}
          <div className="flex items-center justify-end pr-8">
            <input
              type="checkbox"
              className="w-5 h-5 accent-primary cursor-pointer"
              checked={item.active}
              onChange={() => onToggleActive(item.id, !item.active)}
              onClick={(e) => e.stopPropagation()} // prevent row selection
            />
          </div>
        </div>
      </HBox>

      {hasChildren && expanded && (
        <motion.div
          layout
          initial={false}
          animate={{ height: expanded ? "auto" : 0 }}
          className="overflow-hidden"
        >
          {item.children.map((child) => (
            <CategoryRow
              key={child.id}
              item={child}
              level={level + 1}
              onSelect={onSelect}
              selectedIds={selectedIds}
              onToggleActive={onToggleActive}
            />
          ))}
        </motion.div>
      )}
    </>
  );
};

export default HierarchyPanel;
