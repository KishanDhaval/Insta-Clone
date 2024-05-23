const express = require("express");
const app = express();

const userModel = require("./models/user");
const postModel = require("./models/post.js");

const upload = require("./models/multer.js")

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookie = require("cookie-parser");

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./public"));

app.use(cookie());


// AUTHANTICATION 
app.get("/", function (req, res) {
  res.render("index");
});
app.post("/register", function (req, res) {
  let { username, name, email, password } = req.body;
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, async function (err, hash) {
      let user = await userModel.create({
        username,
        name,
        email,
        password: hash,
      });
      let token = jwt.sign({ username:username, userId:user._id }, "secrete");
      res.cookie("token", token);
      res.redirect(`/profile/${user.username}`);
    });
  });
});

app.get("/login", function (req, res) {
  res.render("login");
});
app.post("/login", async function (req, res) {
  let { username, password } = req.body;
  const user = await userModel.findOne({ username });
  if (!user) return res.redirect("/");

  bcrypt.compare(password, user.password, function (err, result) {
    if (result) {
      let token = jwt.sign({ username, userId:user._id }, "secrete");
      res.cookie("token", token);
      res.status(200).redirect(`/profile/${user.username}`);
      ;
    } else res.redirect("/login");
  });
});


// FEED
app.get("/feed", isLoggedIn,async function (req, res) {
  let posts = await postModel.find().populate("user")
  let user = await userModel.findOne({_id : req.user.userId})
  const puser = await userModel.findOne({_id  : req.user.userId})
  res.render("feed" , {posts , user ,puser});
});

app.get("/like/:postId", isLoggedIn,async function (req, res) {
  let post = await postModel.findOne({_id : req.params.postId})
  let user = await userModel.findOne({_id : req.user.userId})

  if(post.like.indexOf(user._id) === -1){
      post.like.push(user._id)
  }else{
    post.like.splice(post.like.indexOf(user._id) , 1)
  }
  await post.save()
  res.redirect("/feed")
});

app.get("/saved/:postId", isLoggedIn,async function (req, res) {
  let post = await postModel.findOne({_id : req.params.postId})
  let user = await userModel.findOne({_id : req.user.userId})

  if(user.saved.indexOf(post._id) === -1){
      user.saved.push(post._id)
  }else{
    user.saved.splice(user.saved.indexOf(post._id) , 1)
  }
  await user.save()
  res.redirect("/feed")
});


// SEARCH
app.get("/search", isLoggedIn,async function (req, res) {
  let user = await userModel.findOne({_id : req.user.userId})
  const puser = await userModel.findOne({_id  : req.user.userId})
  res.render("search" , {user , puser});
});

app.get("/search/:user", isLoggedIn, async function (req, res) {
  const searchTerm = req.params.user;
  const regex = new RegExp(searchTerm, 'i'); // Case-insensitive search for any substring


    let users = await userModel.find({ username: { $regex: regex } });
    res.json(users);
 
});



// PROFILE
app.get("/profile/:username", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.params.username }).populate("posts");
  const puser = await userModel.findOne({_id  : req.user.userId})
  res.render("profile", { user , puser });
});

app.get("/profile/follow/:userId", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ _id: req.params.userId })
  const puser = await userModel.findOne({_id  : req.user.userId})
  if(puser.following.indexOf(user._id) === -1){
      puser.following.push(user._id)
      user.followers.push(puser._id)
  }else{
    puser.following.splice(puser.following.indexOf(user._id) ,1)
    user.followers.splice(user.followers.indexOf(puser._id) ,1)
  }
  await puser.save()
  await user.save()
  res.redirect(`/profile/${user.username}`);
});

app.get("/followers/:username",isLoggedIn ,async function(req , res){
  const user = await userModel.findOne({ username: req.params.username }).populate("followers");
  const puser = await userModel.findOne({_id  : req.user.userId})
  res.render("followers" , {user , puser})
})

app.get('/search/followers/:query', async (req, res) => {
  try {
      const query = req.params.query;
      const userId = req.user.userId;

      // Find the logged-in user and populate the followers field with the search query
      const user = await userModel.findById(userId).populate({
          path: 'followers',
          match: { username: { $regex: new RegExp(query, 'i') } } // Case-insensitive search
      });

      // Extract the searched followers data
      const searchedFollowers = user.followers.filter(follower => follower.username.toLowerCase().includes(query.toLowerCase()));

      // Send the searched followers data as JSON response
      res.json(searchedFollowers);
  } catch (error) {
      // Handle errors
      console.error('Error searching for followers:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = app;





// PROFILE/EDIT
app.get("/edit", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ _id: req.user.userId });
  res.render("edit", { user });
});

app.post("/edit", isLoggedIn, upload.single('picture'), async function (req, res) {
  let { username, name, bio } = req.body;
  let user = await userModel.findOneAndUpdate(
    { _id: req.user.userId },
    { username, name, bio  }, // Use req.file.filename instead of req.file.picture
    { new: true }
  );
  if(req.file){
    picture:req.file.filename
    await user.save()
  }
    res.redirect(`/profile/${user.username}`);
});



//  CREATE POST
app.get("/create",isLoggedIn, isLoggedIn,async function (req, res) {
  res.render("create");
});

app.post("/upload" ,isLoggedIn ,upload.single('post-photo') ,async function(req , res){
  const user = await userModel.findOne({_id : req.user.userId})
  const post =await postModel.create({
    user: req.user.userId,
     caption : req.body.caption ,
     picture : req.file.filename
  })
  user.posts.push(post._id)
  await user.save()
  res.redirect("/feed")
})


// LOGOUT
app.get("/logout", function (req, res) {
  res.cookie("token", "");
  res.redirect("/login");
});


// ISLOGGEDIN FUNCTION
function isLoggedIn(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    console.log("No token found");
    return res.redirect("/login");
  }
  try {
    const data = jwt.verify(token, "secrete");
    req.user = data;
    next();
  } catch (error) {
    console.log("Token verification failed:", error);
    res.redirect("/login");
  }
}

app.listen(3000);
