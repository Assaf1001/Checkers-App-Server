const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Email is invalid!");
                }
            },
        },
        password: {
            type: String,
            required: true,
            trim: true,
            validate(value) {
                if (value.length < 8) {
                    throw new Error(
                        "Password must contain at least 8 characters!"
                    );
                }
            },
        },
        tokens: [
            {
                token: { type: String, required: true },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Hash the Password before saving
userSchema.pre("save", async function (next) {
    const user = this;

    if (this.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

// Compare between given Password to hashed Password
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error({ error: "Unable to login!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error({ error: "Unable to login!" });
    }
    return user;
};

// Generate Token for 1 day
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign(
        { _id: user._id.toString() },
        process.env.JWT_SECRET,
        {
            expiresIn: "1 day",
        }
    );

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
};

// Hide private fields
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;

    return userObject;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
