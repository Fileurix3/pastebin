import { UserModel } from "../build/models/user_model.js";
import { expect } from "chai";
import request from "supertest";
import app from "../build/index.js";

describe("auth test", () => {
  let token;

  it("if password is less than 6 characters", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ name: "testUser", password: "12345", email: "test@gmail.com" });

    expect(res.status).to.equal(400);

    expect(res.body).to.have.property(
      "message",
      "Password must be at least 6 characters long",
    );
  });

  it("should create a new user", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ name: "testUser", password: "123456", email: "test@gmail.com" });

    expect(res.status).to.equal(201);

    expect(res.body).to.have.property("message", "User successfully registered");
    expect(res.body).to.have.property("token").that.is.a("string");
  });

  it("if user already exists", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ name: "testUser", password: "123456", email: "test@gmail.com" });

    expect(res.status).to.equal(400);

    expect(res.body).to.have.property(
      "message",
      "User with this name or email already exists",
    );
  });

  it("login user", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ name: "testUser", password: "123456", email: "test@gmail.com" });

    token = res.body.token;

    expect(res.status).to.equal(200);

    expect(res.body).to.have.property("token").that.is.a("string");
    expect(res.body).to.have.property("message", "Login successful");
  });

  it("if user has entered incorrect email", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ password: "123456", email: "test2@gmail.com" });

    expect(res.status).to.equal(400);

    expect(res.body).to.have.property("message", "Invalid email or password");
  });

  it("if user has entered incorrect password", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ password: "123457", email: "test@gmail.com" });

    expect(res.status).to.equal(400);

    expect(res.body).to.have.property("message", "Invalid email or password");
  });

  it("logout user", async () => {
    const res = await request(app).get("/auth/logout").set("Cookie", `token=${token}`);

    expect(res.status).to.equal(200);

    expect(res.body).to.have.property("message", "logout successfully");
  });

  after(async () => {
    await UserModel.destroy({
      where: {
        name: "testUser",
      },
    });
  });
});
