import { useState, useEffect } from 'react';
import { orderAPI } from '../api';
import { Order } from '../types';

export default function Financials() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'production' | 'r&d'>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll();
      // Only get completed orders with costs
      const completedOrders = response.data.filter(
        order => order.status === 'completed' && order.costs
      );
      setOrders(completedOrders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return order.orderType === 'production' || order.orderType === 'r&d';
    if (filter === 'production') return order.orderType === 'production';
    if (filter === 'r&d') return order.orderType === 'r&d';
    return false;
  });

  const productionOrders = orders.filter(o => o.orderType === 'production');
  const rdOrders = orders.filter(o => o.orderType === 'r&d');

  const calculateTotals = (orderList: Order[]) => {
    return orderList.reduce(
      (acc, order) => {
        if (order.costs) {
          acc.materialCost += order.costs.materialCost;
          acc.laborCost += order.costs.laborCost;
          acc.totalCost += order.costs.totalCost;
        }
        return acc;
      },
      { materialCost: 0, laborCost: 0, totalCost: 0 }
    );
  };

  const productionTotals = calculateTotals(productionOrders);
  const rdTotals = calculateTotals(rdOrders);
  const grandTotals = calculateTotals(filteredOrders);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading financial data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financials</h1>
        <p className="text-gray-600 mt-1">Production costs and R&D expenses</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Production Sales Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Production Sales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(productionTotals.totalCost)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Material:</span>
              <span className="font-medium">{formatCurrency(productionTotals.materialCost)}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Labor:</span>
              <span className="font-medium">{formatCurrency(productionTotals.laborCost)}</span>
            </div>
            <div className="mt-2 pt-2 border-t text-xs text-gray-500">
              {productionOrders.length} completed orders
            </div>
          </div>
        </div>

        {/* R&D Expenses Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">R&D Expenses</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(rdTotals.totalCost)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Material:</span>
              <span className="font-medium">{formatCurrency(rdTotals.materialCost)}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Labor:</span>
              <span className="font-medium">{formatCurrency(rdTotals.laborCost)}</span>
            </div>
            <div className="mt-2 pt-2 border-t text-xs text-gray-500">
              {rdOrders.length} completed requests
            </div>
          </div>
        </div>

        {/* Total Costs Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Costs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(productionTotals.totalCost + rdTotals.totalCost)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Production:</span>
              <span className="font-medium">{formatCurrency(productionTotals.totalCost)}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>R&D:</span>
              <span className="font-medium">{formatCurrency(rdTotals.totalCost)}</span>
            </div>
            <div className="mt-2 pt-2 border-t text-xs text-gray-500">
              {orders.length} total completed orders
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setFilter('all')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                filter === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All ({filteredOrders.length})
            </button>
            <button
              onClick={() => setFilter('production')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                filter === 'production'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Production ({productionOrders.length})
            </button>
            <button
              onClick={() => setFilter('r&d')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                filter === 'r&d'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              R&D ({rdOrders.length})
            </button>
          </nav>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Material Cost
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Labor Cost
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Cost
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No completed orders with costs yet
                  </td>
                </tr>
              ) : (
                <>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.orderType === 'production'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {order.orderType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.completedAt || order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(order.costs?.materialCost || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(order.costs?.laborCost || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(order.costs?.totalCost || 0)}
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan={3} className="px-6 py-4 text-sm text-gray-900">
                      Total ({filteredOrders.length} orders)
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      {formatCurrency(grandTotals.materialCost)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      {formatCurrency(grandTotals.laborCost)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      {formatCurrency(grandTotals.totalCost)}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
