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
      setOrders(ordersRes.data.filter(o => o.orderType === 'sales'));
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Travel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Labor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map(order => (
              <tr key={order.id}>
                <td className="px-6 py-4">{order.orderNumber}</td>
                <td className="px-6 py-4">{order.status}</td>
                <td className="px-6 py-4">${order.costs?.travelCost?.toFixed(2) || '0.00'}</td>
                <td className="px-6 py-4">${order.costs?.laborCost?.toFixed(2) || '0.00'}</td>
                <td className="px-6 py-4 font-medium">${order.costs?.totalCost?.toFixed(2) || '0.00'}</td>
                <td className="px-6 py-4">
                  {order.status === 'pending' && <button onClick={() => handleComplete(order.id)} className="text-blue-600">Complete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
