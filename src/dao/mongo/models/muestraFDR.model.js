import mongoose from "mongoose";

const muestraFDRSchema = new mongoose.Schema({
    experimentoId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    registroId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    muestraId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

export default mongoose.model("MuestraFDR", muestraFDRSchema);