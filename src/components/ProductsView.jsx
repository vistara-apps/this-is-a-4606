import React from 'react'
import { Package, AlertTriangle } from 'lucide-react'

const ProductsView = ({ products }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-0">Products</h2>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto">
          Add Product
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {products.map((product) => (
          <div key={product.productId} className="bg-dark-card/50 backdrop-blur-sm rounded-xl p-6 border border-dark-border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Package size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{product.productName}</h3>
                  <p className="text-gray-400 text-sm">SKU: {product.sku}</p>
                </div>
              </div>
              
              {product.stockLevel < 10 && (
                <div className="flex items-center space-x-1 text-yellow-400">
                  <AlertTriangle size={16} />
                  <span className="text-xs">Low Stock</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Stock Level:</span>
                <span className={`font-semibold ${
                  product.stockLevel < 10 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {product.stockLevel} units
                </span>
              </div>

              <div className="w-full bg-dark-surface rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    product.stockLevel < 10 ? 'bg-yellow-400' : 'bg-green-400'
                  }`}
                  style={{ width: `${Math.min((product.stockLevel / 50) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-dark-border flex space-x-2">
              <button className="flex-1 bg-dark-surface hover:bg-dark-border text-white py-2 px-4 rounded-lg transition-colors text-sm">
                Edit
              </button>
              <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors text-sm">
                Restock
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductsView