import { UserModel } from "../build/models/user_model.js";
import { expect } from "chai";
import request from "supertest";
import app from "../build/index.js";
import { PostModel } from "../build/models/post_model.js";
import minioClient from "../build/databases/minio.js";

describe("post test", () => {
  let userToken;
  let userToken2;
  let postId;
  let postMinioName;

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
      .send({ title: "test post", content: "zxc123zxc" });

    expect(res.status).to.equal(401);
    expect(res.body).to.have.property("message", "Unauthorized");
  });

  it("create new post", async () => {
    const res = await request(app)
      .post("/post/create")
      .send({ title: "testPost", content: "zxc123zxc" })
      .set("Cookie", `token=${userToken}`);

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("message", "Post was successfully created");

    postId = res.body.post.id;
    postMinioName = res.body.post.content.split(/\//).pop();
  });

  it("get post by id", async () => {
    const res = await request(app).get(`/post/${postId}`);

    expect(res.status).to.equal(200);

    expect(res.body).to.have.property("id");
    expect(res.body).to.have.property("title");
    expect(res.body).to.have.property("content");
    expect(res.body).to.have.property("countLikes");

    expect(res.body).to.have.property("creator");
    expect(res.body.creator).to.have.property("id");
    expect(res.body.creator).to.have.property("name");
    expect(res.body.creator).to.have.property("avatar_url");
  });

  it("search posts by title element", async () => {
    const res = await request(app).get(`/post/search/test`);

    expect(res.status).to.equal(200);

    expect(res.body).to.have.property("posts");
  });

  it("send an error message when update a post if the user is not the author", async () => {
    const res = await request(app)
      .put(`/post/update/${postId}`)
      .send({ newTitle: "text zxc 123" })
      .set("Cookie", `token=${userToken2}`);

    expect(res.status).to.equal(403);
    expect(res.body).to.have.property("message", "Only the creator edit this post");
  });

  it("update post", async () => {
    const res = await request(app)
      .put(`/post/update/${postId}`)
      .send({ newTitle: "text zxc 123" })
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
    await PostModel.destroy({
      where: {
        title: "testPost",
      },
    });

    await minioClient.removeObject("posts", postMinioName);

    await UserModel.destroy({
      where: {
        name: "testUser",
      },
    });

    await UserModel.destroy({
      where: {
        name: "testUser2",
      },
    });
  });
});
