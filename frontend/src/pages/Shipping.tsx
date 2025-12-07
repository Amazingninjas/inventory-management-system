import { useState, useEffect } from 'react';
import { orderAPI, productAPI } from '../api';
import { Order, Product } from '../types';

export default function Shipping() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [materials, setMaterials] = useState<{ productId: number; quantity: number }[]>([{ productId: 0, quantity: 1 }]);
  const [carrierCost, setCarrierCost] = useState(0);
  const [laborCost, setLaborCost] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([orderAPI.getAll(), productAPI.getAll()]);
      // Show fulfillment orders (customer shipments)
      setOrders(ordersRes.data.filter(o => o.orderType === 'fulfillment'));
      setProducts(productsRes.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await orderAPI.create({
        orderType: 'shipping',
        inputs: materials.filter(m => m.productId !== 0),
        outputs: [],
        notes,
        carrierCost,
        laborCost,
      });
      setShowForm(false);
      setMaterials([{ productId: 0, quantity: 1 }]);
      setCarrierCost(0);
      setLaborCost(0);
      setNotes('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create shipping order');
    }
  };

  const handleComplete = async (id: number) => {
    if (window.confirm('Complete this shipping order?')) {
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
          <h1 className="text-3xl font-bold">Shipping</h1>
          <p className="text-gray-600">Track packaging materials, labor, and carrier costs</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          {showForm ? 'Cancel' : '+ New Shipment'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold">New Shipment</h2>

          <div>
            <label className="block text-sm font-medium mb-2">Packaging Materials</label>
            {materials.map((mat, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select value={mat.productId} onChange={(e) => {
                  const newMats = [...materials];
                  newMats[idx].productId = parseInt(e.target.value);
                  setMaterials(newMats);
                }} className="flex-1 px-3 py-2 border rounded-lg">
                  <option value={0}>Select material...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.lot})</option>)}
                </select>
                <input type="number" min="0" step="0.01" value={mat.quantity} onChange={(e) => {
                  const newMats = [...materials];
                  newMats[idx].quantity = parseFloat(e.target.value) || 0;
                  setMaterials(newMats);
                }} className="w-32 px-3 py-2 border rounded-lg" placeholder="Qty" />
              </div>
            ))}
            <button type="button" onClick={() => setMaterials([...materials, { productId: 0, quantity: 1 }])} className="text-sm text-blue-600">+ Add Material</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Carrier Cost ($)</label>
              <input type="number" min="0" step="0.01" value={carrierCost} onChange={(e) => setCarrierCost(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg" placeholder="0.00" />
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shipping Info</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No shipments yet.
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
                      {order.inputs.reduce((sum, item) => sum + item.quantity, 0).toFixed(0)} MSI
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.inputs.length} product{order.inputs.length !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {order.notes ? (
                      <div className="max-w-md">
                        {/* Extract shipping info from notes */}
                        {order.notes.includes('Ship to:') && (
                          <div className="text-gray-900">
                            {order.notes.split('|').find(s => s.includes('Ship to:'))?.trim()}
                          </div>
                        )}
                        {order.notes.includes('Tracking:') && (
                          <div className="text-xs text-gray-600 mt-1">
                            {order.notes.split('|').find(s => s.includes('Tracking:'))?.trim()}
                          </div>
                        )}
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
