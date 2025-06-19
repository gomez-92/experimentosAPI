import Connect from "./connect.js";
import RegistroModelo from "./models/registro.model.js";

class RegistroMongo {
    constructor(){
        Connect.getInstance();
    }

    createRegistro = async(experimentoId, nombre, tipo, unidad) => {
        return await RegistroModelo.create({experimentoId, nombre, tipo, unidad});
    }
    
    getRegistroDetalleById = async(registroId) => {
        return await RegistroModelo.findById(registroId)
        .populate("configuracion")
        .populate("muestras");
    }

    getRegistroById = async(registroId) => {
        return await RegistroModelo.findById(registroId)
        .populate("configuracion");
    }

    updateRegistroById = async(registroId, registroData) => {
        return await RegistroModelo.findByIdAndUpdate(registroId, registroData, {new: true});
    }

    deleteRegistroById = async(registroId) => {
        return await RegistroModelo.findByIdAndDelete(registroId);
    }
}

export default RegistroMongo;