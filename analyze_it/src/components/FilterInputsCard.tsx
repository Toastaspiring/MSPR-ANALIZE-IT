const FilterInputsCard = () => {
  return (
    <div className="border-2 border-[#f6f5f7] text-[#989ea1] bg-white rounded-lg">
        <button id='drag-area'></button>
        <select id='column-select' className=''>
            <option>colonne</option>
        </select>
        <select id='operation-select'>
            <option>operation</option>
        </select>
    </div>
  )
}

export default FilterInputsCard