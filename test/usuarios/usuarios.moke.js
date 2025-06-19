const usuarios = {
    creator:{        
        email: "creator@correo.com",
        contraseña: "1234",
    },
    admin:{
        email: "admin@correo.com",
        contraseña: "1234",
    },
    sistema:{
        email: "sistema@correo.com",
        contraseña: "1234",
    },
    monitor:{
        email: "monitor@correo.com",
        contraseña: "1234",
    },
    nuevoAdmin:{
        nombre: "Nuevo Admin",
        email: "nuevo@admin.com",
        contraseña: "1234",
        rol: "ADMIN"
    },
    nuevoSistema:{
        nombre: "Nuevo Sistema",
        email: "nuevo@sistema.com",
        contraseña: "1234",
        rol: "SISTEMA"
    },
    nuevoMonitor:{
        nombre: "Nuevo Monitor",
        email: "nuevo@monitor.com",
        contraseña: "1234",
        rol: "MONITOR"
    },
    noValido:{
        idNoValido: "1234",
        idNoExiste: "abcd1234abcd1234abcd1234",
        emailNoValido: "email-no-valido",
        emailNoExiste: "no@existe.com",
        contraseña: "1234",
        tokenNoValido: "Bearer token-no-valido"
    }
};

export default usuarios;