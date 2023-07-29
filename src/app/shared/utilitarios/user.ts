export interface User {
    id: number,
    first_name: string;
    last_name: string;
    cpf: string;
    email: string;
    data_nasc?: Date;
    telefone?: string;
    building_id: string;
    credito?: string;
    password: string;
    token:string;
    building_name: string;
    apt_name:string;
    role:string;
    create_time?:string;
  }