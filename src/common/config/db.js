import mongoose from "mongoose";

const connect_db = async () => {
  const dbConnection = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`MongoDB Connected: ${dbConnection.connection.host}`);
};

export default connect_db;
