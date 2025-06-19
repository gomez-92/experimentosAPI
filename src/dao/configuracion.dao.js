class ConfiguracionDao{

    constructor(configuracion){
        this.configuracion = configuracion;
    }

    createConfiguracion = async(configuracionData) => {
        return await this.configuracion.createConfiguracion(configuracionData);
    }
    
    getConfiguracionById = async(configuracionId) => {
        return await this.configuracion.getConfiguracionById(configuracionId);
    }
    
    getConfiguracionByRegistroId = async(registroId) => {
        return await this.configuracion.getConfiguracionByRegistroId({registroId});
    }

    updateConfiguracionById = async(configuracionId, configuracionData) => {
        return await this.configuracion.updateConfiguracionById(configuracionId, configuracionData)
    }

    deleteConfiguracionById = async(configuracionId) => {
        return await this.configuracion.deleteConfiguracionById(configuracionId);
    }
    
}

export default ConfiguracionDao;