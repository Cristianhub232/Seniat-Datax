import { DataTypes, Model } from 'sequelize';
import { authSequelize } from '@/lib/db';

export interface CarteraContribuyenteAttributes {
  id: string;
  rif: string;
  tipoContribuyente: 'NATURAL' | 'JURIDICO' | 'GOBIERNO' | 'CONSEJO_COMUNAL';
  usuarioId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CarteraContribuyenteCreationAttributes extends Omit<CarteraContribuyenteAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class CarteraContribuyente extends Model<CarteraContribuyenteAttributes, CarteraContribuyenteCreationAttributes> implements CarteraContribuyenteAttributes {
  public id!: string;
  public rif!: string;
  public tipoContribuyente!: 'NATURAL' | 'JURIDICO' | 'GOBIERNO' | 'CONSEJO_COMUNAL';
  public usuarioId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CarteraContribuyente.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    rif: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      validate: {
        len: [10, 10],
        is: /^[JVEPGC]\d{9}$/,
      },
    },
    tipoContribuyente: {
      type: DataTypes.ENUM('NATURAL', 'JURIDICO', 'GOBIERNO', 'CONSEJO_COMUNAL'),
      allowNull: false,
    },
    usuarioId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: 'USERS',
        key: 'ID',
      },
    },
  },
  {
    sequelize: authSequelize,
    tableName: 'CARTERA_CONTRIBUYENTES',
    schema: 'CGBRITO',
    timestamps: true,
    createdAt: 'CREATED_AT',
    updatedAt: 'UPDATED_AT',
  }
);

export default CarteraContribuyente; 