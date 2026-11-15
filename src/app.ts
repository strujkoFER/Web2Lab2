import express from "express";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const app = express();

const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port =
  externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;
const baseURL = externalUrl || `http://localhost:${port}`;

app.set("view engine", "ejs");
app.set("views", "./views");
app.set("views", path.join(import.meta.dirname, "views"));

let checkboxXSS: boolean = false;
let checkboxAccess: boolean = false;
let name: string = "Guest";
let user: string = "Alice";

app.get("/", (req: any, res: any) => {
  if (req.query.name) {
    name = req.query.name;
  }
  if (req.query.user) {
    user = req.query.user;
  }
  checkboxXSS = req.query.checkboxXSS === "on";
  checkboxAccess = req.query.checkboxAccess === "on";

  res.render("home", {
    name: name,
    checkboxXSS: checkboxXSS,
    checkboxAccess: checkboxAccess,
    user: user,
  });
});

const documents = [
  { id: 1, owner: "Alice", content: "Alice's private notes" },
  { id: 2, owner: "Bob", content: "Bob's private notes" },
];

app.get("/documents/:id", (req, res) => {
  const currentUser = req.query.user;
  const document = documents.find((doc) => doc.id === Number(req.params.id));
  if (!document) {
    return res.status(404).send("Not found");
  }
  if (!checkboxAccess && document.owner !== currentUser) {
    return res.status(403).send("Forbidden");
  }

  res.json(document);
});

const hostname = externalUrl ? "0.0.0.0" : "127.0.0.1";
app.listen(port, hostname, () => {
  console.log(`Server locally running at http://${hostname}:${port}`);
  if (externalUrl) console.log(`External URL: ${externalUrl}`);
});
