const { jsx } = require('react/jsx-runtime');
const { cn } = require('../utils/cn');

function StatGrid({ children, columns = 4, className }) {
  return jsx('div', { className: cn('grid gap-4', gridCols(columns), className), children });
}

function gridCols(columns) {
  switch (columns) {
    case 2:
      return 'grid-cols-1 sm:grid-cols-2';
    case 3:
      return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3';
    default:
      return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4';
  }
}

module.exports = { StatGrid };
