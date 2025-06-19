import mongoose from "mongoose";

const configuracionSchema = new mongoose.Schema({
  registroId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Registro" // si hay una colección relacionada
  },
  valorMin: {
    type: Number,
    required: true
  },
  valorMax: {
    type: Number,
    required: true
  }
});

export default mongoose.model("Configuracion", configuracionSchema);