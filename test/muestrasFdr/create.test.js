import request from "supertest";
import assert from "assert";
import usuariosMoke from "../usuarios/usuarios.moke.js";
import app from "../../src/app.js";

describe("POST /api/experimentos/:experimentoId/muestraFDR", () => {

    let experimento, registro, muestra, muestraFDR, sistema, admin;

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
        
        const res5 = await request(app)
        .post(`/api/experimentos/${experimento._id}/iniciar`)
        .set("Authorization", `Bearer ${sistema.token}`);
        experimento = res5.body.payload;

        const res6 = await request(app)
        .post(`/api/registros/${registro._id}/muestras`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ valor: 20.5});
        muestra = res6.body.payload;
    });

    after(async() => {

        if(muestraFDR){
            const res0 = await request(app)
            .delete(`/api/muestrasFDR/${muestraFDR._id}`)
            .set("Authorization", `Bearer ${admin.token}`);
        }

        if(muestra){
            const res1 = await request(app)
            .delete(`/api/muestras/${muestra._id}`)
            .set("Authorization", `Bearer ${admin.token}`);
        }
        
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

    it("debería devolver 400 si el experimentoId es inválido", async() => {
        const res = await request(app)
        .post(`/api/experimentos/1234/muestrasFDR`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ registroId: registro._id, muestraId: muestra._id });
        assert.strictEqual(res.status, 400);
    });

    it("debería devolver 404 si el experimento no existe", async() => {
        const res = await request(app)
        .post(`/api/experimentos/999999999999999999999999/muestrasFDR`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ registroId: registro._id, muestraId: muestra._id });
        assert.strictEqual(res.status, 404);
    });

    it("debería devolver 400 si faltan parámetros", async() => {
        const res = await request(app)
        .post(`/api/experimentos/${experimento._id}/muestrasFDR`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ muestraId: muestra._id });
        assert.strictEqual(res.status, 400);
    });

    it("debería devolver 404 si el registro no existe", async() => {
        const res = await request(app)
        .post(`/api/experimentos/${experimento._id}/muestrasFDR`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ registroId: "999999999999999999999999", muestraId: muestra._id });
        assert.strictEqual(res.status, 404);
    });

    it("debería devolver 404 si la muestra no existe", async() => {
        const res = await request(app)
        .post(`/api/experimentos/${experimento._id}/muestrasFDR`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ registroId: registro._id, muestraId: "999999999999999999999999" });
        assert.strictEqual(res.status, 404);
    });

    it("debería devolver 400 si algun parámetro es inválido", async() => {
        const res = await request(app)
        .post(`/api/experimentos/${experimento._id}/muestrasFDR`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ registroId: registro._id, muestraId: "1234" });
        assert.strictEqual(res.status, 400);
    });

    it("debería devolver 401 si no está autenticado", async() => {
        const res = await request(app)
        .post(`/api/experimentos/${experimento._id}/muestrasFDR`)
        .send({ registroId: registro._id, muestraId: muestra._id });
        assert.strictEqual(res.status, 401);
    });

    it("debería devolver 403 si no está autorizado", async() => {
        const res = await request(app)
        .post(`/api/experimentos/${experimento._id}/muestrasFDR`)
        .set("Authorization", `Bearer ${admin.token}`)
        .send({ registroId: registro._id, muestraId: muestra._id });
        assert.strictEqual(res.status, 403);
    });

    it("debería devolver 200 y los datos de la muestraFDR", async() => {
        const res = await request(app)
        .post(`/api/experimentos/${experimento._id}/muestrasFDR`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ registroId: registro._id, muestraId: muestra._id });
        assert.strictEqual(res.status, 200);
        muestraFDR = res.body.payload;
    });

    it("debería devolver 400 si el experimento no está en curso", async() => {
        const res1 = await request(app)
        .post(`/api/experimentos/${experimento._id}/finalizar`)
        .set("Authorization", `Bearer ${sistema.token}`);
        experimento = res1.body.payload;

        const res2 = await request(app)
        .post(`/api/experimentos/${experimento._id}/muestrasFDR`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ registroId: registro._id, muestraId: muestra._id });
        assert.strictEqual(res2.status, 400);
    });





});