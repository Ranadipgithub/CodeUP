const validator = require("validator");

const validate = (data) => {
    const mandetoryFields = ["firstName", "emailId", "password"];
    const isAllowed = mandetoryFields.every((k) => Object.keys(data).includes(k));

    if (!isAllowed) {
        throw new Error(`Missing mandetory fields: ${mandetoryFields.join(", ")}`);
    }

    if (!validator.isEmail(data.emailId)) {
        throw new Error("Invalid credentials");
    }

    if(!validator.isStrongPassword(data.password)) {
        throw new Error("Password must be strong");
    }
}

module.exports = validate;