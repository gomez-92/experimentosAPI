import Connect from "./connect.js"
import MuestraModelo from "./models/muestra.model.js"

class MuestraMongo{
    constructor(){
        Connect.getInstance();
    }

    createMuestra = async(registroId, valor) => {
        return await MuestraModelo.create({registroId, valor});
    }

    getMuestraById = async(muestraId) => {
        return await MuestraModelo.findById(muestraId);
    }

    updateMuestraById = async(muestraId, muestraData) => {
        return await MuestraModelo.findByIdAndUpdate(muestraId, muestraData,  {new: true});
    }
    
    deleteMuestraById = async(muestraId) => {
        return await MuestraModelo.findByIdAndDelete(muestraId, {new: true});
    }
}

export default MuestraMongo