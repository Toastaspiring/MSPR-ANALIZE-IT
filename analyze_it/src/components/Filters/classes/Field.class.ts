import { typeEnum } from "../enums/typeEnum";

export default class Field {
    label: string;
    type: typeEnum;

    constructor(label: string, type: typeEnum) {
        this.label = label;
        this.type = type;
    }
}

export const fields :Field[] = [
    {label:"Continent", type: typeEnum.STRING},
    {label:"Country", type: typeEnum.STRING},
    {label:"Date", type: typeEnum.DATE},
    {label:"TotalActive", type: typeEnum.NUMBER},
    {label:"TotalDeath", type: typeEnum.NUMBER},
    {label:"TotalConfirmed", type: typeEnum.NUMBER},
    {label:"vaccinationRate", type: typeEnum.NUMBER},
    {label:"Disease", type: typeEnum.STRING}
]