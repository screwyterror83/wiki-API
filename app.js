const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

const dbName = "wikiDB";

mongoose.connect(
  "mongodb+srv://admin-darren:Mongodb382%23@cluster0-gmncq.mongodb.net/" +
  dbName, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  }
);

const articleSchema = new mongoose.Schema({
  title: String,
  content: String
})

const Article = mongoose.model("Article", articleSchema)

// TO DO

/* using a express module method "app.route()" to chain all the http request to 
the same route together, details in https://expressjs.com/en/guide/routing.html */

app.route('/articles')

  .get((req, res) => {

    Article.find({}, (err, foundArticles) => {
      if (!err) {
        res.send(foundArticles)
      } else {
        res.send(err)
      }
    })
  })

  .post((req, res) => {
    // console.log(req.body.title);
    // console.log(req.body.content);

    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content,
    });

    newArticle.save((err) => {
      if (err) {
        res.send(err)
      } else {
        res.send("Successfully added new article.");
      }
    })
  })

  .delete((req, res) => {
    Article.deleteMany({}, (err) => {
      if (err) {
        res.send(err)
      } else {
        res.send("Successfully deleted all articles.")
      }
    })
  });

app
  .route("/articles/:articleTitle")
  .get((req, res) => {
    Article.findOne({ title: req.params.articleTitle }, (err, article) => {
      if (!article) {
        res.send("No Article by the name: " + req.params.articleTitle + " was found.");
      } else {
        res.send(article)
      }
    });
  })
  .put((req, res) => {
    // Article.update(
    //   { title: req.params.articleTitle },
    //   { title: req.body.title, content: req.body.content },
    //   { overwrite: true }, (err) => {
    //     if (!err) {
    //       res.send("Successfully updated article")
    //     }
    //   })
  

    Article.findOneAndUpdate({ title: req.params.articleTitle }, { title: req.body.title, content: req.body.content }, { upsert: true, }, (err) => {
      if (!err) {
        res.send("Article has been successfully updated")
      }
    })
  })

  .patch((req, res) => {

      Article.findOneAndUpdate(
        { title: req.params.articleTitle },
        { $set: req.body },
        // { upsert: true },
        /* patch doesn't need to create new doc, it's merely update field of document */
        (err) => {
          if (!err) {
            res.send("Article has been successfully updated");
          } else {
            res.send(err);
          }
        }
      );
  })
  .delete((req, res) => {
    Article.deleteOne({ title: req.params.articleTitle }, (err) => {
      if (!err) {
        res.send("Corresponding article has been successfully deleted")
      }
    })
  });

let port = process.env.PORT
if (port == null || port == "") {
  port = 3000
}
app.listen(port, (err) => {
  if (!err) {
    console.log("Server started on port " + port)
  }
});
