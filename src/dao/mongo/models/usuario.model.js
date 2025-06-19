import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  pass_hash: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true, // evita duplicados
    match: [/.+@.+\..+/, "Correo electrónico inválido"]
  },
  rol: {
    type: String,
    required: true
  },
  activo: {
    type: Boolean,
    default: false
  },
  token_activacion: {
    type: String
  },
  token_activacion_expires: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model("Usuario", usuarioSchema);