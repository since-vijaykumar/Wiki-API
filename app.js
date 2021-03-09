//jshint esversion: 10

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

// create db connection
mongoose.connect("mongodb://localhost:27017/wikiDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const con = mongoose.connection;
con.on("error", console.error.bind(console, "connection error:"));
con.once("open", () => {
  console.log("Successfully connected to DB.");
});
//create schema
const wikiSchema = new mongoose.Schema({
  title: String,
  content: String
});

// create/connect to collection
const Article = mongoose.model("Article", wikiSchema);

app.get("/", (req, res) => {
  console.log("Server started ");
});

app
  .route("/articles")
  .get((req, res) => {
    Article.find({}, (err, articles) => {
      if (!err) {
        res.send(articles);
      } else {
        res.send(err);
      }
    });
  })
  .post((req, res) => {
    const title = req.body.title;
    const content = req.body.content;

    const newArticle = new Article({
      title: title,
      content: content
    });

    newArticle.save((err, result) => {
      if (err) {
        res.send(err);
      } else {
        res.send("Successfully save new article.");
      }
    });
  })
  .delete((req, res) => {
    Article.deleteMany({}).then((err, results) => {
      if (err) {
        res.send(err);
      } else {
        res.send("Successfully delete all documents.");
      }
    });
  });

app
  .route("/articles/:articleName")
  .get((req, res) => {
    const articleName = req.params.articleName;
    Article.findOne({title: articleName}, (err, foundArticle) => {
      if (foundArticle) {
        res.send("found article : " + foundArticle);
      } else {
        res.send("No Article found");
      }
    });
  })
  .put((req, res) => {
    const articleName = req.params.articleName;
    const updatedContent = req.body.content;
    const updatedTitle = req.body.title;

    Article.update(
      {title: articleName},
      {title: updatedTitle, content: updatedContent},
      {overwrite: true},
      (err, foundArticle) => {
        if (!err) {
          res.send("Updated article");
        } else {
          res.send("Failed to update");
        }
      }
    );
  })
  .patch((req, res) => {
    const articleName = req.params.articleName;
    const updatedContent = req.body.content;
    const updatedTitle = req.body.title;

    Article.updateOne(
      {title: articleName},
      // {title: updatedTitle, content: updatedContent},
      {$set: req.body},
      //{omitUndefined: true},
      (err, foundArticle) => {
        console.log(foundArticle);
        if (!err) {
          res.send("Updated article");
        } else {
          res.send("Failed to update");
        }
      }
    );
  })
  .delete((req, res) => {
    const articleName = req.params.articleName;
    Article.deleteOne({title: articleName}, (err, results) => {
      if (!err) {
        res.send("Successfully deleted article");
      } else {
        res.send(err);
      }
    });
  });

app.listen(process.env.PORT || 3000, (req, res) => {
  console.log("Successfully connected to server at port 3000.");
});
