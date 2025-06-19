import Connect from "./connect.js"
import ConfiguracionModelo from "./models/configuracion.model.js"

class ConfiguracionMongo{
    constructor(){
        Connect.getInstance();
    }

    createConfiguracion = async(configuracionData) => {
        return await ConfiguracionModelo.create(configuracionData);
    }
    
    getConfiguracionById = async(configuracionId) => {
        return await ConfiguracionModelo.findById(configuracionId);
    }
    
    getConfiguracionByRegistroId = async(registroId) => {
        return await ConfiguracionModelo.findOne({registroId});
    }

    updateConfiguracionById = async(configuracionId, configuracionData) => {
        return await ConfiguracionModelo.findByIdAndUpdate(configuracionId, configuracionData, {new: true})
    }

    deleteConfiguracionById = async(configuracionId) => {
        return await ConfiguracionModelo.findByIdAndDelete(configuracionId);
    }

}

export default ConfiguracionMongo;