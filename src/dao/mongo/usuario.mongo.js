import Connect from "./connect.js";
import UsuarioModelo from "./models/usuario.model.js";

class UsuarioMongo{
    constructor(){
        Connect.getInstance();
    }

    createUsuario = async(usuarioData) => {
        return await UsuarioModelo.create(usuarioData);
    }

    getUsuarioById = async(usuarioId) => {
        return await UsuarioModelo.findById(usuarioId);
    }

    getUsuarioByEmail = async(email) => {
        return await UsuarioModelo.findOne({email})
    }

    updateUsuarioById = async(usuarioId, usuarioData) => {
        return await UsuarioModelo.findByIdAndUpdate(usuarioId, usuarioData,{
            new: true,
            runValidators: true
        });
    }

    deleteUsuarioById = async(usuarioId) => {
        return await UsuarioModelo.findByIdAndDelete(usuarioId);
    }
}

export default UsuarioMongo;