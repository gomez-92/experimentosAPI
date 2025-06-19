class MuestraFDRDao{
    constructor(muestraFDR){
        this.muestraFDR = muestraFDR;
    }

    getMuestraFDRById = async(muestraFDRId) => {
        return await this.muestraFDR.getMuestraFDRById(muestraFDRId);
    }

    createMuestraFDR = async(muestraFDRData) => {
        return await this.muestraFDR.createMuestraFDR(muestraFDRData);
    }

    updateMuestraFDRById = async(muestraFDRId, muestraFDRData) => {
        return await this.muestraFDR.updateMuestraFDRById(muestraFDRId, muestraFDRData);
    }

    deleteMuestraFDRById = async(muestraFDRId) => {
        return await this.muestraFDR.deleteMuestraFDRById(muestraFDRId);
    }
}

export default MuestraFDRDao;