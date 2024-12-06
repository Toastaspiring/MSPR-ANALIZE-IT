function App() {
  const rows = Array.from({ length: 30 }, (_, i) => (
    <tr key={i} className="border-b-[1px] border-gray-200">
      <td className="px-2">{i + 1}</td>
      <td className="px-2">{["Europe", "Amérique", "Asie", "Afrique"][Math.floor(Math.random() * 4)]}</td>
      <td className="px-2">{["Allemagne", "Brésil", "Japon", "Afrique du Sud"][Math.floor(Math.random() * 4)]}</td>
      <td className="px-2">2024-11-19</td>
      <td className="px-2">{Math.floor(Math.random() * 100000) + 1000}</td>
      <td className="px-2">{Math.floor(Math.random() * 20000)}</td>
      <td className="px-2">{Math.floor(Math.random() * 5000)}</td>
      <td className="px-2">{Math.floor(Math.random() * 80000)}</td>
    </tr>
  ));

  return (
    <div className="m-8">
      <table className="w-full border-collapse shadow-gray-100 shadow-[0px_0px_0px_1px] rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-gray-100">
            <th className="border-[1px] border-gray-200 p-4 text-center">N°</th>
            <th className="border-[1px] border-gray-200 p-4 text-center">Continent</th>
            <th className="border-[1px] border-gray-200 p-4 text-center">Pays</th>
            <th className="border-[1px] border-gray-200 p-4 text-center">Date</th>
            <th className="border-[1px] border-gray-200 p-4 text-center">Confirmés</th>
            <th className="border-[1px] border-gray-200 p-4 text-center">Actifs</th>
            <th className="border-[1px] border-gray-200 p-4 text-center">Décès</th>
            <th className="border-[1px] border-gray-200 p-4 text-center">Guéris</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  );
}

export default App