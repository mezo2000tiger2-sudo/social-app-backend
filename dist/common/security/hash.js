"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compare = exports.Hash = void 0;
const bcrypt_1 = require("bcrypt");
const Hash = (plainText, Salt_Rounds = 12) => {
    return (0, bcrypt_1.hashSync)(plainText, Salt_Rounds);
};
exports.Hash = Hash;
const Compare = (plainText, cipherText) => {
    return (0, bcrypt_1.compareSync)(plainText, cipherText);
};
exports.Compare = Compare;
//# sourceMappingURL=hash.js.map