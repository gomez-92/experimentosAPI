class UsuarioDao{
    constructor(usuario){
        this.usuario = usuario;
    }

    createUsuario = async(usuarioData) => {
        return await this.usuario.createUsuario(usuarioData);
    }

    getUsuarioById = async(usuarioId) => {
        return await this.usuario.getUsuarioById(usuarioId);
    }

    getUsuarioByEmail = async(email) => {
        return await this.usuario.getUsuarioByEmail(email);
    }

    updateUsuarioById = async(usuarioId, usuarioData) => {
        return await this.usuario.updateUsuarioById(usuarioId, usuarioData);
    }

    deleteUsuarioById = async(usuarioId) => {
        return await this.usuario.deleteUsuarioById(usuarioId);
    }
}

export default UsuarioDao;