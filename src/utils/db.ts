import mongoose, { ConnectOptions } from "mongoose";
import { ConnectionOptions } from "tls";

const connectToDb = async () => {
  try {
    const uri: string = process.env.MONGOURI_DEV || "mongodb://localhost:27017/project_x";
    const options = { useNewUrlParser: true, useUnifiedTopology: true };
    const connection = await mongoose.connect(uri, options as ConnectionOptions);
    console.log(`Connected to database ${connection.connections[0].name}`);
  } catch (err) {
    console.log(err);
  }
};

export default connectToDb;
