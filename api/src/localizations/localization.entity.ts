import { ReportCase } from "../reportCases/reportCases.entity";
import { AfterInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"

@Entity('Localization')
export class Localization {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    country: string

    @Column()
    continent: string

    @OneToMany(() => ReportCase, (reportCase) => reportCase.localization)
    reportCases: ReportCase[];

    @AfterInsert()
    logInsert() {
        console.log('Localization created with id ' + this.id)
    }
}