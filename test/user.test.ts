import { S3Service } from "../src/services/s3/s3_service";
import { UserModel } from "../src/models/user_model";
import { PostModel } from "../src/models/post_model";
import { decodeJwt } from "../src/utils/utils";
import app from "../src/index";
import request from "supertest";

const s3Service: S3Service = new S3Service();

describe("user test", () => {
  let userToken: string;
  let userId: string;
  let postId: string;
  let postMinioName: string;

  beforeAll(async () => {
    const resAuth = await request(app)
      .post("/auth/register")
      .send({ name: "testUser", password: "testUser", email: "test@gmail.com" });

    const cookiesAuth = resAuth.headers["set-cookie"];

    for (let i = 0; i < cookiesAuth.length; i++) {
      if (cookiesAuth[0].startsWith("token=")) {
        userToken = cookiesAuth[i].split(/\;/)[0].split(/\=/)[1];
        break;
      }
    }

    userId = decodeJwt(userToken).userId;

    const resPost = await request(app)
      .post("/post/create")
      .send({ title: "testPost", content: "testPost" })
      .set("Cookie", `token=${userToken}`);

    postId = resPost.body.post.id;
    postMinioName = resPost.body.post.content.split(/\//).pop();
  });

  it(`GET /users/profile/${userId!} - get user profile by id`, async () => {
    const res = await request(app).get(`/user/profile/${userId}`).expect(200);

    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user).toHaveProperty("name");
    expect(res.body.user).toHaveProperty("createdAt");

    expect(res.body.user).toHaveProperty("avatar_url");

    const avatarUrl = res.body.user.avatar_url;
    expect(avatarUrl == null || typeof avatarUrl == "string").toBe(true);

    expect(res.body.user).toHaveProperty("posts");
    expect(res.body.user).toHaveProperty("likedPosts");
  });

  it("GET /user/profile - throw error message when receiving a profile by jwt token without token", async () => {
    const res = await request(app).get("/user/profile").expect(401);

    expect(res.body.message).toEqual("Unauthorized");
  });

  it("GET /user/profile - get your profile by jwt token", async () => {
    const res = await request(app)
      .get("/user/profile")
      .set("Cookie", `token=${userToken}`)
      .expect(200);

    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user).toHaveProperty("name");
    expect(res.body.user).toHaveProperty("createdAt");

    expect(res.body.user).toHaveProperty("avatar_url");

    const avatarUrl = res.body.user.avatar_url;
    expect(avatarUrl == null || typeof avatarUrl == "string").toBe(true);

    expect(res.body.user).toHaveProperty("posts");
    expect(res.body.user).toHaveProperty("likedPosts");
  });

  it("PUT /user/update/profile - update name if this name already exists", async () => {
    await UserModel.create({
      name: "testUser2",
      email: "test2@gmail.com",
      password: "testUser2",
    });

    const res = await request(app)
      .put("/user/update/profile")
      .set("Cookie", `token=${userToken}`)
      .send({ newName: "testUser2" })
      .expect(400);

    expect(res.body.message).toEqual("This name already exists");

    await UserModel.destroy({
      where: {
        name: "testUser2",
      },
    });
  });

  it("PUT /user/update/profile - update name", async () => {
    const res = await request(app)
      .put("/user/update/profile")
      .set("Cookie", `token=${userToken}`)
      .send({ newName: "testUser2" })
      .expect(200);

    expect(res.body.message).toEqual("User profile was successfully update");
  });

  it("PUT /user/change/password - change password if old password is incorrect", async () => {
    const res = await request(app)
      .put("/user/change/password")
      .set("Cookie", `token=${userToken}`)
      .send({ oldPassword: "wrongPassword", newPassword: "testUser" })
      .expect(400);

    expect(res.body.message).toEqual("The old password is incorrect");
  });

  it("PUT /user/change/profile - change password if new password == old password", async () => {
    const res = await request(app)
      .put("/user/change/password")
      .set("Cookie", `token=${userToken}`)
      .send({ oldPassword: "testUser", newPassword: "testUser" })
      .expect(400);

    expect(res.body.message).toEqual("New password must be different from old password");
  });

  it("PUT /user/change/password - change password", async () => {
    const res = await request(app)
      .put("/user/change/password")
      .set("Cookie", `token=${userToken}`)
      .send({ oldPassword: "testUser", newPassword: "newPassword" })
      .expect(200);

    expect(res.body.message).toEqual("Password was successfully update");
  });

  it("user like post", async () => {
    const res = await request(app)
      .put(`/user/like/post/${postId}`)
      .set("Cookie", `token=${userToken}`)
      .expect(200);

    expect(res.body.message).toEqual("The post was successfully added to likes");
  });

  it("user removed like post", async () => {
    const res = await request(app)
      .put(`/user/like/post/${postId}`)
      .set("Cookie", `token=${userToken}`)
      .expect(200);

    expect(res.body.message).toEqual("The post was successfully removed from likes");
  });

  afterAll(async () => {
    await PostModel.destroy({
      where: {
        creator_id: userId,
      },
    });

    if (postMinioName) {
      await s3Service.removeObject(postMinioName);
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

    await request(app)
      .delete(`/post/delete/${postId}`)
      .set("Cookie", `token=${userToken}`);
  });
});
