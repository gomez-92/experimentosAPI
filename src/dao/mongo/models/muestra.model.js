import mongoose from "mongoose";

const muestraSchema = new mongoose.Schema({
    registroId:{
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    valor: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
});

export default mongoose.model("Muestra", muestraSchema);