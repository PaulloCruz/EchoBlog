import conn from "../config/conn.js";
import { DataTypes } from "sequelize";

const Postagem = conn.define(
  "postagens",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conteudo: {
      type: DataTypes.STRING,
      allowNull: false,
      required: true,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
      required: true,
    },
    autor: {
      type: DataTypes.STRING,
      allowNull: false,
      required: true,
    },
    imagem: {
      type: DataTypes.STRING,
      allowNull: true,
      required: false,
    },
  },
  {
    tableName: "postagens",
  }
);

export default Postagem;
