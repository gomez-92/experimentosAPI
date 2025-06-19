class ExperimentoEnCursoDao {
    constructor(experimentoEnCurso){
        this.experimentoEnCurso = experimentoEnCurso;
    }

    setExperimentoEnCurso = async(experimentoId) => {
        return await this.experimentoEnCurso.setExperimentoEnCurso(experimentoId);
    }

    getExperimentoEnCurso = async() => {
        return await this.experimentoEnCurso.getExperimentoEnCurso();
    }

    updateExperimentoEnCurso = async(experimentoData) => {
        return await this.updateExperimentoEnCurso(experimentoData);
    }

    deleteExperimentoEnCurso = async() => {
        return await this.deleteExperimentoEnCurso();
    }
}

export default ExperimentoEnCursoDao;