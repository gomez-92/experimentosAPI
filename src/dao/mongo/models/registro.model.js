import mongoose from "mongoose";

const registroSchema = new mongoose.Schema({
  tipo: {
    type: String,
    required: true,
    trim: true,
    enum: ["temperatura", "corriente", "voltaje", "campo_magnetico"]
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  unidad: {
    type: String,
    required: true,
    trim: true
  },
  experimentoId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  configuracion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Configuracion",
  }, 
  muestras: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Muestra",
    default: []
  }]
});

export default mongoose.model("Registro", registroSchema);