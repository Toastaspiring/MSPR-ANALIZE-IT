import { useState } from 'react';
import data from '../assets/data.json'
import TableHeader from './TableHeader';

function Table() {
    enum FilterState {
        AZ = "az",
        ZA = "za",
        NONE = "none",
      }

    type Record = {
        "N°": number;
        Continent: string;
        Pays: string;
        Date: string;
        Confirmés: number;
        Actifs: number;
        Décès: number;
        Guéris: number;
      };
      
      // Afficher toutes les données
      const dataRows:Record[] = [];
      const [rows,setRows] = useState<Record[]>(fetchData);
      const [sortedColumn, setSortedColumn] = useState<string | null>(null);
      const [filterState, setFilterState] = useState<FilterState>(FilterState.NONE);

      function handleSortedColumn(name:string | null, filterState: FilterState) {
        setSortedColumn(name);
        setFilterState(filterState)
      }

      function fetchData(){ // la passer en async et en fléchée plus tard
            data.forEach((entry: Record) => {
                dataRows.push(entry)
            });
            return dataRows;
      }

      /** Tri croissant
        const ascending = numbers.sort((a, b) => a - b);
        console.log(ascending); // [1, 2, 5, 7, 9]

        Tri décroissant
        const descending = numbers.sort((a, b) => b - a);
        console.log(descending); // [9, 7, 5, 2, 1] 
        */
      // là ce qu'il faudrait c'est annuler les filtres des autres colonnes lorsque l'on clique sur une nouvelle et ajouter la fonctionnalité de tri
    return (
      <div className="m-8">
        <table className="w-full border-collapse shadow-gray-100 shadow-[0px_0px_0px_1px] rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-gray-100"> 
              <TableHeader name={'N°'} filterState={FilterState.NONE} onClick={handleSortedColumn}/>
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
            {rows.map((entry, key) =>  {
                return (        
                    <tr key={key+1}>
                        <th className="border-[1px] border-gray-200 text-center">{entry['N°']}</th>
                        <th className="border-[1px] border-gray-200 text-center">{entry.Continent}</th>
                        <th className="border-[1px] border-gray-200 text-center">{entry.Pays}</th>
                        <th className="border-[1px] border-gray-200 text-center">{entry.Date}</th>
                        <th className="border-[1px] border-gray-200 text-center">{entry.Confirmés}</th>
                        <th className="border-[1px] border-gray-200 text-center">{entry.Actifs}</th>
                        <th className="border-[1px] border-gray-200 text-center">{entry.Décès}</th>
                        <th className="border-[1px] border-gray-200 text-center">{entry.Guéris}</th>
                    </tr>
                )}
            )}
          </tbody>
        </table>
      </div>
    );
  }
  
  export default Table