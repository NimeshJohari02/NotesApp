//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const _=require("lodash");

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistdb", {
  useNewUrlParser: true
});
const itemsSchema = {
  item: String
};
const Item = mongoose.model("Item", itemsSchema);

const Item1 = new Item({
  item: "Welcome To Your To-Do List"
});
const Item2 = new Item({
  item: "Press The + Button To add"
});
const Item3 = new Item({
  item: "<-- Check To Delete "
});
const defaultItems = [Item1, Item2, Item3];
const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("list", listSchema);

function insertion() {
  Item.insertMany(defaultItems, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Success");
    }
  });
}

const day = date.getDate();
app.get("/", function(req, res) {

  Item.find({}, function(err, lists) {
    if (lists.length == 0) {
      insertion();
    } else {
      res.render("list", {
        listTitle: day,
        newListItems: lists
      });
    }
  });
});


app.post("/", function(req, res) {
  const Itemname = req.body.newItem;
  const ListName=req.body.list;
  console.log(ListName);

  const temp = new Item({
    item: Itemname
  });

  if(ListName==day)
  {
    temp.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name:ListName},function(err,foundlist){
      console.log(foundlist);

      foundlist.items.push(temp);

      foundlist.save();
      res.redirect("/"+ListName);
    });
  }

});

app.post("/delete", function(req, res) {
  const deleteid = req.body.removebox;
  const listtobedeleted=req.body.Listname;
  if(listtobedeleted==day)
  {
    Item.deleteOne({
      _id: deleteid
    }, function(err) {
      if (err) {
        console.log(err);
        res.redirect("/");
      } else {
        console.log("Deleted");
        res.redirect("/");

      }
  }
)
  }
  else
  {
  List.findOneAndUpdate({name:listtobedeleted}, {$pull:{items:{_id:deleteid}}},function(err,foundList){
    if(!err)
    {
      res.redirect("/"+listtobedeleted);

    }
  });
  }
});

app.get("/:routename", function(req, res) {
  const rname = _.capitalize(req.params.routename);
  List.findOne({
    name: rname
  }, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      if (result) {
        //Show the existing List
        console.log("List  Exist");
        res.render("list", {
          listTitle: result.name,
          newListItems: result.items
        })

      } else {
        //Create a New list
        console.log("List DoesNot Exist")
        const newlist = new List({
          name: rname,
          items: defaultItems
        });
        newlist.save();
        res.redirect("/" + rname);

      }
    }


  });


});
app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
