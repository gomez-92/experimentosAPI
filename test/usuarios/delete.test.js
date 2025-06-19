import request from "supertest";
import assert from "assert";
import usuariosMoke from "./usuarios.moke.js";
import app from "../../src/app.js";


describe("DELETE /api/usuarios/:usuarioId", ()=>{

    let usuarioDePruebas, creator, monitor;

    before(async() => {
        const res2 = await request(app)
        .post("/api/autenticacion")
        .send({ email: usuariosMoke.creator.email, contraseña: usuariosMoke.creator.contraseña });
        creator = {...res2.body.payload.usuario, token: res2.body.payload.token};

        const res1 = await request(app)
        .post("/api/autenticacion")
        .send({ email: usuariosMoke.monitor.email, contraseña: usuariosMoke.monitor.contraseña });
        monitor = {...res1.body.payload.usuario, token: res1.body.payload.token};

        const { email, nombre, rol, contraseña } = usuariosMoke.nuevoMonitor;
        // Crear un usuario de pruebas
        const res = await request(app)
        .post("/api/usuarios/create")
        .set("Authorization", `Bearer ${creator.token}`)
        .send({ nombre, email, contraseña, rol });
        usuarioDePruebas = res.body.payload;
    });
    
    it('debería devolver 400 si falta usuarioId', async () => {
        const res = await request(app)
        .delete('/api/usuarios/')
        .set("Authorization", `Bearer ${creator.token}`)
        assert.strictEqual(res.status, 404);
    });

    it('debería devolver 400 si el usuarioId no es válido', async () => {
        const res = await request(app)
        .delete(`/api/usuarios/${usuariosMoke.noValido.idNoValido}`)
        .set("Authorization", `Bearer ${creator.token}`)
        assert.strictEqual(res.status, 400);
    });

    it('debería devolver 404 si el usuario no existe', async () => {
        const res = await request(app)
        .delete(`/api/usuarios/${usuariosMoke.noValido.idNoExiste}`)
        .set("Authorization", `Bearer ${creator.token}`)
        assert.strictEqual(res.status, 404);
    });

    it('debería devolver 401 si el usuario no tiene permisos para eliminar', async () => {
        const res = await request(app)
        .delete(`/api/usuarios/${usuariosMoke.admin.id}`)
        .set("Authorization", `Bearer ${monitor.token}`)
        assert.strictEqual(res.status, 403);
    });

    it('debería eliminar el usuario y devolver 200', async () => {
        const res = await request(app)
        .delete(`/api/usuarios/${usuarioDePruebas._id}`)
        .set("Authorization", `Bearer ${creator.token}`)

        assert.strictEqual(res.status, 200);
    });

});