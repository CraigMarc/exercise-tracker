let bodyParser = require('body-parser');
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let mongoose = require('mongoose')
const mySecret = process.env['MONGO_URI']
mongoose.connect(mySecret , { useNewUrlParser: true, useUnifiedTopology: true });


app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


const userSchema = new mongoose.Schema({
  
  username: {
    type: String,
   
  }

})

const exerciseSchema = new mongoose.Schema({

  userId: {
    type: String
  },

  description: {
  type: String
},
  
  duration: {
    type: Number
    
  },

   date: {
type: String
   }
  
})

let exerciseData = mongoose.model("exerciseData", exerciseSchema);

let userData = mongoose.model("userData", userSchema);


/*add new users*/

app.post("/api/users", async (req, res) => {
  try {
    const data = await userData.findOne({username: req.body.username});
   

    if (!data) {
      console.log("not found")
     
 let newRecord = new userData({username: req.body.username});

    newRecord.save().then(()=>{
       console.log("Document inserted succussfully :" + newRecord);
        res.json({
            username: newRecord.username,
            _id: newRecord._id
            });
     
    }).catch((err)=>{
        console.log(err);
        
    })
      
      
    }
    else { 
     
      
      res.json({
            username: data.username,
            _id: data._id
            });
   
      
       
    }
  
  }
  catch (err) {
    console.log(err);
  }

});

/*find all users*/

app.get("/api/users", async (req, res) => {

try {
    const data = await userData.find({}, {username:1, _id:1});

  let dataArr = []
    
    
for (let i=0; i < data.length; i++) {
  dataArr.push(data[i])
}
 res.json(dataArr);

  
}   
    
  
  catch (err) {
    console.log(err);
  }


});

/*add exercise data*/

app.post("/api/users/:_id/exercises", async (req, res) => {

try {
  console.log(req.params._id)
 
const userById = await userData.findOne({_id: req.params._id});
let userName = userById.username
let userId = userById._id
let date = new Date()
 

  if (!req.body.date) {
    let currentDate = new Date();
 date = currentDate.toDateString()
  }
  else {
    let dt = new Date(req.body.date)
date = dt.toDateString()
  }

  

  let newExercise = new exerciseData({userId: userId, description: req.body.description, duration: req.body.duration, date: date  });

    newExercise.save().then(()=>{
       console.log("Document inserted succussfully :" + newExercise);
        res.json({
            username: userName,
            description: newExercise.description,
            duration: newExercise.duration,
            date: newExercise.date,
            _id: newExercise.userId
})
            }).catch((err)=>{
        console.log(err);
        
    })

  
}   
  

  catch (err) {
    console.log(err);
  }


});

/* user logs */

app.get("/api/users/:_id/logs", async (req, res) => {
  try {
console.log(req.params._id)

 const data = await exerciseData.find({userId: req.params._id}, {_id:0, description:1, duration:1, date:1 }) .limit(req.query.limit)

    const userById = await userData.findOne({_id: req.params._id}) 


let userName = userById.username
let userId = req.params._id

let count = data.length
 let dataArr = []
    
for (let i=0; i < data.length; i++) {
  dataArr.push(data[i])
}
  console.log(dataArr)  
  res.json({
  username: userName,
  count: count,
  _id: userId,
  log: dataArr,
  
})

    console.log(req.query)
console.log(req.query.from)
    console.log(req.query.to)
    console.log(req.query.limit)
    
    
  }


  catch (err) {
    console.log(err);
  }  

})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
