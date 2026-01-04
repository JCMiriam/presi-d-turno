import { createApp } from "./app.js"; 
import { createHttpServer } from "./http.js";

const app = createApp();
const httpServer = createHttpServer(app);

const PORT = Number(process.env.PORT ?? 10000);

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on :${PORT}`);
});
