import { useState, useEffect } from 'react';
import { orderAPI } from '../api';
import { Order } from '../types';

export default function Sales() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [travelCost, setTravelCost] = useState(0);
  const [laborCost, setLaborCost] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ordersRes = await orderAPI.getAll();
      // Show fulfillment orders (customer sales/shipments)
      setOrders(ordersRes.data.filter(o => o.orderType === 'fulfillment'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await orderAPI.create({
        orderType: 'sales',
        inputs: [],
        outputs: [],
        notes,
        travelCost,
        laborCost,
      });
      setShowForm(false);
      setTravelCost(0);
      setLaborCost(0);
      setNotes('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create sales order');
    }
  };

  const handleComplete = async (id: number) => {
    if (window.confirm('Complete this sales order?')) {
      try {
        await orderAPI.complete(id);
        fetchData();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to complete order');
      }
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sales</h1>
          <p className="text-gray-600">Track travel costs and labor for sales activities</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          {showForm ? 'Cancel' : '+ New Sales Entry'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold">New Sales Entry</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Travel Cost ($)</label>
              <input type="number" min="0" step="0.01" value={travelCost} onChange={(e) => setTravelCost(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg" placeholder="0.00" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Labor Cost ($)</label>
              <input type="number" min="0" step="0.01" value={laborCost} onChange={(e) => setLaborCost(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg" placeholder="0.00" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="Sales activity details..." />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Create</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer Info</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No sales orders yet.
                </td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-blue-600">{order.orderNumber}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {order.inputs.length} item{order.inputs.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.inputs.slice(0, 2).map(i => i.productName).join(', ')}
                      {order.inputs.length > 2 && ` +${order.inputs.length - 2} more`}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {order.notes ? (
                      <div className="max-w-xs">
                        {order.notes.split('|')[0].trim()}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.completedAt || order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleComplete(order.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ship
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
