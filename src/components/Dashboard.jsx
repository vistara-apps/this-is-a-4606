import React from 'react'
import { TrendingUp, Package, ShoppingBag, Truck } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'

const Dashboard = ({ orders, products }) => {
  const stats = [
    {
      title: 'Total Orders',
      value: orders.length,
      change: '+12%',
      icon: ShoppingBag,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Shipped Orders',
      value: orders.filter(o => o.status === 'Shipped').length,
      change: '+8%',
      icon: Truck,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Products',
      value: products.length,
      change: '+5%',
      icon: Package,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Revenue',
      value: '$' + orders.reduce((sum, order) => sum + (order.quantity * 29.99), 0).toFixed(0),
      change: '+15%',
      icon: TrendingUp,
      color: 'from-pink-500 to-pink-600'
    }
  ]

  const chartData = [
    { name: 'Mon', orders: 12 },
    { name: 'Tue', orders: 19 },
    { name: 'Wed', orders: 8 },
    { name: 'Thu', orders: 25 },
    { name: 'Fri', orders: 18 },
    { name: 'Sat', orders: 32 },
    { name: 'Sun', orders: 15 }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-0">Dashboard</h2>
        <div className="text-xs sm:text-sm text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="bg-dark-card/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 lg:p-6 border border-dark-border">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs sm:text-sm font-medium truncate">{stat.title}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white mt-1 truncate">{stat.value}</p>
                  <p className="text-green-400 text-xs sm:text-sm mt-1">{stat.change}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-r ${stat.color} flex-shrink-0 ml-2`}>
                  <Icon size={20} className="text-white sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Order Volume Chart */}
        <div className="bg-dark-card/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-dark-border">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Order Volume</h3>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-dark-card/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-dark-border">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Recent Orders</h3>
          <div className="space-y-3 sm:space-y-4">
            {orders.slice(0, 5).map((order) => (
              <div key={order.orderId} className="flex items-center justify-between p-2 sm:p-3 bg-dark-surface/50 rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="text-white font-medium text-sm sm:text-base truncate">{order.customerName}</p>
                  <p className="text-gray-400 text-xs sm:text-sm truncate">{order.productName}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-white font-medium text-sm sm:text-base">${(order.quantity * 29.99).toFixed(2)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'Shipped' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard