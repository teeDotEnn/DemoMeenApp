// Requirements
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const MongoClient = require('mongodb').MongoClient;
//Mongo credentials
const mongoUrl = 'mongodb://127.0.0.1:27017';
const dbName = 'pizzaOrders';
const collection = 'orders';


//Validation functions

const errorMessages = {
    emptyError: "Field cannot be blank",
    lengthError: "Input too short",
    formatError: "Input in wrong format",
    nanError: "Please enter a number",
    singleDigitError:"Please enter a single digit between 1 and 9",
    radioButtonUnchecked: "Please ensure you check at least one of each radio button"
}

const constraints = {
    length : 2 ,
    tel : /\d{10}/,
    number: /\d{1,}/,
    singleNum:/\d{1}/,
    email: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
};
/*************************
 * Validates that text is not empty
 * and is of valid length
 * 
 *************************/
function validateText(inputField){  
    if(inputField == undefined){
        return `Text Input Error: ${errorMessages.emptyError}`;
    } else{
        if(inputField.length < 2)
         return `Text Input Error :${errorMessages.lengthError}`;
    }
}
/*************************
 * Validates that phone number
 * is of correct length
 * 
 *************************/
function validatePhone(inputField){  
    let regex = new RegExp(constraints.tel);
    let value = inputField.replace(/[^\w\s]|_/g, "").replace(/[^\w\s]|_/g, "");
    if(inputField == ''){
        return `Phone Number Error: ${errorMessages.emptyError}`;
    }else{
     if(!regex.test(value))
        return `Phone Number Error: ${errorMessages.formatError}`;
    }
}
/*************************
 * Validates that email address
 * is in correct format
 * 
 *************************/
function validateEmail(inputField)
{
    let regex = new RegExp(constraints.email);
    if(inputField == '')
    {
        return `Invalid Email: ${errorMessages.emptyError}`;
    }else{
        if(!regex.test(inputField))
        return `Invalid Email: ${errorMessages.formatError}`;
    }
}
/*************************
 * Validates input for
 * if it is a number
 * 
 *************************/
function validateNumber(inputField){
    let regex = new RegExp(constraints.number);
    if(inputField == ""){
        return `Street Number Error: ${errorMessages.emptyError} `;
    }else if(!regex.test(inputField)){
        return `Street Number Error: ${errorMessages.nanError} `;
    }
}
/*************************
 * Validates that 
 * input is a single digit
 * 
 *************************/
function validateSingleDigit(inputField){
    let regex = new RegExp(constraints.singleNum);
    if(inputField == ""){
        return `Pizza Number Error: ${errorMessages.emptyError} `;
    }else if(!regex.test(inputField)){
        return `Pizza Number Error: ${errorMessages.singleDigitError} `;
    }else if(inputField === 0)
    {
        return `Pizza Number Error: Please enter a number between 1 and 9 `;
    }
}

//Variables to hold state

let db;
let orderCollection;
let data;


app.use(bodyParser.urlencoded({extended:true}));
app.set('viewengine', 'ejs');

//Set up connetion to local DB
MongoClient.connect(mongoUrl,{useNewUrlParser:true},(err, client) =>{
    if(err) return console.log(err);

    db=client.db(dbName);
    orderCollection=db.collection('orders');
    console.log(`connected MongoDB: ${mongoUrl}`);
    console.log(`Database: ${dbName}`);
})

/******************************************************* 
Runs on GET root route:
Retreives the static index
*********************************************************/
app.get('/', (req, res) =>{
    res.sendFile(__dirname + '/index.html');
})

/******************************************************* 
Runs on POST checkout route:
Inserts data into database, then nulls the data variable
*********************************************************/
app.post('/checkout',(req, res)=>{
    orderCollection.insertOne(data)
    .then(result=>{
        console.log(result);
    })
    res.render('checkout.ejs',
    {data, confirmation: "Your order has been submitted to the kitchen!"})
    data = null;
})

/******************************************************* 
Runs on POST /submit route:
sets data variable
validates inbound data and redirects depening on result
*********************************************************/
app.post('/submit',(req, res)=>{
        
        data = req.body;

        //Server Side validation
        let errors = [];
        let valid = false;
        errors.push(validateText(data.fName));
        errors.push(validateText(data.lName));
        errors.push(validateNumber(data.streetNumber));
        errors.push(validateText(data.streetName));
        errors.push(validateEmail(data.email));
        errors.push(validatePhone(data.telNumber));
        errors.push(validateSingleDigit(data.numberOfPizzas));
        errors.push(validateText(data.size));
        errors.push(validateText(data.dough));
        errors.push(validateText(data.sauce));
        errors.push(validateText(data.cheese));
        console.log(errors);

        //If validation fails, serve sticky index with the errors
        //Otherwise, serve the checkout screen
        for(let i = 0; i < errors.length; i++)
        {
            //validity array to hold 
            let validity = [];
            errors[i] == undefined ? validity.push(true):
                validity.push(false);
            
            if (!validity.includes(false))
            {
                valid = true;
            }
        }
        //Returns user to index page with all filled out data
        //if data is bad
        //Otherwise redirects to checkout page
        if(!valid)
        {
            res.render('stickyIndex.ejs',{data, errors: errors})
        }else{
            console.log(data);
            res.render('checkout.ejs',{data, confirmation:""});
        }
})


/******************************************************* 
Runs on POST /makeChanges route:
renders sticky index page with all given data
*********************************************************/
app.post('/makeChanges',(req, res)=>{
    res.render('stickyIndex.ejs',{data, errors:[]})
})

app.listen(3000, ()=>{
    console.log('listening on port 3000');
});

/******************************************************* 
Runs on GET /orders route:
Renders all orders
*********************************************************/
app.get('/orders', (req, res)=>{
    orderCollection.find().toArray()
    .then(results=>{
        console.log(results);
        res.render('showOrders.ejs',{orders: results});
    })
    .catch(error => console.error(error))
})
