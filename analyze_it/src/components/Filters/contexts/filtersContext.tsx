import React, { createContext, useContext } from "react";
import SubGroup from "../classes/SubGroup.class";

interface FiltersContextType {
    subGroup: SubGroup;
    depth: number;
}

const SubGroupContext = createContext<FiltersContextType | undefined>(undefined);

export const useFiltersContext = () => {
    const context = useContext(SubGroupContext);
    if (!context) {
        throw new Error("useSubGroupContext must be used within FiltersProvider");
    }
    return context;
};

function getDepth(subGroup: SubGroup): number {
    if (!subGroup.prop || subGroup.prop.length === 0) return 1;

    const depths = subGroup.prop.map((p: any) => {
        if (p instanceof SubGroup) {
            return 1 + getDepth(p);
        }
        return 1;
    });

    return Math.max(...depths);
}

export const FiltersProvider: React.FC<{ subGroup: SubGroup; children: React.ReactNode }> = ({ subGroup, children }) => {
    const depth = getDepth(subGroup);

    return (
        <SubGroupContext.Provider value={{ subGroup, depth }}>
        {children}
        </SubGroupContext.Provider>
    );
};