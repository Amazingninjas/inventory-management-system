import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, orderAPI } from '../api';
import { Product, Order } from '../types';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function InventoryDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInventoryValue: 0,
    rawMaterialsValue: 0,
    wipValue: 0,
    finishedGoodsValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes] = await Promise.all([
        productAPI.getAll(),
        orderAPI.getAll(),
      ]);

      const productsData = productsRes.data;
      const ordersData = ordersRes.data;

      setProducts(productsData);
      setOrders(ordersData);

      // Calculate inventory statistics
      const totalInventoryValue = productsData.reduce(
        (sum, p) => sum + p.quantity * p.costPerUnit,
        0
      );

      const rawMaterialsValue = productsData
        .filter((p) => p.productType === 'raw')
        .reduce((sum, p) => sum + p.quantity * p.costPerUnit, 0);

      const wipValue = productsData
        .filter((p) => p.productType === 'wip')
        .reduce((sum, p) => sum + p.quantity * p.costPerUnit, 0);

      const finishedGoodsValue = productsData
        .filter((p) => p.productType === 'finished')
        .reduce((sum, p) => sum + p.quantity * p.costPerUnit, 0);

      const lowStockCount = productsData.filter(
        (p) => p.quantity > 0 && p.quantity < 50
      ).length;

      const outOfStockCount = productsData.filter((p) => p.quantity === 0).length;

      setStats({
        totalInventoryValue,
        rawMaterialsValue,
        wipValue,
        finishedGoodsValue,
        lowStockCount,
        outOfStockCount,
      });
    } catch (error) {
      console.error('Failed to fetch inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Stock Levels by Product
  const getStockLevelsData = () => {
    return products
      .filter((p) => p.quantity > 0)
      .sort((a, b) => b.quantity - a.quantity)
      .map((p) => ({
        name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
        fullName: p.name,
        quantity: p.quantity,
        value: p.quantity * p.costPerUnit,
        type: p.productType,
      }));
  };

  // Inventory Value by Product (Top 10)
  const getInventoryValueData = () => {
    return products
      .map((p) => ({
        name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
        fullName: p.name,
        value: p.quantity * p.costPerUnit,
        quantity: p.quantity,
        costPerUnit: p.costPerUnit,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  };

  // Stock Status Distribution
  const getStockStatusData = () => {
    const outOfStock = products.filter((p) => p.quantity === 0).length;
    const lowStock = products.filter((p) => p.quantity > 0 && p.quantity < 50).length;
    const adequateStock = products.filter((p) => p.quantity >= 50 && p.quantity < 1000).length;
    const highStock = products.filter((p) => p.quantity >= 1000).length;

    return [
      { name: 'Out of Stock', count: outOfStock, color: '#ef4444' },
      { name: 'Low Stock', count: lowStock, color: '#f59e0b' },
      { name: 'Adequate', count: adequateStock, color: '#10b981' },
      { name: 'High Stock', count: highStock, color: '#3b82f6' },
    ].filter((item) => item.count > 0);
  };

  // Inventory Movement (Last 30 days simulation based on completed orders)
  const getInventoryMovementData = () => {
    const completedOrders = orders
      .filter((o) => o.status === 'completed' && o.completedAt)
      .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime())
      .slice(-10);

    let cumulativeValue = stats.totalInventoryValue;
    const movements = [];

    // Simulate starting value
    movements.push({
      date: 'Start',
      value: cumulativeValue * 0.7, // Simulate lower starting value
      inbound: 0,
      outbound: 0,
    });

    for (const order of completedOrders) {
      const date = new Date(order.completedAt!).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      let inbound = 0;
      let outbound = 0;

      // Calculate inbound (outputs)
      if (order.outputs && order.outputs.length > 0) {
        inbound = order.outputs.reduce((sum, item) => {
          return sum + item.quantity * (item.costPerUnit || 0);
        }, 0);
      }

      // Calculate outbound (inputs)
      if (order.inputs && order.inputs.length > 0) {
        outbound = order.inputs.reduce((sum, item) => {
          return sum + item.quantity * (item.costPerUnit || 0);
        }, 0);
      }

      cumulativeValue = cumulativeValue + inbound - outbound;

      movements.push({
        date,
        value: cumulativeValue,
        inbound,
        outbound,
      });
    }

    return movements;
  };

  // Low Stock Items
  const getLowStockItems = () => {
    return products
      .filter((p) => p.quantity > 0 && p.quantity < 50)
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 5);
  };

  // High Value Items
  const getHighValueItems = () => {
    return products
      .map((p) => ({
        ...p,
        totalValue: p.quantity * p.costPerUnit,
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getProductTypeBadge = (type: string) => {
    const styles = {
      raw: 'bg-blue-100 text-blue-800',
      wip: 'bg-orange-100 text-orange-800',
      finished: 'bg-green-100 text-green-800',
    };
    return styles[type as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getStockStatusColor = (quantity: number) => {
    if (quantity === 0) return '#ef4444'; // red
    if (quantity < 50) return '#f59e0b'; // orange
    if (quantity < 1000) return '#10b981'; // green
    return '#3b82f6'; // blue
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading inventory data...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Link
            to="/products"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Manage Inventory
          </Link>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Total Value</p>
              <p className="text-2xl font-bold mt-2">
                {formatCurrency(stats.totalInventoryValue)}
              </p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Raw Materials</p>
              <p className="text-2xl font-bold mt-2">
                {formatCurrency(stats.rawMaterialsValue)}
              </p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">WIP</p>
              <p className="text-2xl font-bold mt-2">
                {formatCurrency(stats.wipValue)}
              </p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Finished Goods</p>
              <p className="text-2xl font-bold mt-2">
                {formatCurrency(stats.finishedGoodsValue)}
              </p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Low Stock</p>
              <p className="text-2xl font-bold mt-2">
                {stats.lowStockCount}
              </p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Out of Stock</p>
              <p className="text-2xl font-bold mt-2">
                {stats.outOfStockCount}
              </p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Stock Levels by Product */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Stock Levels</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getStockLevelsData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'quantity') return `${value} MSI`;
                  if (name === 'value') return formatCurrency(Number(value));
                  return value;
                }}
              />
              <Legend />
              <Bar dataKey="quantity" name="Quantity (MSI)">
                {getStockLevelsData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getStockStatusColor(entry.quantity)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Inventory Value by Product */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Items by Value</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getInventoryValueData()} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="value" fill="#3b82f6" name="Total Value" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getStockStatusData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" name="Product Count">
                {getStockStatusData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Inventory Movement Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory Value Movement</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={getInventoryMovementData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'value') return formatCurrency(Number(value));
                  if (name === 'inbound') return `+${formatCurrency(Number(value))}`;
                  if (name === 'outbound') return `-${formatCurrency(Number(value))}`;
                  return value;
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Total Value" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Items */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
              {stats.lowStockCount} items
            </span>
          </div>
          <div className="divide-y divide-gray-200">
            {getLowStockItems().length === 0 ? (
              <div className="p-6 text-center text-gray-500">No low stock items</div>
            ) : (
              getLowStockItems().map((product) => (
                <div key={product.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{product.name}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getProductTypeBadge(product.productType)}`}>
                          {product.productType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Lot: {product.lot} • Location: {product.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-yellow-600">{product.quantity} MSI</div>
                      <div className="text-sm text-gray-500">{formatCurrency(product.costPerUnit)}/MSI</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* High Value Items */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top 5 Items by Value</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {getHighValueItems().length === 0 ? (
              <div className="p-6 text-center text-gray-500">No inventory items</div>
            ) : (
              getHighValueItems().map((product, index) => (
                <div key={product.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{product.name}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getProductTypeBadge(product.productType)}`}>
                            {product.productType}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {product.quantity} MSI @ {formatCurrency(product.costPerUnit)}/MSI
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(product.totalValue)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
