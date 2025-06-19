import mongoose from "mongoose";

// Definición del esquema
const experimentoEnCursoSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: "enCurso" // Siempre será el único documento
  },
  experimento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Experimento",
    required: true
  }
});

export default mongoose.model("ExperimentoEnCurso", experimentoEnCursoSchema);