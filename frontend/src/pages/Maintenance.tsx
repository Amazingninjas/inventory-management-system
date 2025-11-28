import { useState, useEffect } from 'react';
import { orderAPI, productAPI } from '../api';
import { Order, Product } from '../types';

export default function Maintenance() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [parts, setParts] = useState<{ productId: number; quantity: number }[]>([{ productId: 0, quantity: 1 }]);
  const [stockPartsCost, setStockPartsCost] = useState(0);
  const [laborCost, setLaborCost] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([orderAPI.getAll(), productAPI.getAll()]);
      setOrders(ordersRes.data.filter(o => o.orderType === 'maintenance'));
      setProducts(productsRes.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await orderAPI.create({
        orderType: 'maintenance',
        inputs: parts.filter(p => p.productId !== 0),
        outputs: [],
        notes,
        stockPartsCost,
        laborCost,
      });
      setShowForm(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create maintenance order');
    }
  };

  const resetForm = () => {
    setParts([{ productId: 0, quantity: 1 }]);
    setStockPartsCost(0);
    setLaborCost(0);
    setNotes('');
  };

  const handleComplete = async (id: number) => {
    if (window.confirm('Complete this maintenance order?')) {
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
          <h1 className="text-3xl font-bold">Maintenance</h1>
          <p className="text-gray-600">Track maintenance costs and parts usage</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          {showForm ? 'Cancel' : '+ New Maintenance'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold">New Maintenance Order</h2>

          <div>
            <label className="block text-sm font-medium mb-2">Parts Used (from inventory)</label>
            {parts.map((part, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select value={part.productId} onChange={(e) => {
                  const newParts = [...parts];
                  newParts[idx].productId = parseInt(e.target.value);
                  setParts(newParts);
                }} className="flex-1 px-3 py-2 border rounded-lg">
                  <option value={0}>Select part...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.lot})</option>)}
                </select>
                <input type="number" min="0" step="0.01" value={part.quantity} onChange={(e) => {
                  const newParts = [...parts];
                  newParts[idx].quantity = parseFloat(e.target.value) || 0;
                  setParts(newParts);
                }} className="w-32 px-3 py-2 border rounded-lg" placeholder="Qty" />
              </div>
            ))}
            <button type="button" onClick={() => setParts([...parts, { productId: 0, quantity: 1 }])} className="text-sm text-blue-600">+ Add Part</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Stock Parts Cost ($)</label>
              <input type="number" min="0" step="0.01" value={stockPartsCost} onChange={(e) => setStockPartsCost(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg" placeholder="0.00" />
              <p className="text-xs text-gray-500 mt-1">Extra parts not from inventory</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Labor Cost ($)</label>
              <input type="number" min="0" step="0.01" value={laborCost} onChange={(e) => setLaborCost(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg" placeholder="0.00" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg" />
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map(order => (
              <tr key={order.id}>
                <td className="px-6 py-4">{order.orderNumber}</td>
                <td className="px-6 py-4">{order.status}</td>
                <td className="px-6 py-4">${order.costs?.totalCost?.toFixed(2) || '0.00'}</td>
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
