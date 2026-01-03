import { useState, useEffect } from "react";
import HBox from "@components/HBox";
import VBox from "@components/VBox";
import AddButton from "@components/IconButton/AddButton";
import RemoveButton from "@components/IconButton/RemoveButton";
import EditButton from "@components/IconButton/EditButton";

const AuctionActionBar = ({
  search = "",
  status = "all",
  sortBy = "time_desc",
  categoryId = "all",
  categories = [],
  onSearch,
  onStatusChange,
  onSortChange,
  onCategoryChange,
  onAdd,
  onEdit,
  onRemove,
  className = "",
}) => {
  const [query, setQuery] = useState(search);

  useEffect(() => {
    setQuery(search);
  }, [search]);

  useEffect(() => {
    if (!onSearch) return;
    const t = setTimeout(() => onSearch(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query, onSearch]);

  return (
    <VBox className={`gap-4 ${className}`}>
      {/* Search */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        className="h-14 px-4 rounded-md border shadow-lg"
      />

      {/* Filters */}
      <HBox className="gap-4 flex-wrap">
        {/* Status */}
        <select
          value={status}
          className="h-12 px-4 rounded-md border shadow-lg"
          onChange={(e) => onStatusChange?.(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="sold">Sold</option>
          <option value="ended_no_winner">Ended (no winner)</option>
          <option value="removed">Removed</option>
        </select>

        {/* Category */}
        <select
          value={categoryId}
          className="h-12 px-4 rounded-md border shadow-lg"
          onChange={(e) => onCategoryChange?.(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.category_id} value={c.category_id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          className="h-12 px-4 rounded-md border shadow-lg"
          onChange={(e) => onSortChange?.(e.target.value)}
        >
          <option value="time_desc">Ending soon</option>
          <option value="price_asc">Price ↑</option>
        </select>

        {/* Actions */}
        <HBox className="ml-auto gap-4">
          {onAdd && <AddButton onClick={onAdd} />}
          {onEdit && <EditButton onClick={onEdit} />}
          {onRemove && <RemoveButton onClick={onRemove} />}
        </HBox>
      </HBox>
    </VBox>
  );
};

export default AuctionActionBar;
