import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import Person from "./modules/person.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static("dist"));
app.use(
  morgan((tokens, req, res) =>
    [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      JSON.stringify(req.body),
    ].join(" ")
  )
);

app.get("/api/persons", (_req, res) => {
  Person.find({}).then((result) => {
    res.json(result);
  });
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((result) => {
      if (result) {
        res.json(result);
      } else {
        res.status(404).end();
      }
    })
    .catch((err) => next(err));
});

app.post("/api/persons/", ({ body }, res, next) => {
  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => next(err));
});

app.put("/api/persons/:id", ({ body, params }, res, next) => {
  Person.findByIdAndUpdate(
    params.id,
    {
      name: body.name,
      number: body.number,
    },
    { new: true, runValidators: true }
  )
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch((err) => next(err));
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => res.status(204).end())
    .catch((err) => next(err));
});

app.get("/info", (_req, res) => {
  Person.count({}).then((c) => {
    res.send(`Phonebook has info for ${c} people<br/>${Date()}`);
  });
});

app.use((err, _req, res, next) => {
  if (err.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  }
  if (err.name === "ValidationError") {
    return res.status(400).send({ error: err.message });
  }
  next(err);
  return null;
});

app.listen(port);
