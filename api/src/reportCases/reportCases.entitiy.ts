import { Disease } from "src/diseases/disease.entity"
import { Localization } from "src/localizations/localization.entity";
import { AfterInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"

@Entity('ReportCase')
export class ReportCase {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    totalConfirmed: number

    @Column()
    totalDeath: number

    @Column()
    totalActive: number

    @Column()
    localizationId: number

    @Column()
    diseaseId: number

    @Column()
    date: Date

    // @ManyToOne(() => Localization, (localization) => localization.reportCases, { eager: true })
    // @JoinColumn({ name: 'localizationId' })
    // localization: Localization;

    // @ManyToOne(() => Disease, (disease) => disease.reportCases, { eager: true })
    // @JoinColumn({ name: 'diseaseId' })
    // disease: Disease;

    @AfterInsert()
    logInsert() {
        console.log('Case created with id ' + this.id)
    }
}