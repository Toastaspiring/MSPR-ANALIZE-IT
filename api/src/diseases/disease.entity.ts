
import { ReportCase } from "src/reportCases/reportCases.entitiy";
import { AfterInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"

@Entity('Disease')
export class Disease {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @OneToMany(() => ReportCase, (reportCase) => reportCase.disease)
    reportCases: ReportCase[];

    @AfterInsert()
    logInsert() {
        console.log('Disease created with id ' + this.id)
    }
}