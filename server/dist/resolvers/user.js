"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const type_graphql_1 = require("type-graphql");
const User_1 = require("../entities/User");
const constants_1 = require("../constants");
const validateEmail_1 = require("../utils/validateEmail");
const sendEmail_1 = require("../utils/sendEmail");
const validateRegister_1 = require("../utils/validateRegister");
const argon2_1 = __importDefault(require("argon2"));
const UsernamePasswordInput_1 = require("../objecttypes/UsernamePasswordInput");
const UserResponse_1 = require("../objecttypes/UserResponse");
const uuid_1 = require("uuid");
let UserResolver = class UserResolver {
    changePassword(token, newPassword, { req, redis }) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = constants_1.FORGET_PASSWORD_PREFIX + token;
            const userIdStr = yield redis.get(key);
            if (!userIdStr) {
                return {
                    errors: [
                        {
                            field: "token",
                            message: "token expired"
                        }
                    ]
                };
            }
            const userId = parseInt(userIdStr);
            const validationErrors = validateRegister_1.validatePassword(newPassword);
            if (validationErrors) {
                return {
                    errors: validationErrors
                };
            }
            const user = yield User_1.User.findOne(userId);
            if (!user) {
                return {
                    errors: [
                        {
                            field: "token",
                            message: "user no longer exists"
                        }
                    ]
                };
            }
            yield User_1.User.update({ id: userId }, {
                password: yield argon2_1.default.hash(newPassword)
            });
            redis.del(key);
            req.session.userId = userId;
            return {
                user: user
            };
        });
    }
    forgotPassword(email, { redis }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne({ where: { email: email.toLowerCase() } });
            if (!user) {
                return true;
            }
            const token = uuid_1.v4();
            yield redis.set(constants_1.FORGET_PASSWORD_PREFIX + token, user.id, 'ex', 1000 * 60 * 60 * 24 * 3);
            const link = constants_1.FRONTEND_URL + '/change-password/' + token;
            yield sendEmail_1.sendEmail(email, "Reset Password", `<a href="${link}">reset password</a>`);
            return true;
        });
    }
    users() {
        return User_1.User.find();
    }
    me({ req }) {
        if (!req.session.userId) {
            return null;
        }
        return User_1.User.findOne(req.session.userId);
    }
    register(options, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const validationErrors = validateRegister_1.validateRegister(options);
            if (validationErrors) {
                return { errors: validationErrors };
            }
            const hashedPassword = yield argon2_1.default.hash(options.password);
            const user = User_1.User.create({
                username: options.username.toLowerCase(),
                email: options.email.toLowerCase(),
                password: hashedPassword
            });
            try {
                user.save();
            }
            catch (err) {
                console.log("err: ", err);
                if (err.code = '23505') {
                    if (err.constraint === 'user_email_unique') {
                        return {
                            errors: [
                                {
                                    field: "email",
                                    message: "this email already has an account"
                                }
                            ]
                        };
                    }
                    else {
                        return {
                            errors: [
                                {
                                    field: "username",
                                    message: "this username is taken"
                                }
                            ]
                        };
                    }
                }
            }
            req.session.userId = user.id;
            return {
                user: user
            };
        });
    }
    login(usernameOrEmail, password, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne(validateEmail_1.isValidEmail(usernameOrEmail)
                ? { where: { email: usernameOrEmail.toLowerCase() } }
                : { where: { username: usernameOrEmail.toLowerCase() } });
            if (!user) {
                return {
                    errors: [{
                            field: "usernameOrEmail",
                            message: "username does not exist"
                        }]
                };
            }
            const valid = yield argon2_1.default.verify(user.password, password);
            if (!valid) {
                return {
                    errors: [{
                            field: "password",
                            message: "incorrect password"
                        }]
                };
            }
            req.session.userId = user.id;
            return {
                user: user
            };
        });
    }
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield User_1.User.delete(id);
            return true;
        });
    }
    logout({ req, res }) {
        return new Promise((resolve) => req.session.destroy((err) => {
            res.clearCookie(constants_1.COOKIE_NAME);
            if (err) {
                console.log(err);
                resolve(false);
                return;
            }
            resolve(true);
        }));
    }
};
__decorate([
    type_graphql_1.Mutation(() => UserResponse_1.UserResponse),
    __param(0, type_graphql_1.Arg("token")),
    __param(1, type_graphql_1.Arg("newPassword")),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "changePassword", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg('email')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "forgotPassword", null);
__decorate([
    type_graphql_1.Query(() => [User_1.User]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "users", null);
__decorate([
    type_graphql_1.Query(() => User_1.User, { nullable: true }),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "me", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse_1.UserResponse),
    __param(0, type_graphql_1.Arg('options')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UsernamePasswordInput_1.UsernamePasswordInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse_1.UserResponse),
    __param(0, type_graphql_1.Arg('usernameOrEmail')),
    __param(1, type_graphql_1.Arg('password')),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "deleteUser", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "logout", null);
UserResolver = __decorate([
    type_graphql_1.Resolver()
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map