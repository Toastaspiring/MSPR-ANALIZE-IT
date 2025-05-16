import { Localization } from "../localizations/localization.entity";
import { Role } from "../roles/role.entity";
import { AfterInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Language } from "../languages/language.entity";

@Entity('User')
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    username: string

    @Column()
    password: string

    @ManyToOne(() => Role, role => role.users, { eager: true })
    @JoinColumn({ name: 'roleId' })
    role: Role;

    @ManyToOne(() => Localization, localization => localization.users, { eager: true })
    @JoinColumn({ name: 'localizationId' })
    localization: Localization;

    @ManyToOne(() => Language, language => language.users, { eager: true })
    @JoinColumn({ name: 'languageId' })
    language: Language;

    @AfterInsert()
    logInsert() {
        console.log('Localization created with id ' + this.id)
    }
}