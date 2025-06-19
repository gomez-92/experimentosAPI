import request from "supertest";
import assert from "assert";
import usuariosMoke from "./usuarios.moke.js";
import app from "../../src/app.js";

describe("PUT /api/usuarios/:usuarioId", () => {

  let monitorCreado, creator, admin, monitor, sistema;

  before(async () => {
    const res1 = await request(app)
    .post("/api/autenticacion")
    .send({ email: usuariosMoke.creator.email, contraseña: usuariosMoke.creator.contraseña });
    creator = {...res1.body.payload.usuario, token: res1.body.payload.token};
    
    const res2 = await request(app)
    .post("/api/autenticacion")
    .send({ email: usuariosMoke.admin.email, contraseña: usuariosMoke.admin.contraseña });
    admin = {...res2.body.payload.usuario, token: res2.body.payload.token};
    
    const res3 = await request(app)
    .post("/api/autenticacion")
    .send({ email: usuariosMoke.monitor.email, contraseña: usuariosMoke.monitor.contraseña });
    monitor = {...res3.body.payload.usuario, token: res3.body.payload.token};
    
    const res4 = await request(app)
    .post("/api/autenticacion")
    .send({ email: usuariosMoke.sistema.email, contraseña: usuariosMoke.sistema.contraseña });
    sistema = {...res4.body.payload.usuario, token: res4.body.payload.token};

    // Crear un usuario de pruebas
    const res = await request(app)
      .post("/api/usuarios/create")
      .set("Authorization",`Bearer ${admin.token}`)
      .send(usuariosMoke.nuevoMonitor);

    monitorCreado = res.body.payload;

  });

  after(async () => {
    // Eliminar el usuario de pruebas si quedó
    if(monitorCreado){
      const res = await request(app)
        .delete(`/api/usuarios/${monitorCreado._id}`)
        .set("Authorization", `Bearer ${admin.token}`);
    }
  });

  it("debería actualizar nombre y estado activo correctamente", async () => {
    const nuevosDatos = {
      nombre: "Nombre Actualizado",
      activo: false,
    };

    const res = await request(app)
      .put(`/api/usuarios/${monitorCreado._id}`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send(nuevosDatos);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, "success");
    assert.strictEqual(res.body.payload.nombre, nuevosDatos.nombre);
    assert.strictEqual(res.body.payload.activo, nuevosDatos.activo);
  });

  it("debería devolver 400 si el ID no es válido", async () => {
    const res = await request(app)
      .put(`/api/usuarios/${usuariosMoke.noValido.idNoValido}`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({ nombre: "Nuevo Nombre" });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.status, "error");
  });

  it("debería devolver 404 si el usuario no existe", async () => {
    const res = await request(app)
      .put(`/api/usuarios/${usuariosMoke.noValido.idNoExiste}`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({ nombre: "Nuevo Nombre" });
    
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.status, "error");
  });

  it("debería devolver 400 si se envía un email con formato inválido", async () => {
    const res = await request(app)
      .put(`/api/usuarios/${monitorCreado._id}`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({ email: usuariosMoke.noValido.emailNoValido });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.status, "error");
  });

  it("debería devolver 400 si el email ya está registrado por otro usuario", async () => {
    // Crear otro usuario con un email diferente
    const res = await request(app)
      .put(`/api/usuarios/${usuariosMoke.sistema.id}`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({ email: monitor.email });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.status, "error");
  });

  it("debería devolver 403 si el usuario no tiene permisos para modificar otro usuario", async () => {
    const res = await request(app)
      .put(`/api/usuarios/${sistema._id}`)
      .set("Authorization", `Bearer ${monitor.token}`)
      .send({ nombre: "Intento no autorizado" });
      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.status, "error");
    });
    
    
    it("debería devolver 403 si el usuario intenta modificar un usuario de rango superior", async () => {
      
      const res = await request(app)
      .put(`/api/usuarios/${creator._id}`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({ nombre: "Intento no autorizado" });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.status, "error");
  });
});