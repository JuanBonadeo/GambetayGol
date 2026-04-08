export default function CategoriasPage() {
  const categorias = ["Fan", "Jugador", "Retro"];
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Categorías</h2>
      <div className="bg-[#111] border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-[#0a0a0a] text-gray-400">
            <tr>
              <th className="px-6 py-4 font-semibold uppercase">Nombre</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {categorias.map((cat) => (
              <tr key={cat} className="hover:bg-gray-800/50">
                <td className="px-6 py-4">{cat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
