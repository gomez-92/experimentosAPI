class RegistroDao {
    constructor(registro){
        this.registro = registro;
    }

    createRegistro = async(experimentoId, nombre, tipo, unidad) => {
        return await this.registro.createRegistro(experimentoId, nombre, tipo, unidad);
    }

    getRegistroById = async(registroId) => {
        return await this.registro.getRegistroById(registroId);
    }

    getRegistroDetalleById = async(registroId) => {
        return await this.registro.getRegistroDetalleById(registroId);
    };

    updateRegistroById = async(registroId, registroData) => {
        return await this.registro.updateRegistroById(registroId, registroData);
    }

    deleteRegistroById = async(registroId) => {
        return await this.registro.deleteRegistroById(registroId);
    }

}

export default RegistroDao;