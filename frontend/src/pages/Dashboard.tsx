import React from 'react'

export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">Comandas Abertas</div>
        <div className="p-4 bg-white rounded shadow">Vendas Hoje</div>
        <div className="p-4 bg-white rounded shadow">Estoque Baixo</div>
      </div>
    </div>
  )
}