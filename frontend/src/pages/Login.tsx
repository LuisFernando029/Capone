import React from 'react'

export default function LoginPage() {
  return (
    <div className="max-w-sm mx-auto mt-20 bg-white p-6 rounded shadow">
      <h2 className="text-lg font-medium mb-4">Entrar</h2>
      <form className="space-y-3">
        <input placeholder="Email" className="w-full p-2 border rounded" />
        <input placeholder="Senha" type="password" className="w-full p-2 border rounded" />
        <button className="w-full p-2 bg-indigo-600 text-white rounded">Entrar</button>
      </form>
    </div>
  )
}