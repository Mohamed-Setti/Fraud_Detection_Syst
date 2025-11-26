type Props = {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  setPage: (page: number) => void;
};

export default function Pagination({ totalItems, itemsPerPage, currentPage, setPage }: Props) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="flex justify-center mt-6 gap-3">
      <button
        disabled={currentPage === 1}
        onClick={() => setPage(currentPage - 1)}
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
      >
        ← Précédent
      </button>

      <span className="px-4 py-2 font-semibold">
        Page {currentPage} / {totalPages}
      </span>

      <button
        disabled={currentPage === totalPages}
        onClick={() => setPage(currentPage + 1)}
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
      >
        Suivant →
      </button>
    </div>
  );
}
