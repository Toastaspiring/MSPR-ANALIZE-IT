import { Localization } from "../localizations/localization.entity";
import { ReportCase } from "../reportCases/reportCases.entity";
import { AfterInsert, Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"

@Entity('LocalizationData')
export class LocalizationData {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    localizationId: number

    @Column()
    @Index()
    date: Date;

    @Column()
    inhabitantsNumber: number

    @Column()
    vaccinationRate: number

    @ManyToOne(() => Localization, (localization) => localization.localizationData, { eager: true })
    @JoinColumn({ name: 'localizationId' })
    localization: Localization;

    @AfterInsert()
    logInsert() {
        console.log('Localization data created with id ' + this.id)
    }
}