import request from "supertest";
import assert from "assert";
import usuariosMoke from "../usuarios/usuarios.moke.js";
import app from "../../src/app.js";

describe("PUT /api/registros/:registroId", () => {

    let admin, sistema, monitor, experimento, registro;

    before(async() => {
        
        const res = await request(app)
        .post("/api/autenticacion")
        .send({ email: usuariosMoke.admin.email, contraseña: usuariosMoke.admin.contraseña });
        admin = {...res.body.payload.usuario, token: res.body.payload.token};
        
        const res1 = await request(app)
        .post("/api/autenticacion")
        .send({ email: usuariosMoke.sistema.email, contraseña: usuariosMoke.sistema.contraseña });
        sistema = {...res1.body.payload.usuario, token: res1.body.payload.token};

        const res2 = await request(app)
        .post("/api/autenticacion")
        .send({ email: usuariosMoke.monitor.email, contraseña: usuariosMoke.monitor.contraseña });
        monitor = {...res2.body.payload.usuario, token: res2.body.payload.token};

        const res3 = await request(app)
        .post(`/api/experimentos/create`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ nombre: "Moke update reg", duracion: 10000 });
        experimento = res3.body.payload;

        const res4 = await request(app)
        .post(`/api/experimentos/${experimento._id}/registros`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ nombre: "Moke", tipo: "temperatura", unidad: "ºC" });
        registro = res4.body.payload;

    });

    after(async() => {
        
        if(registro){
            const res1 = await request(app)
            .delete(`/api/registros/${registro._id}`)
            .set("Authorization", `Bearer ${admin.token}`);
        };

        if(experimento){
            const res2 = await request(app)
            .delete(`/api/experimentos/${experimento._id}`)
            .set("Authorization", `Bearer ${admin.token}`);
        };

    });

    it("debería devolver 400 si el registroId es inválido", async() => {
        const res = await request(app)
        .put(`/api/registros/1234`)
        .set("Authorization", `Bearer ${admin.token}`)
        .send({ nombre: "Moke actualizado"});
        assert.strictEqual(res.status, 400);
    });
    
    it("debería devolver 404 si el registro no existe", async() => {
        const res = await request(app)
        .put(`/api/registros/999999999999999999999999`)
        .set("Authorization", `Bearer ${admin.token}`)
        .send({ nombre: "Moke actualizado"});
        assert.strictEqual(res.status, 404);
    });

    it("debería devolver 401 si no está autenticado", async() => {
        const res = await request(app)
        .put(`/api/registros/${registro._id}`)
        .send({ nombre: "Moke actualizado"});
        assert.strictEqual(res.status, 401);
    });

    it("debería devolver 403 si no está autorizado", async() => {
        const res = await request(app)
        .put(`/api/registros/${registro._id}`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ nombre: "Moke actualizado"});
        assert.strictEqual(res.status, 403);
    });

    it("debería devolver 200 y los datos del registro actualizado", async() => {
        const res = await request(app)
        .put(`/api/registros/${registro._id}`)
        .set("Authorization", `Bearer ${admin.token}`)
        .send({ nombre: "Moke actualizado"});
        assert.strictEqual(res.status, 200);
        assert.ok(res.body.payload);
        assert.strictEqual(res.body.payload.nombre, "Moke actualizado");
    });

});