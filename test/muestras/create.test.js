import request from "supertest";
import assert from "assert";
import usuariosMoke from "../usuarios/usuarios.moke.js";
import app from "../../src/app.js";

describe("POST /api/registros/:registroId/muestras", () => {

    let experimento, registro, muestra, sistema, admin;

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
        .send({ nombre: "Moke", duracion: 10000 });
        experimento = res3.body.payload;

        const res4 = await request(app)
        .post(`/api/experimentos/${experimento._id}/registros`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ nombre: "Moke", tipo: "temperatura", unidad: "ºC" });
        registro = res4.body.payload;
        
    });

    after(async() => {
        
        if(registro){
            const res2 = await request(app)
            .delete(`/api/registros/${registro._id}`)
            .set("Authorization", `Bearer ${admin.token}`);
        }
        
        if(experimento){
            const res3 = await request(app)
            .delete(`/api/experimentos/${experimento._id}`)
            .set("Authorization", `Bearer ${admin.token}`);
        };

    });


    it("debería devolver 400 si el experimento no fue iniciado", async() => {
        const res = await request(app)
        .post(`/api/registros/${registro._id}/muestras`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ valor: 10.5 });        
        assert.strictEqual(res.status, 400);

        const res1 = await request(app)
        .post(`/api/experimentos/${experimento._id}/iniciar`)
        .set("Authorization", `Bearer ${sistema.token}`);
        experimento = res1.body.payload;
    });

    it("debería devolver 400 si registroId no es válido", async() => {
        const res = await request(app)
        .post(`/api/registros/1234/muestras`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ valor: 10.5 });
        assert.strictEqual(res.status, 400);
    });

    it("debería devolver 404 si el registro no existe", async() => {
        const res = await request(app)
        .post(`/api/registros/999999999999999999999999/muestras`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ valor: 10.5 });
        assert.strictEqual(res.status, 404);
    });

    it("debería devolver 401 si no está autenticado", async() => {
        const res = await request(app)
        .post(`/api/registros/${registro._id}/muestras`)
        .send({ valor: 10.5 });
        assert.strictEqual(res.status, 401);
    });

    it("debería devolver 403 si no está autorizado", async() => {
        const res = await request(app)
        .post(`/api/registros/${registro._id}/muestras`)
        .set("Authorization", `Bearer ${admin.token}`)
        .send({ valor: 10.5 });
        assert.strictEqual(res.status, 403);
    });

    it("debería devolver 200 y los datos de la muestra creada", async() => {
        const res = await request(app)
        .post(`/api/registros/${registro._id}/muestras`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ valor: 10.5 });
        assert.strictEqual(res.status, 200);
        assert.ok(res.body.payload);
    });

    it("debería devolver 400 si el experimento es finalizado", async() => {
        const res = await request(app)
        .post(`/api/experimentos/${experimento._id}/finalizar`)
        .set("Authorization", `Bearer ${sistema.token}`);
        experimento = res.body.payload;

        const res1 = await request(app)
        .post(`/api/registros/${registro._id}/muestras`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ valor: 10.5 });
        assert.strictEqual(res1.status, 400);
    });

});