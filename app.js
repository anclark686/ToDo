//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-ac:*REDACTED*6@cluster0-2kezi.mongodb.net/actodolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

const randomlist = ["a", "b", "c", "d"]

app.get("/", function(req, res) {

  List.find(function(err, lists){
    if (!err) {
      res.render("home", {lists: lists});
    }
  });


});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        if (customListName != "Favicon.ico"){
        //Create a new list
        console.log("let me know if you're here");
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName)
        // this one doesnt work
        console.log("what about this spot?");
        }
      } else {
        //Show an existing list
        // this one works
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        console.log("or here");
        // console.log(foundList.items);
      }
    }
  })
});

app.post("/", function(req, res) {
  console.log(req.body);
  const newListName = _.capitalize(req.body.newItem);

  List.findOne({name: newListName}, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        //Create a new list
        // this one works
        const list = new List({
          name: newListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + newListName)
        console.log("or this a-way");
      }
      // else {
      //   //Show an existing list
      //   // this does nothing?
      //   res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      //   console.log("this seems repetetive");
      // }
    }
  })
});

app.post("/:customListName", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
// this one works
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
      console.log("i think this is the last one");
    })
});

app.post("/delete", function(req, res) {
  console.log("hello!")
//   const checkedItemID = req.body.checkbox;
//   // const listName = req.body.listName;
// res.redirect("/" + listName);
    // List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, function(err, foundList) {
    //   if (!err) {
    //     res.redirect("/" + listName);
    //   }
    // })
});

app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully");
});
