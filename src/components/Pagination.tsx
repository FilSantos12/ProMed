import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  const pages = [];
  const maxPagesToShow = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (totalPages === 0 || totalPages === 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      {/* Informação de itens */}
      {totalItems !== undefined && itemsPerPage !== undefined && (
        <div className="text-sm text-gray-600">
          Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} até{' '}
          {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} registro
          {totalItems !== 1 ? 's' : ''}
        </div>
      )}

      {/* Botões de paginação */}
      <div className="flex items-center gap-2">
        {/* Primeira página */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`p-2 rounded border ${
            currentPage === 1
              ? 'text-gray-400 border-gray-300 cursor-not-allowed'
              : 'text-blue-600 border-blue-600 hover:bg-blue-50'
          }`}
          title="Primeira página"
        >
          <ChevronsLeft size={18} />
        </button>

        {/* Página anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded border ${
            currentPage === 1
              ? 'text-gray-400 border-gray-300 cursor-not-allowed'
              : 'text-blue-600 border-blue-600 hover:bg-blue-50'
          }`}
          title="Página anterior"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Números das páginas */}
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-1 rounded border border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              1
            </button>
            {startPage > 2 && (
              <span className="px-2 text-gray-500">...</span>
            )}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded border ${
              page === currentPage
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-blue-600 text-blue-600 hover:bg-blue-50'
            }`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="px-2 text-gray-500">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-1 rounded border border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Próxima página */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded border ${
            currentPage === totalPages
              ? 'text-gray-400 border-gray-300 cursor-not-allowed'
              : 'text-blue-600 border-blue-600 hover:bg-blue-50'
          }`}
          title="Próxima página"
        >
          <ChevronRight size={18} />
        </button>

        {/* Última página */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded border ${
            currentPage === totalPages
              ? 'text-gray-400 border-gray-300 cursor-not-allowed'
              : 'text-blue-600 border-blue-600 hover:bg-blue-50'
          }`}
          title="Última página"
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </div>
  );
}
