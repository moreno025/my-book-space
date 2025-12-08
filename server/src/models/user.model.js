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
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  refreshTokens: [{ type: String }],
  resetPasswordToken: String, 
  resetPasswordExpires: Date,
}, { timestamps: true });

// Hashear password antes de guardar
userSchema.pre("save", async function() {
  if (!this.isModified("password")) return;
  this.password = bcrypt.hash(this.password, 10);
});

// Comparar password en login
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw new Error("Error comparando contraseña");
  }
};

export default mongoose.model("User", userSchema);
