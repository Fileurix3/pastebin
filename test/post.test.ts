import { UserModel } from "../src/models/user_model";
import request from "supertest";
import app from "../src/index";
import { PostModel } from "../src/models/post_model";
import minioClient from "../src/databases/minio";

describe("post test", () => {
  let userToken: string;
  let userToken2: string;
  let postId: string;
  let postMinioName: string;

  beforeAll(async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ name: "testUser", password: "testUser", email: "test@gmail.com" });

    const cookies = res.headers["set-cookie"];

    for (let i = 0; i < cookies.length; i++) {
      if (cookies[0].startsWith("token=")) {
        userToken = cookies[i].split(/\;/)[0].split(/\=/)[1];
        break;
      }
    }

    const res2 = await request(app)
      .post("/auth/register")
      .send({ name: "testUser2", password: "testUser", email: "test2@gmail.com" });

    const cookies2 = res2.headers["set-cookie"];

    for (let i = 0; i < cookies2.length; i++) {
      if (cookies2[0].startsWith("token=")) {
        userToken2 = cookies2[i].split(/\;/)[0].split(/\=/)[1];
        break;
      }
    }
  });

  it("POST /post/create - if the user is not registered", async () => {
    const res = await request(app)
      .post("/post/create")
      .send({ title: "test post", content: "zxc123zxc" })
      .expect(401);

    expect(res.body.message).toEqual("Unauthorized");
  });

  it("POST /post/create - no title field", async () => {
    const res = await request(app)
      .post("/post/create")
      .send({ content: "zxc123zxc" })
      .set("Cookie", `token=${userToken}`)
      .expect(400);

    expect(res.body.message).toEqual("Title is required");
  });

  it("POST /post/create - no content field", async () => {
    const res = await request(app)
      .post("/post/create")
      .send({ title: "test post" })
      .set("Cookie", `token=${userToken}`)
      .expect(400);

    expect(res.body.message).toEqual("Content is required");
  });

  it("PORT /post/create - create new post", async () => {
    const res = await request(app)
      .post("/post/create")
      .send({ title: "testPost", content: "zxc123zxc" })
      .set("Cookie", `token=${userToken}`)
      .expect(201);

    expect(res.body.message).toEqual("Post was successfully created");

    postId = res.body.post.id;
    postMinioName = res.body.post.content.split(/\//).pop();
  });

  it(`GET /post/${postId!} - get post by id`, async () => {
    const res = await request(app).get(`/post/${postId}`).expect(200);

    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("title");
    expect(res.body).toHaveProperty("content");
    expect(res.body).toHaveProperty("countLikes");

    expect(res.body).toHaveProperty("creator");
    expect(res.body.creator).toHaveProperty("id");
    expect(res.body.creator).toHaveProperty("name");
    expect(res.body.creator).toHaveProperty("avatar_url");
  });

  it("GET /post/search/test - search posts by title element", async () => {
    const res = await request(app).get(`/post/search/test`).expect(200);

    expect(res.body).toHaveProperty("posts");
  });

  it(`PUT /post/update/${postId!} - send an error message when update a post if the user is not the author`, async () => {
    const res = await request(app)
      .put(`/post/update/${postId}`)
      .send({ newTitle: "text zxc 123" })
      .set("Cookie", `token=${userToken2}`)
      .expect(403);

    expect(res.body.message).toEqual("Only the creator can edit this post");
  });

  it(`PUT /post/update/${postId!} - update post`, async () => {
    const res = await request(app)
      .put(`/post/update/${postId}`)
      .send({ newTitle: "text zxc 123" })
      .set("Cookie", `token=${userToken}`)
      .expect(200);

    expect(res.body.message).toEqual("Post was successfully updated");
  });

  it(`DELETE /post/delete/${postId!} - send an error message when deleting a post if the user is not the author`, async () => {
    const res = await request(app)
      .delete(`/post/delete/${postId}`)
      .set("Cookie", `token=${userToken2}`)
      .expect(403);

    expect(res.body.message).toEqual("Only the creator delete this post");
  });

  it("delete post", async () => {
    const res = await request(app)
      .delete(`/post/delete/${postId}`)
      .set("Cookie", `token=${userToken}`)
      .expect(200);

    expect(res.body.message).toEqual("The post was successfully deleted");
  });

  afterAll(async () => {
    await PostModel.destroy({
      where: {
        title: "testPost",
      },
    });

    if (postMinioName) {
      await minioClient.removeObject("posts", postMinioName);
    }

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
