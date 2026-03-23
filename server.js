import "dotenv/config";
import app from "./src/app.js";
import connect_db from "./src/common/config/db.js";

const PORT = process.env.PORT;
const start = async () => {
  // connect to database
  await connect_db();
  // starting our app
  app.listen(PORT, () => {
    console.log(
      `Server is running at ${PORT} in ${process.env.NODE_ENV} mode.`,
    );
  });
};

// handle the error or use try catch
start().catch(() => {
  console.error("Failed to start server");
  process.exit(1);
});
