import HBox from "@components/HBox";

const Pagination = ({ currentPage, totalPages, onPrev, onNext, onSelect }) => {
  const pages = [];

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);

    if (currentPage > 3) pages.push("...");

    for (let p = currentPage - 1; p <= currentPage + 1; p++) {
      if (p > 1 && p < totalPages) pages.push(p);
    }

    if (currentPage < totalPages - 2) pages.push("...");

    pages.push(totalPages);
  }

  if (totalPages === 0) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        className="p-2 border rounded disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path
            fillRule="evenodd"
            d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <HBox className="gap-2">
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={i} className="px-2 select-none text-gray-500">
              …
            </span>
          ) : (
            <button
              key={i}
              onClick={() => onSelect(p)}
              className={[
                "px-3 py-1 rounded border",
                p === currentPage
                  ? "bg-primary/60 text-white font-semibold"
                  : "hover:bg-gray-100",
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
        className="p-2 border rounded disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path
            fillRule="evenodd"
            d="M7.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L11.586 10 7.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
