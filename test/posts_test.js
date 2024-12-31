import { UserModel } from "../build/models/user_model.js";
import { expect } from "chai";
import request from "supertest";
import app from "../build/index.js";
import { PostModel } from "../build/models/post_model.js";

describe("post test", () => {
  let userToken;
  let userToken2;
  let postId;

  before(async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ name: "testUser", password: "testUser", email: "test@gmail.com" });

    userToken = res.body.token;

    const res2 = await request(app)
      .post("/auth/register")
      .send({ name: "testUser2", password: "testUser", email: "test2@gmail.com" });

    userToken2 = res2.body.token;
  });

  it("send an error message when creating a new post if the user is not token", async () => {
    const res = await request(app)
      .post("/post/create")
      .send({ name: "test post", body: "zxc123zxc" });

    expect(res.status).to.equal(401);
    expect(res.body).to.have.property("message", "Unauthorized");
  });

  it("create new post", async () => {
    const res = await request(app)
      .post("/post/create")
      .send({ name: "testPost", body: "zxc123zxc" })
      .set("Cookie", `token=${userToken}`);

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("message", "Post was successfully created");

    const post = await PostModel.findOne({
      name: "testPost",
    });

    postId = post._id;
  });

  it("get post by id", async () => {
    const res = await request(app).get(`/post/${postId}`);

    expect(res.status).to.equal(200);

    expect(res.body.post).to.have.property("name");
    expect(res.body.post).to.have.property("body");

    expect(res.body).to.have.property("author");
  });

  it("search posts by name element", async () => {
    const res = await request(app).get(`/post/search/test`);

    expect(res.status).to.equal(200);

    expect(res.body).to.have.property("posts");
  });

  it("send an error message when update a post if the user is not the author", async () => {
    const res = await request(app)
      .put(`/post/update/${postId}`)
      .send({ newName: "text zxc 123" })
      .set("Cookie", `token=${userToken2}`);

    expect(res.status).to.equal(403);
    expect(res.body).to.have.property("message", "Only the creator edit this post");
  });

  it("update post", async () => {
    const res = await request(app)
      .put(`/post/update/${postId}`)
      .send({ newName: "text zxc 123" })
      .set("Cookie", `token=${userToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message", "Post was successfully updated");
  });

  it("send an error message when deleting a post if the user is not the author", async () => {
    const res = await request(app)
      .delete(`/post/delete/${postId}`)
      .set("Cookie", `token=${userToken2}`);

    expect(res.status).to.equal(403);
    expect(res.body).to.have.property("message", "Only the creator delete this post");
  });

  it("delete post", async () => {
    const res = await request(app)
      .delete(`/post/delete/${postId}`)
      .set("Cookie", `token=${userToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message", "The post was successfully deleted");
  });

  after(async () => {
    await UserModel.deleteMany({
      name: "testUser",
    });

    await UserModel.deleteMany({
      name: "testUser2",
    });
  });
});
