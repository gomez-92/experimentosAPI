import Connect from "./connect.js";
import MuestraFDRModel from "./models/muestraFDR.model.js";

class MuestraFDRMongo{
    constructor(){
        Connect.getInstance();
    }

    getMuestraFDRById = async(muestraFDRId) => {
        return await MuestraFDRModel.findById(muestraFDRId);
    }

    createMuestraFDR = async(muestraFDRData) => {
        return await MuestraFDRModel.create(muestraFDRData);
    }
    
    updateMuestraFDRById = async(muestraFDRId, muestraFDRData) => {
        return await MuestraFDRModel.findByIdAndUpdate(muestraFDRId, muestraFDRData);
    }

    deleteMuestraFDRById = async(muestraFDRId) => {
        return await MuestraFDRModel.findByIdAndDelete(muestraFDRId);
    }
}

export default MuestraFDRMongo;