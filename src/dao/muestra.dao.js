
class MuestraDao{
    constructor(muestra){
        this.muestra = muestra;
    }

    createMuestra = async(registroId, valor) => {
        return await this.muestra.createMuestra(registroId, valor);
    }

    getMuestraById = async(muestraId) => {
        return await this.muestra.getMuestraById(muestraId);
    }

    updateMuestraById = async(muestraId, muestraData) => {
        return await this.muestra.updateMuestraById(muestraId, muestraData);
    }
    
    deleteMuestraById = async(muestraId) => {
        return await this.muestra.deleteMuestraById(muestraId);
    }

}

export default MuestraDao;