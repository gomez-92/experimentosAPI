import request from "supertest";
import assert from "assert";
import usuariosMoke from "../usuarios/usuarios.moke.js";
import app from "../../src/app.js";

describe("GET /api/configuraciones/:configuracionId", () => {

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

        const res5 = await request(app)
        .post(`/api/registros/${registro._id}/configuracion`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ valorMin: 10, valorMax: 100 });
        configuracion = res5.body.payload;

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

    it("debería devolver 400 si configuracionId es inválido", async() => {
        const res = await request(app)
        .get(`/api/configuraciones/1234`)
        .set("Authorization", `Bearer ${admin.token}`);
        assert.strictEqual(res.status, 400);
        assert.ok(res.body.error);
    });

    it("debería devolver 401 si no está autenticado", async() => {
        const res = await request(app)
        .get(`/api/configuraciones/${configuracion._id}`);
        assert.strictEqual(res.status, 401);
        assert.ok(res.body.error);
    });

    it("debería devolver 404 si la configuración no existe", async() => {
        const res = await request(app)
        .get(`/api/configuraciones/999999999999999999999999`)
        .set("Authorization", `Bearer ${admin.token}`);
        assert.strictEqual(res.status, 404);
        assert.ok(res.body.error);
    });

    it("debería devolver 200 y los datos de la configuración eliminada", async() => {
        const res = await request(app)
        .get(`/api/configuraciones/${configuracion._id}`)
        .set("Authorization", `Bearer ${admin.token}`);
        assert.strictEqual(res.status, 200);
        assert.ok(res.body.payload);
    });

});