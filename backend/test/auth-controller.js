const expect = require("chai").expect;
const sinon = require("sinon");
const mongoose = require("mongoose");

const User = require("../models/user");
const AuthController = require("../controllers/auth");

describe("Auth Controller - Login", function () {
  it("should throw an error if accessing the database fails", function (done) {
    sinon.stub(User, "findOne");
    User.findOne.throws();

    const req = {
      body: {
        email: "test@test.com",
        password: "test1234",
      },
    };
    AuthController.login(req, {}, () => {}).then((result) => {
      expect(result).to.be.an("error");
      expect(result).to.have.property("statusCode", 500);
      done();
    });

    User.findOne.restore();
  });

  it("should send a response with a valid user status for an existing user", function (done) {
    mongoose
      .connect(
        "mongodb+srv://user1:mongo@cluster1.orslq.mongodb.net/test-messages"
      )
      .then((result) => {
        const user = new User({
          email: "test@test.com",
          password: "test1234",
          name: "Test",
          posts: [],
          _id: "5c0f66b979af55031b34728a",
        });
        return user.save();
      })
      .then(() => {
        const req = { userId: "5c0f66b979af55031b34728a" };
        const res = {
          statusCode: 500,
          userStatu: null,
          status: function (code) {
            this.statusCode = code;
            return this;
          },
          json: function (data) {
            this.userStatus = data.status;
          },
        };
        AuthController.getUserStatus(req, res, () => {}).then(() => {
          expect(res.statusCode).to.be.equal(200);
          expect(res.userStatus).to.be.equal("I am new!");
          User.deleteMany({}).then(() => {
            return mongoose.disconnect().then(() => {
              done();
            });
          });
        });
      })
      .catch((err) => console.log(err));
  });
});
