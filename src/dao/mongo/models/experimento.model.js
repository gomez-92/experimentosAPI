import mongoose from "mongoose";
import "../models/registro.model.js";
import "../models/muestraFDR.model.js";

const experimentoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  estado: {
    type: String,
    required: true,
    trim: true,
    default: "CREADO",
    enum: {
      values: ["CREADO", "EN_CURSO", "FINALIZADO", "ABORTADO"],
      message: 'Estado no válido. Debe ser "CREADO", "EN_CURSO", "FINALIZADO" o "ABORTADO".'
    }
  },
  inicio: {
    type: Date,
    default: null
  },
  fin: {
    type: Date,
    default: null
  },
  duracion: {
    type: Number,
    required: true,
    min: 0
  },
  registros: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Registro",
    default: []
  }],
  muestrasFDR: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "MuestraFDR",
    default: []
  }]
});

// Método para verificar si el experimento ya finalizó
experimentoSchema.methods.yaFinalizo = function () {
  if (!this.inicio) return false;
  const ahora = new Date();
  const fin = new Date(this.inicio.getTime() + this.duracion * 1000);
  return ahora >= fin;
};

// Método para obtener el tiempo restante
experimentoSchema.methods.tiempoRestante = function () {
  if (!this.inicio) return this.duracion; // aún no empezó, queda todo
  const ahora = new Date();
  const fin = new Date(this.inicio.getTime() + this.duracion * 1000);
  const restante = Math.max(0, (fin - ahora) / 1000); // en segundos
  return Math.floor(restante);
};

// Método para obtener la cantidad de registros fuera de rango
experimentoSchema.methods.getCantRegFDR = function () {
  return this.muestrasFDR.length;
};

export default mongoose.model("Experimento", experimentoSchema);
