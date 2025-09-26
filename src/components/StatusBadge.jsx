const StatusBadge = ({ status, text, size = 'sm' }) => {
  const getStatusColor = (status) => {
    const colors = {
      'success': 'bg-green-100 text-green-800 border-green-200',
      'warning': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'error': 'bg-red-100 text-red-800 border-red-200',
      'info': 'bg-blue-100 text-blue-800 border-blue-200',
      'neutral': 'bg-gray-100 text-gray-800 border-gray-200',
      'submitted': 'bg-green-100 text-green-800 border-green-200',
      'graded': 'bg-blue-100 text-blue-800 border-blue-200',
      'not_submitted': 'bg-gray-100 text-gray-800 border-gray-200',
      'overdue': 'bg-red-100 text-red-800 border-red-200',
      'returned': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'assigned': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[status] || colors.neutral;
  };

  const getSizeClasses = (size) => {
    const sizes = {
      'xs': 'px-1.5 py-0.5 text-xs',
      'sm': 'px-2 py-1 text-xs',
      'md': 'px-2.5 py-1.5 text-sm',
      'lg': 'px-3 py-2 text-base'
    };
    return sizes[size] || sizes.sm;
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${getStatusColor(status)} ${getSizeClasses(size)}`}>
      {text}
    </span>
  );
};

export default StatusBadge;
