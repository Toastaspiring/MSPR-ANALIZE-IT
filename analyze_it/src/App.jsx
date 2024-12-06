function App() {
  const rows = Array.from({ length: 30 }, (_, i) => (
    <tr key={i} className="border-b-[1px] border-black">
      <td>{i + 1}</td>
      <td>{["Europe", "Amérique", "Asie", "Afrique"][Math.floor(Math.random() * 4)]}</td>
      <td className="m-2 px-2">{["Allemagne", "Brésil", "Japon", "Afrique du Sud"][Math.floor(Math.random() * 4)]}</td>
      <td>2024-11-19</td>
      <td>{Math.floor(Math.random() * 100000) + 1000}</td>
      <td>{Math.floor(Math.random() * 20000)}</td>
      <td>{Math.floor(Math.random() * 5000)}</td>
      <td>{Math.floor(Math.random() * 80000)}</td>
    </tr>
  ));

  return (
    <table className="m-2 bg-red-200">
      <thead>
        <tr>
          <th className="m-2 px-2 border-2 border-black">N°</th>
          <th className="m-2 px-2 border-2 border-black">Continent</th>
          <th className="m-2 px-2 border-2 border-black">Pays</th>
          <th className="m-2 px-2 border-2 border-black">Date</th>
          <th className="m-2 px-2 border-2 border-black">Confirmés</th>
          <th className="m-2 px-2 border-2 border-black">Actifs</th>
          <th className="m-2 px-2 border-2 border-black">Décès</th>
          <th className="m-2 px-2 border-2 border-black">Guéris</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

export default App
