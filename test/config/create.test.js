import request from "supertest";
import assert from "assert";
import usuariosMoke from "../usuarios/usuarios.moke.js";
import app from "../../src/app.js";

describe("POST /api/registros/:registroId/configuracion", () => {

    let experimento, registro, configuracion, admin, sistema;

    before(async() => {

        const res1 = await request(app)
        .post("/api/autenticacion")
        .send({ email: usuariosMoke.sistema.email, contraseña: usuariosMoke.sistema.contraseña });
        sistema = {...res1.body.payload.usuario, token: res1.body.payload.token};

        const res2 = await request(app)
        .post("/api/autenticacion")
        .send({ email: usuariosMoke.admin.email, contraseña: usuariosMoke.admin.contraseña });
        admin = {...res2.body.payload.usuario, token: res2.body.payload.token};

        const res3 = await request(app)
        .post(`/api/experimentos/create`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ nombre: "Moke create reg", duracion: 10000 });
        experimento = res3.body.payload;

        const res4 = await request(app)
        .post(`/api/experimentos/${experimento._id}/registros`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ nombre: "Moke", tipo: "temperatura", unidad: "ºC" });
        registro = res4.body.payload;

    });

    after(async() => {

        if(configuracion){
            const res = await request(app)
            .delete(`/api/configuraciones/${configuracion._id}`)
            .set("Authorization", `Bearer ${admin.token}`);
        }

        if(registro){
            const res = await request(app)
            .delete(`/api/registros/${registro._id}`)
            .set("Authorization", `Bearer ${admin.token}`);
        }

        if(experimento){
            const res = await request(app)
            .delete(`/api/experimentos/${experimento._id}`)
            .set("Authorization", `Bearer ${admin.token}`);
        }

    });

    it("debería devolver 200 y los datos de la configuración", async() => {
        const res = await request(app)
        .post(`/api/registros/${registro._id}/configuracion`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ valorMin: 10, valorMax: 100 });
        configuracion = res.body.payload;
        assert.strictEqual(res.status, 200);
        assert.ok(res.body.payload);
    });

    it("debería devolver 400 si registroId no es válido", async() => {
        const res = await request(app)
        .post(`/api/registros/1234/configuracion`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ valorMin: 10, valorMax: 100 });
        assert.strictEqual(res.status, 400);
        assert.ok(res.body.error);
    });

    it("debería devolver 400 si faltan parámetros", async() => {
        const res = await request(app)
        .post(`/api/registros/${registro._id}/configuracion`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ valorMin: 10 });
        assert.strictEqual(res.status, 400);
        assert.ok(res.body.error);
    });

    it("debería devolver 401 si no está autenticado", async() => {
        const res = await request(app)
        .post(`/api/registros/${registro._id}/configuracion`)
        .send({ valorMin: 10, valorMax: 100 });
        assert.strictEqual(res.status, 401);
        assert.ok(res.body.error);
    });

    it("debería devolver 403 si no está autorizado", async() => {
        const res = await request(app)
        .post(`/api/registros/${registro._id}/configuracion`)
        .set("Authorization", `Bearer ${admin.token}`)
        .send({ valorMin: 10, valorMax: 100 });
        assert.strictEqual(res.status, 403);
        assert.ok(res.body.error);
    });

    it("debería devolver 404 si el registro no existe", async() => {
        const res = await request(app)
        .post(`/api/registros/999999999999999999999999/configuracion`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ valorMin: 10, valorMax: 100 });
        assert.strictEqual(res.status, 404);
        assert.ok(res.body.error);
    });


    it("debería devolver 200 y el registro con la referencia a la configuración creada", async() => {
    const res = await request(app)
        .get(`/api/registros/${registro._id}`)
        .set("Authorization", `Bearer ${admin.token}`);
        assert.strictEqual(res.status, 200);
        assert.ok(res.body.payload);
        assert.ok(res.body.payload.configuracion);
        assert.strictEqual(res.body.payload.configuracion._id, configuracion._id);
    });

});