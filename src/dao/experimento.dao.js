class ExperimentoDao{

    constructor(experimento){
        this.experimento = experimento;
    }

    createExperimento = async (nombre, duracion) => {
        return await this.experimento.createExperimento(nombre, duracion);
    };

    getExperimentos = async() => {
        return await this.experimento.getExperimentos();
    }

    getExperimentoById = async (experimentoId) => {
        return await this.experimento.getExperimentoById(experimentoId);
    };

    updateExperimentoById = async (experimentoId, experimentoData) => {
        return await this.experimento.updateExperimentoById(experimentoId, experimentoData);
    };

    deleteExperimentoById = async (experimentoId) => {
        return await this.experimento.deleteExperimentoById(experimentoId);
    }
}

export default ExperimentoDao;