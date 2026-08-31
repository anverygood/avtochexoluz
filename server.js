require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-almashtiring",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8 soat
  })
);

app.use("/", require("./routes/public"));
app.use("/admin", require("./routes/admin"));

// 404
app.use((req, res) => {
  res.status(404).send("Sahifa topilmadi. <a href='/'>Bosh sahifaga qaytish</a>");
});


const PORT = process.env.PORT;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server ishga tushdi: port ${PORT}`);
});
