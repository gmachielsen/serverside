const express = require("express");
const cors = require("cors");
const { readdirSync } = require("fs");
const mongoose = require('mongoose');
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
// import morgan from "morgan";
const morgan = require("morgan");
require("dotenv").config();

const csrfProtection = csrf({ cookie: true });
// create express app
const app = express();

// db
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
}).then(() => console.log("**DB CONNECTED**"))
.catch((err) => console.log("DB CONNECTION ERR => ", err));

// apply middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
// app.use((req, res, next) => {
//     console.log("This is my own middleware");
//     next();
// });

// route 
readdirSync("./routes").map((r) => 
    app.use("/api", require(`./routes/${r}`))
);

// csrf
app.use(csrfProtection);

app.get("/api/csrf-token", (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// port
const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Server is running on port ${port}`));


