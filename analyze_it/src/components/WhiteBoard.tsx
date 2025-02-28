
import { useEffect, useState } from 'react';
import FilterModal from './FilterModal';

const WhiteBoard = () => {
    const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
    const [filterOptions, setFilterOptions] = useState<any>(null);

    /*
        options = {
            where: {
                date > '2022-01-01'
            }
        }

        options = {
            where: {
                and: {
                    [
                        date > '2022-01-01',
                        country = 'France'
                    ]
                }
            }
        }

        options = {
            where: {
                and: {
                    [
                        or: {
                            [
                                country = 'Italy',
                                country = 'France'
                            ]
                        },
                        date > '2022-01-01'
                    ]
                }
            }
        }
    */

    useEffect(()=>{
        console.log("Filter options :",filterOptions)
    },[filterOptions])

    return (
        <div className='w-full h-[100vh] bg-gray-400'>
            <button 
                className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition ${showFilterModal ? 'bg-blue-600' : ''}`} 
                onClick={() => setShowFilterModal(true)}
            >
                Filtres
            </button>

            {showFilterModal && 
            <FilterModal 
                setShowFilterModal={setShowFilterModal}
                setFilterOptions={setFilterOptions}
            />}
        </div>
    )
}

export default WhiteBoard