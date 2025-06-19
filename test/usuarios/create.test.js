import request from "supertest";
import assert from "assert";
import usuariosMoke from "./usuarios.moke.js";
import app from "../../src/app.js";

// ========== TESTS CREATE USUARIO ==========

describe("POST /api/usuarios/create", () => {
  
  let nuevoSistema, creator, monitor;

  before(async () => {
    const res2 = await request(app)
    .post("/api/autenticacion")
    .send({ email: usuariosMoke.creator.email, contraseña: usuariosMoke.creator.contraseña });
    creator = {...res2.body.payload.usuario, token: res2.body.payload.token};

    const res1 = await request(app)
    .post("/api/autenticacion")
    .send({ email: usuariosMoke.monitor.email, contraseña: usuariosMoke.monitor.contraseña });
    monitor = {...res1.body.payload.usuario, token: res1.body.payload.token};

    const res = await request(app)
      .get(`/api/usuarios/findByEmail?email=${usuariosMoke.nuevoSistema.email}`)
      .set("Authorization", `Bearer ${creator.token}`)
  
    if (res.status === 200 && res.body?.payload?._id) {
      const deleteRes = await request(app)
        .delete(`/api/usuarios/${res.body.payload._id}`)
        .set("Authorization", `Bearer ${creator.token}`)
    }

  });
  
  after(async () => {
    if(nuevoSistema){
      const res = await request(app)
      .delete(`/api/usuarios/${nuevoSistema._id}`)
      .set("Authorization", `Bearer ${creator.token}`)
    }
  });
  
  it("debería crear un usuario correctamente si los datos son válidos y el rol está autorizado", async () => {
    const { email, nombre, contraseña, rol } = usuariosMoke.nuevoSistema;
    const res = await request(app)
      .post("/api/usuarios/create")
      .set("Authorization", `Bearer ${creator.token}`)
      .send({ email, nombre, contraseña, rol });
    nuevoSistema = res.body.payload;
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, "success");
    assert.ok(res.body.payload);
    assert.strictEqual(res.body.payload.email, email);
    assert.strictEqual(res.body.payload.nombre, nombre);
    assert.strictEqual(res.body.payload.rol, rol);
    assert.ok(res.body.payload._id);
  });

  it("debería devolver 400 si falta algún campo requerido", async () => {
    const res = await request(app)
      .post("/api/usuarios/create")
      .set("Authorization", `Bearer ${creator.token}`)
      .send({ email: usuariosMoke.nuevoMonitor.email });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.status, "error");
    assert.ok(res.body.error.includes("nombre"));
    assert.ok(res.body.error.includes("contraseña"));
    assert.ok(res.body.error.includes("rol"));
  });

  it("debería devolver 400 si el email tiene formato inválido", async () => {
    const { nombre, contraseña, rol } = usuariosMoke.nuevoSistema;
    const res = await request(app)
      .post("/api/usuarios/create")
      .set("Authorization", `Bearer ${creator.token}`)
      .send({ nombre, contraseña, rol, email: usuariosMoke.noValido.emailNoValido });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.status, "error");
  });

  it("debería devolver 400 si el email ya está registrado", async () => {
    const { nombre, email, contraseña, rol } = usuariosMoke.admin;
    const res = await request(app)
      .post("/api/usuarios/create")
      .set("Authorization", `Bearer ${creator.token}`)
      .send({ nombre, email, contraseña, rol }); // crea primero
    
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.status, "error");
  });

  it("debería devolver 403 si el usuario sin permiso intenta crear un usuario", async () => {
    const { nombre, contraseña, rol, email } = usuariosMoke.nuevoAdmin;
    
    const res = await request(app)
      .post("/api/usuarios/create")
      .set("Authorization", `Bearer ${monitor.token}`)
      .send({ nombre, contraseña, rol, email });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.status, "error");
  });

});