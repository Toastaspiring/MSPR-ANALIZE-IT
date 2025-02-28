import FilterInputsCard from "./FilterInputsCard";

interface FilterModalProps {
    setShowFilterModal: (value: boolean) => void;
    setFilterOptions: (value: string) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ 
    setShowFilterModal,
    setFilterOptions
}) => {
    // il faut que je fasse en sorte de sortir la data uniquement par la fonction de donnée par le parent
    // Je fais tout le reste du traitement ici

    // const handleFilterOptions = () => {
    //     console.log("handleFilterOptions")
    //     setFilterOptions('feur');
    // }

    return (
        <div className='top-0 left-0 absolute z-10 w-full h-full bg-white bg-opacity-30 flex justify-center items-center'>
            <div className='w-[70vw] h-[90vh] bg-white rounded-xl flex flex-col p-4'>
                <div className='flex items-center text-[#989ea1]'>
                    <button
                        className={'w-fit px-3 py-1 text-[#989ea1] bg-white rounded-lg transition hover:bg-[#f6f5f7] fit-content'} 
                        onClick={() => setShowFilterModal(false)} 
                    >
                        X
                    </button>
                    <h1 className='pl-2 text-xl'>Filters</h1>
                </div>
                <div className='mt-2 h-full border-2 border-[#f6f5f7] text-[#989ea1] bg-white rounded-lg p-2'>
                    <div className='flex'>
                        <h2 className='text-md pr-2'>Where :</h2> <FilterInputsCard/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FilterModal