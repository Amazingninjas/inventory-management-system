import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, orderAPI } from '../api';
import { Order, Product } from '../types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProductionCost: 0,
    totalInventoryValue: 0,
    avgCostPerUnit: 0,
    completedOrdersThisMonth: 0,
    totalProducts: 0,
    pendingOrders: 0,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
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

      // Calculate stats
      const completedOrders = ordersData.filter((o) => o.status === 'completed');
      const productionOrders = completedOrders.filter((o) => o.orderType === 'production');

      // Total production costs
      const totalProductionCost = productionOrders.reduce(
        (sum, o) => sum + (o.costs?.totalCost || 0),
        0
      );

      // Total inventory value
      const totalInventoryValue = productsData.reduce(
        (sum, p) => sum + p.quantity * p.costPerUnit,
        0
      );

      // Average cost per unit (finished goods)
      const finishedGoods = productsData.filter((p) => p.productType === 'finished');
      const avgCostPerUnit = finishedGoods.length > 0
        ? finishedGoods.reduce((sum, p) => sum + p.costPerUnit, 0) / finishedGoods.length
        : 0;

      // Orders completed this month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const completedThisMonth = completedOrders.filter((o) => {
        if (!o.completedAt) return false;
        return new Date(o.completedAt) >= firstDayOfMonth;
      }).length;

      setStats({
        totalProductionCost,
        totalInventoryValue,
        avgCostPerUnit,
        completedOrdersThisMonth: completedThisMonth,
        totalProducts: productsData.length,
        pendingOrders: ordersData.filter((o) => o.status === 'pending').length,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Production Output Trend (last 10 completed production orders)
  const getProductionTrendData = () => {
    const productionOrders = orders
      .filter((o) => o.orderType === 'production' && o.status === 'completed')
      .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime())
      .slice(-10);

    return productionOrders.map((o) => ({
      name: o.orderNumber,
      material: o.costs?.materialCost || 0,
      labor: o.costs?.laborCost || 0,
      total: o.costs?.totalCost || 0,
      date: new Date(o.completedAt!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  };

  // Cost Breakdown by Order Type
  const getCostBreakdownData = () => {
    const orderTypes = ['production', 'r&d', 'maintenance', 'sales', 'shipping'];
    return orderTypes.map((type) => {
      const ordersOfType = orders.filter(
        (o) => o.orderType === type && o.status === 'completed'
      );
      const totalCost = ordersOfType.reduce((sum, o) => sum + (o.costs?.totalCost || 0), 0);
      const materialCost = ordersOfType.reduce((sum, o) => sum + (o.costs?.materialCost || 0), 0);
      const laborCost = ordersOfType.reduce((sum, o) => sum + (o.costs?.laborCost || 0), 0);

      return {
        name: type.charAt(0).toUpperCase() + type.slice(1),
        material: materialCost,
        labor: laborCost,
        total: totalCost,
        count: ordersOfType.length,
      };
    }).filter(item => item.count > 0);
  };

  // Inventory Value by Type
  const getInventoryValueData = () => {
    const types = [
      { key: 'raw', name: 'Raw Materials', color: '#3b82f6' },
      { key: 'wip', name: 'Work in Progress', color: '#f59e0b' },
      { key: 'finished', name: 'Finished Goods', color: '#10b981' },
    ];

    return types.map(({ key, name, color }) => {
      const productsOfType = products.filter((p) => p.productType === key);
      const value = productsOfType.reduce((sum, p) => sum + p.quantity * p.costPerUnit, 0);
      return { name, value, color };
    }).filter(item => item.value > 0);
  };

  // Cost per Unit Trend (finished goods)
  const getCostPerUnitTrendData = () => {
    const finishedGoods = products
      .filter((p) => p.productType === 'finished' && p.costPerUnit > 0)
      .sort((a, b) => a.name.localeCompare(b.name));

    return finishedGoods.map((p) => ({
      name: p.name,
      cost: p.costPerUnit,
      value: p.quantity * p.costPerUnit,
    }));
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Total Production Cost</p>
              <p className="text-2xl font-bold mt-2">
                {formatCurrency(stats.totalProductionCost)}
              </p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Inventory Value</p>
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

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Avg Cost/Unit</p>
              <p className="text-2xl font-bold mt-2">
                {formatCurrency(stats.avgCostPerUnit)}
              </p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Orders This Month</p>
              <p className="text-2xl font-bold mt-2">
                {stats.completedOrdersThisMonth}
              </p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Total Products</p>
              <p className="text-2xl font-bold mt-2">
                {stats.totalProducts}
              </p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Pending Orders</p>
              <p className="text-2xl font-bold mt-2">
                {stats.pendingOrders}
              </p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Production Output Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Production Cost Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getProductionTrendData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="material" stroke="#3b82f6" name="Material" strokeWidth={2} />
              <Line type="monotone" dataKey="labor" stroke="#10b981" name="Labor" strokeWidth={2} />
              <Line type="monotone" dataKey="total" stroke="#8b5cf6" name="Total" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Breakdown by Order Type */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown by Order Type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getCostBreakdownData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="material" stackId="a" fill="#3b82f6" name="Material" />
              <Bar dataKey="labor" stackId="a" fill="#10b981" name="Labor" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Inventory Value by Type */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory Value by Type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getInventoryValueData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getInventoryValueData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Cost per Unit by Product */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Finished Goods Cost Analysis</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getCostPerUnitTrendData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar yAxisId="left" dataKey="cost" fill="#3b82f6" name="Cost per Unit" />
              <Bar yAxisId="right" dataKey="value" fill="#10b981" name="Total Value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/orders?filter=production"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Production Orders</h3>
              <p className="text-sm text-gray-600 mt-1">View all production orders</p>
            </div>
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </Link>

        <Link
          to="/products?filter=finished"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Finished Goods</h3>
              <p className="text-sm text-gray-600 mt-1">View inventory levels</p>
            </div>
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </Link>

        <Link
          to="/orders?filter=r&d"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">R&D Orders</h3>
              <p className="text-sm text-gray-600 mt-1">Track R&D spending</p>
            </div>
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </Link>
      </div>
    </div>
  );
}
