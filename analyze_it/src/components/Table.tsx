import { useEffect, useState } from 'react';
import data from '../assets/data.json'
import TableHeader from './TableHeader';
import { FilterState } from '../enums/filterStates.enum';
import { Column } from '../types/column';

function Table() {

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
      const [sortedColumn, setSortedColumn] = useState<Column | null>(null);
      const [columns, setColumns] = useState<Column[]>([
        {name: 'N°', state: FilterState.NONE},
        {name: 'Continent', state: FilterState.NONE},
        {name: 'Pays', state: FilterState.NONE},
        {name: 'Date', state: FilterState.NONE},
        {name: 'Confirmés', state: FilterState.NONE},
        {name: 'Actifs', state: FilterState.NONE},
        {name: 'Décès', state: FilterState.NONE},
        {name: 'Guéris', state: FilterState.NONE}
      ]);


      useEffect(()=>{
        handleSortColumn();
      },[sortedColumn])

      useEffect(()=>{
      },[columns])

      const handleSortColumn = () => {
        var newColumns: Column[] = [];
        if(sortedColumn != null){
          columns.map((column)=>{
            if(column.name == sortedColumn.name){
              newColumns.push({
                name:column.name, 
                state:sortedColumn.state
              });
            }else{
              newColumns.push({
                name:column.name, 
                state:FilterState.NONE
              });
            }
          })
          setColumns(newColumns);
        }
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
              {columns.map((column, index) => (
                <TableHeader 
                  key={index} 
                  name={column.name}
                  filterState={column.state}
                  setSortedColumn={setSortedColumn} 
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((entry, key) =>  {
              return (        
                <tr key={key+1}>
                  {Object.keys(entry).map((key) => (
                    <th key={key} className="border-[1px] border-gray-200 text-center">{entry[key as keyof typeof entry]}</th>
                  ))}
                </tr>
              )}
            )}
          </tbody>
        </table>
      </div>
    );
  }
  
  export default Table