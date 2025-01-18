import { UserModel } from "../build/models/user_model.js";
import { PostModel } from "../build/models/post_model.js";
import { expect } from "chai";
import app, { decodeJwt } from "../build/index.js";
import request from "supertest";

import minioClient from "../build/databases/minio.js";

describe("user test", () => {
  let userToken;
  let userId;
  let postId;
  let postMinioName;

  before(async () => {
    const resAuth = await request(app)
      .post("/auth/register")
      .send({ name: "testUser", password: "testUser", email: "test@gmail.com" });

    userToken = resAuth.body.token;
    userId = decodeJwt(userToken).userId;

    const resPost = await request(app)
      .post("/post/create")
      .send({ title: "testPost", content: "testPost" })
      .set("Cookie", `token=${userToken}`);

    postId = resPost.body.post.id;
    postMinioName = resPost.body.post.content.split(/\//).pop();
  });

  it("get user profile by id", async () => {
    const res = await request(app).get(`/user/profile/${userId}`);

    expect(res.status).to.equal(200);

    expect(res.body.user).to.have.property("id");
    expect(res.body.user).to.have.property("name");
    expect(res.body.user).to.have.property("createdAt");
    expect(res.body.user)
      .to.have.property("avatar_url")
      .that.satisfies((avatar) => avatar == null || typeof avatar == "string");

    expect(res.body.user).to.have.property("posts");
    expect(res.body.user).to.have.property("likedPosts");
  });

  it("throw error message when receiving a profile by jwt token without token", async () => {
    const res = await request(app).get("/user/profile");

    expect(res.status).to.equal(401);
    expect(res.body).to.have.property("message", "Unauthorized");
  });

  it("get your profile by jwt token", async () => {
    const res = await request(app)
      .get("/user/profile")
      .set("Cookie", `token=${userToken}`);

    expect(res.status).to.equal(200);

    expect(res.body.user).to.have.property("id");
    expect(res.body.user).to.have.property("name");
    expect(res.body.user).to.have.property("createdAt");
    expect(res.body.user)
      .to.have.property("avatar_url")
      .that.satisfies((avatar) => avatar == null || typeof avatar == "string");

    expect(res.body.user).to.have.property("posts");
    expect(res.body.user).to.have.property("likedPosts");
  });

  it("update name if this name already exists", async () => {
    await UserModel.create({
      name: "testUser2",
      email: "test2@gmail.com",
      password: "testUser2",
    });

    const res = await request(app)
      .put("/user/update/profile")
      .set("Cookie", `token=${userToken}`)
      .send({ newName: "testUser2" });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message", "This name already exists");

    await UserModel.destroy({
      where: {
        name: "testUser2",
      },
    });
  });

  it("update name", async () => {
    const res = await request(app)
      .put("/user/update/profile")
      .set("Cookie", `token=${userToken}`)
      .send({ newName: "testUser2" });

    expect(res.status).to.equal(200);

    expect(res.body).to.have.property("message", "User profile was successfully update");
  });

  it("change password if old password is incorrect", async () => {
    const res = await request(app)
      .put("/user/change/password")
      .set("Cookie", `token=${userToken}`)
      .send({ oldPassword: "wrongPassword", newPassword: "testUser" });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message", "The old password is incorrect");
  });

  it("change password if new password == old password", async () => {
    const res = await request(app)
      .put("/user/change/password")
      .set("Cookie", `token=${userToken}`)
      .send({ oldPassword: "testUser", newPassword: "testUser" });

    expect(res.status).to.equal(400);

    expect(res.body).to.have.property(
      "message",
      "New password must be different from old password",
    );
  });

  it("change password", async () => {
    const res = await request(app)
      .put("/user/change/password")
      .set("Cookie", `token=${userToken}`)
      .send({ oldPassword: "testUser", newPassword: "newPassword" });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message", "Password was successfully update");
  });

  it("user like post", async () => {
    const res = await request(app)
      .put(`/user/like/post/${postId}`)
      .set("Cookie", `token=${userToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property(
      "message",
      "The post was successfully added to likes",
    );
  });

  it("user removed like post", async () => {
    const res = await request(app)
      .put(`/user/like/post/${postId}`)
      .set("Cookie", `token=${userToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property(
      "message",
      "The post was successfully removed from likes",
    );
  });

  after(async () => {
    await PostModel.destroy({
      where: {
        creator_id: userId,
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

    await request(app)
      .delete(`/post/delete/${postId}`)
      .set("Cookie", `token=${userToken}`);
  });
});
