import HBox from "@shared/components/HBox";

const Pagination = ({ currentPage, totalPages, onPrev, onNext, onSelect }) => {
  const pages = [];

  if (totalPages <= 5) {
    // Simple case — show everything
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    // Always show 1
    pages.push(1);

    // Left ellipsis
    if (currentPage > 3) pages.push("...");

    // Middle window
    for (let p = currentPage - 1; p <= currentPage + 1; p++) {
      if (p > 1 && p < totalPages) pages.push(p);
    }

    // Right ellipsis
    if (currentPage < totalPages - 2) pages.push("...");

    // Always show last
    pages.push(totalPages);
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className="px-3 py-1 disabled:opacity-50"
      >
        &lt; Prev
      </button>

      <HBox className="gap-2">
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={i} className="px-2 select-none">
              …
            </span>
          ) : (
            <button
              key={i}
              onClick={() => onSelect(p)}
              className={[
                "px-3 py-1 rounded",
                p === currentPage
                  ? "bg-primary/60 text-white font-semibold"
                  : "",
              ].join(" ")}
            >
              {p}
            </button>
          )
        )}
      </HBox>

      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="px-3 py-1 disabled:opacity-50"
      >
        Next &gt;
      </button>
    </div>
  );
};

export default Pagination;
