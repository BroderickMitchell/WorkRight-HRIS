const { jsx } = require('react/jsx-runtime');
const { cn } = require('../utils/cn');

function Badge({ className, ...props }) {
  return jsx('span', {
    className: cn('inline-flex items-center rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-brand', className),
    ...props
  });
}

module.exports = { Badge };
