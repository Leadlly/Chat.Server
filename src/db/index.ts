import mongoose from "mongoose";

let db: mongoose.Connection;

const ConnectToDB = async () => {
  const DatabaseUrl = process.env.LEADLLY_DB_URL as string;

  try {
    await mongoose.connect(DatabaseUrl);
    db = mongoose.connection;
    console.log("Leadlly_DB Connected.");

  } catch (error) {
    console.log("Error connecting to databases:", error);
  }
};

export { db };
export default ConnectToDB;
