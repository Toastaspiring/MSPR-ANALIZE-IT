import { logicEnum } from "../enums/logicEnum";
import Compare from "./Compare.class";
import SubGroup from "./SubGroup.class";

export default class Logic {
    prop: (Compare|Logic|SubGroup)[]
    type: logicEnum

    constructor(
        prop:(Compare|Logic|SubGroup)[]  = [],
        type:logicEnum = logicEnum.AND
        ) {
        this.prop = prop;
        this.type = type;
    }
}