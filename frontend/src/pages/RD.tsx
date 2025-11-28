import { useState, useEffect } from 'react';
import { orderAPI, productAPI } from '../api';
import { Order, Product } from '../types';

export default function RD() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<{ productId: number; quantity: number }[]>([
    { productId: 0, quantity: 1 },
  ]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, productsRes] = await Promise.all([
        orderAPI.getAll(),
        productAPI.getAll(),
      ]);
      // Filter only R&D orders
      const rdOrders = ordersRes.data.filter(order => order.orderType === 'r&d');
      setOrders(rdOrders);
      setProducts(productsRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validProducts = selectedProducts.filter(p => p.productId !== 0 && p.quantity > 0);
    if (validProducts.length === 0) {
      setError('Please select at least one product');
      return;
    }

    try {
      setSubmitting(true);
      await orderAPI.create({
        orderType: 'r&d',
        inputs: validProducts,
        outputs: [],
        notes: notes || undefined,
      });
      setShowRequestForm(false);
      setSelectedProducts([{ productId: 0, quantity: 1 }]);
      setNotes('');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create R&D request');
    } finally {
      setSubmitting(false);
    }
  };

  const addProduct = () => {
    setSelectedProducts([...selectedProducts, { productId: 0, quantity: 1 }]);
  };

  const removeProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: 'productId' | 'quantity', value: number) => {
    const updated = [...selectedProducts];
    updated[index][field] = value;
    setSelectedProducts(updated);
  };

  const getAvailableProducts = (currentIndex: number) => {
    const selectedIds = selectedProducts
      .map((p, idx) => (idx !== currentIndex ? p.productId : null))
      .filter(id => id !== null && id !== 0);
    return products.filter(p => !selectedIds.includes(p.id));
  };

  const handleCompleteRequest = async (orderId: number) => {
    if (!window.confirm('Complete this R&D request? This will deduct inventory.')) {
      return;
    }

    try {
      await orderAPI.complete(orderId);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to complete request');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading R&D requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">R&D Requests</h1>
          <p className="text-gray-600 mt-1">Request products for research and development</p>
        </div>
        <button
          onClick={() => setShowRequestForm(!showRequestForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showRequestForm ? 'Cancel' : '+ New R&D Request'}
        </button>
      </div>

      {/* Request Form */}
      {showRequestForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">New R&D Request</h2>
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Products Requested
              </label>
              <div className="space-y-2">
                {selectedProducts.map((item, index) => {
                  const availableProducts = getAvailableProducts(index);
                  return (
                    <div key={index} className="flex items-center space-x-2">
                      <select
                        value={item.productId}
                        onChange={(e) => updateProduct(index, 'productId', parseInt(e.target.value))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value={0}>Select a product...</option>
                        {availableProducts.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.lot}) - Available: {product.quantity} {product.unit}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateProduct(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Quantity"
                        required
                      />
                      {selectedProducts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProduct(index)}
                          className="p-2 text-red-600 hover:text-red-900"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={addProduct}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                + Add Product
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Purpose of this R&D request..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowRequestForm(false);
                  setError('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* R&D Requests List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No R&D requests yet. Create your first request above!
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      {order.inputs.slice(0, 2).map(i => i.productName).join(', ')}
                      {order.inputs.length > 2 && ` +${order.inputs.length - 2} more`}
                    </div>
                    {order.notes && (
                      <div className="text-xs text-gray-500 mt-1">{order.notes}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleCompleteRequest(order.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
