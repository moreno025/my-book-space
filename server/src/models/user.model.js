import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    maxlength: 10,
    trim: true,
  },
  name: {
    type: String,
    maxlength: 20,
    default: "",
    trim: true,
  },
  lastName: {
    type: String,
    maxlength: 20,
    default: "",
    trim: true,
  },
  bio: {
    type: String,
    maxlength: 200,
    default: "",
    trim: true,
  },
  avatar: {
    type: String,
    default: "/uploads/avatar.jpg",
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  savedLists: [{ type: mongoose.Schema.Types.ObjectId, ref: "BookList" }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  refreshTokens: [{ type: String }],
  resetPasswordToken: String, 
  resetPasswordExpires: Date,
  pendingEmail: { type: String },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date }
}, { timestamps: true });


userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


userSchema.methods.matchPassword = async function (enteredPassword) {

  return await bcrypt.compare(enteredPassword, this.password);
};


export default mongoose.model("User", userSchema);
