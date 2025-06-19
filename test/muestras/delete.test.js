import request from "supertest";
import assert from "assert";
import usuariosMoke from "../usuarios/usuarios.moke.js";
import app from "../../src/app.js";

describe("DELETE /api/muestras/:muestraId", () => {
    
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

    it("debería devolver 400 si muestraId no es válido", async() => {
        const res = await request(app)
        .delete(`/api/muestras/1234`)
        .set("Authorization", `Bearer ${admin.token}`);
        assert.strictEqual(res.status, 400);
    });

    it("debería devolver 404 si la muestra no existe", async() => {
        const res = await request(app)
        .delete(`/api/muestras/999999999999999999999999`)
        .set("Authorization", `Bearer ${admin.token}`);
        assert.strictEqual(res.status, 404);
    });

    it("debería devolver 401 si no está autenticado", async() => {
        const res = await request(app)
        .delete(`/api/muestras/${muestra._id}`);
        assert.strictEqual(res.status, 401);
    });

    it("debería devolver 403 si no está autorizado", async() => {
        const res = await request(app)
        .delete(`/api/muestras/${muestra._id}`)
        .set("Authorization", `Bearer ${sistema.token}`);
        assert.strictEqual(res.status, 403);
    });

    it("debería devolver 200 y los datos de la muestra eliminada", async() => {
        const res = await request(app)
        .delete(`/api/muestras/${muestra._id}`)
        .set("Authorization", `Bearer ${admin.token}`);
        if(res.status == 200) muestra = null;
        assert.strictEqual(res.status, 200);
        assert.ok(res.body.payload);
    });
});