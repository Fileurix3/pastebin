import { UserModel } from "../src/models/user_model";
import request from "supertest";
import app from "../src/index";

describe("auth test", () => {
  it("POST /auth/register - no email field", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        name: "testUser",
        password: "testPassword",
      })
      .expect(400);

    expect(response.body.message).toEqual("Email is required");
  });

  it("POST /auth/register - no name field", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        email: "test@example.com",
        password: "testPassword",
      })
      .expect(400);

    expect(response.body.message).toEqual("Name is required");
  });

  it("POST /auth/register - no password field", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        name: "testUser",
        email: "test@example.com",
      })
      .expect(400);

    expect(response.body.message).toEqual("Password is required");
  });

  it("POST /auth/register - invalid email", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        name: "testUser",
        email: "invalidEmail",
        password: "testPassword",
      })
      .expect(400);

    expect(response.body.message).toEqual("Invalid email");
  });

  it("POST /auth/register - password is too small", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        name: "testUser",
        email: "test@example.com",
        password: "123",
      })
      .expect(400);

    expect(response.body.message).toEqual("Password must not be less than 6 characters");
  });

  it("POST /auth/register - name is too big", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        name: "a".repeat(21),
        email: "test@example.com",
        password: "testPassword",
      })
      .expect(400);

    expect(response.body.message).toEqual("Name length should not exceed 20 characters");
  });

  it("POST /auth/register - should create new user", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        name: "testUser",
        email: "test@example.com",
        password: "testPassword",
      })
      .expect(201);

    expect(response.body.message).toEqual("User has been successfully registered");
  });

  it("POST /auth/register - name already exists", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        name: "testUser",
        email: "test2@example.com",
        password: "testPassword",
      })
      .expect(400);

    expect(response.body.message).toEqual("User with this name or email already exists");
  });

  it("POST /auth/register - email already exists", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        name: "testUser2",
        email: "test@example.com",
        password: "testPassword",
      })
      .expect(400);

    expect(response.body.message).toEqual("User with this name or email already exists");
  });

  it("POST /auth/login - no email field", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        password: "testPassword",
      })
      .expect(400);

    expect(response.body.message).toEqual("Email is required");
  });

  it("POST /auth/login - no password field", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "test@example.com",
      })
      .expect(400);

    expect(response.body.message).toEqual("Password is required");
  });

  it("POST /auth/login - is wrong password", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "test@example.com",
        password: "wrongPassword",
      })
      .expect(400);

    expect(response.body.message).toEqual("Invalid email or password");
  });

  it("POST /auth/login - is wrong email", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "wrong@example.com",
        password: "testPassword",
      })
      .expect(400);

    expect(response.body.message).toEqual("Invalid email or password");
  });

  it("POST /auth/login - login user", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "test@example.com",
        password: "testPassword",
      })
      .expect(200);

    expect(response.body.message).toEqual("Login has been successfully");
  });

  afterAll(async () => {
    await UserModel.destroy({
      where: {
        name: "testUser",
      },
    });
  });
});
