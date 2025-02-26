const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");

dotenv.config();

const connectDatabase = require("./config/database.js");

const auth_route = require("./route/auth.route.js");
const story_route = require("./route/story.route.js");
const genre_route = require("./route/genre.route.js");
const chapter_route = require("./route/chapter.route.js");

let PORT = process.env.PORT;
let HOST = process.env.HOST;

let app = express();

// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     credentials: true,
//   })
// );

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

connectDatabase();

app.use("/api/auth", auth_route);
app.use("/api/story", story_route);
app.use("/api/genre", genre_route);
app.use("/api/chapter", chapter_route);

app.get("/", (req, res) => {
  res.end("Hello User");
})

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://${HOST}:${PORT}`);
});
