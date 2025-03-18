import { Role } from "../roles/role.entity";
import { AfterInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"

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

    @AfterInsert()
    logInsert() {
        console.log('Localization created with id ' + this.id)
    }
}