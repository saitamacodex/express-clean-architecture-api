import "dotenv/config";
import app from "./src/app.js";
import connect_db from "./src/common/config/db.js";
import { transporter } from "./src/common/config/email.js";

const PORT = process.env.PORT || 5000;
const start = async () => {
  // connect to database
  await connect_db();

  // verify SMTP server connection before starting the app
  await transporter.verify();
  console.log("SMTP server is ready to send emails");

  // starting our app
  app.listen(PORT, () => {
    console.log(
      `Server is running at ${PORT} in ${process.env.NODE_ENV} mode.`,
    );
  });
};

// handle the error or use try catch
start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
