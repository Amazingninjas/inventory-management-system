import { Order } from '../types';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onComplete: (orderId: number) => void;
}

export default function OrderDetailsModal({ order, onClose, onComplete }: OrderDetailsModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const handleComplete = async () => {
    if (window.confirm('Are you sure you want to complete this order? This will deduct inventory.')) {
      await onComplete(order.id);
      onClose();
    }
  };

  const totalItems = order.inputs.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h2>
              <p className="text-sm text-gray-600 mt-1">
                Created {formatDate(order.createdAt)}
                {order.completedAt && ` • Completed ${formatDate(order.completedAt)}`}
              </p>
            </div>
            <span className={`px-3 py-1 text-sm rounded-full ${getStatusBadge(order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>

        {/* Order Details */}
        <div className="px-6 py-4">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Order Type</label>
              <p className="text-base text-gray-900 capitalize">{order.type}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Total Items</label>
              <p className="text-base text-gray-900">{totalItems}</p>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-600 mb-1">Notes</label>
              <p className="text-base text-gray-900">{order.notes}</p>
            </div>
          )}

          {/* Input Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Input Items</h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Lot</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Location</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.inputs.map((item, index) => (
                    <tr key={index} className="bg-white">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.productName}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">{item.productLot}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.location}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{item.quantity}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-900">Total</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{totalItems}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Status Info */}
          {order.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800">Order Pending</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    This order is pending. Complete it to deduct the input items from inventory.
                  </p>
                </div>
              </div>
            </div>
          )}

          {order.status === 'completed' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-green-800">Order Completed</h4>
                  <p className="text-sm text-green-700 mt-1">
                    This order has been completed. Inventory has been updated.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {order.status === 'pending' && (
            <button
              onClick={handleComplete}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Complete Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
