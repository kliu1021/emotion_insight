// MIS3502 - Web Service Template
// Created by: Jeremy Shafer
// Fall 2023

// REMINDER - Don't forget to change your database connection
// timeout from 3 seconds to 3 minutes.
// Look under Configuration / General Configuration

// declarations *****************************************
const qs = require('qs'); //for parsing URL encoded data
const axios = require('axios'); // for calling another API
const base64 = require('js-base64'); // encode / decode
const mysql = require('mysql2/promise');  //for talking to a database

const dboptions = {
  'user' : 'xxx',
  'password' : 'xxx',
  'database' : 'xxx',
  'host' : 'xxx'
};

//global connection variable
var connection;

const features = [
`Issue a GET against ./auth and provide a username and password. The API will respond with a JSON object containing all the user or admin information except the password.`,
`Issue a GET against ./users and provide the following keys: admin_id. The API will respond with all user with the corresponding admin_id.`,
`Issue a GET against ./userstat and provide the following keys: user_id, admin_id. The API will respond with a list of emotion and percentage divided by a comma.`,
`Issue a GET against ./allstat and provide the following keys: admin_id. The API will respond with a list of emotion and the number of emotion scan divided by a comma.`,
`Issue a GET against ./scan and provide the following keys: user_id. The API will respond with all the scan of one specific user.`,
`Issue a POST against ./users to create a new user record. You must provide the following keys: firstname, lastname, admin_id. The API will respond with a JSON object containing the new data you inserted.`,
`Issue a POST against ./scan to create a new scan record. You must provide the following keys: user_id, emotion. The API will respond with a JSON object containing the new data you inserted.`,
`Issue a POST against ./admin to create a new admin record. You must provide the following keys: firstname, lastname, username, password, email. The API will respond with a JSON object containing the admin_id.`,
`Issue a DELETE against ./users and provide the following keys: user_id. The API will respond with message Success.`,
'This API created by Kelly Liu'
]


// supporting functions *********************************
let getScan = async (res, query) => {
	
	// get the expected variable
	let user_id = query.user_id;
	
	//error trap
	if (user_id == undefined || user_id == ""){
		return formatres(res,"The key user_id is missing or incorrect.",400);
	}
	
	try{
		//work and return the result
		let txtSQL = "SELECT * FROM scan WHERE user_id = ? ORDER BY datetime DESC";
			
		let [result] = await connection.execute(txtSQL,[user_id]);
		
		return formatres(res,result,200);
		
	} catch (e){
		//return formatres(res, e, 500);
		return formatres(res, 'Uxexpected Error', 500);
	}
}

let getAllStat = async (res,query) => {

	// get the expected variable
	let admin_id = query.admin_id;
	
	//error trap
	if (admin_id == undefined || admin_id == ""){
		return formatres(res,"The key admin_id is missing or incorrect.",400);
	}

	try{
		//work and return the result
		let txtSQL = `SELECT COUNT(*) FROM users 
					JOIN scan ON users.user_id = scan.user_id 
					WHERE admin_id = ?`;
			
		let [result] = await connection.execute(txtSQL,[admin_id]);
		
		let sum = result[0]['COUNT(*)'];
		
		let emotionCount = ["Angry", "0", "Disgusted", "0", "Scared", "0", "Happy", "0", "Neutral", "0", "Sad", "0", "Surprised", "0"];
	
		if(sum == 0){
			return formatres(res, 0, 200);
		}
		
		for(let i=0; i<emotionCount.length; i+=2){
			let txtSQL2 = `SELECT COUNT(*) FROM users
						JOIN scan
						ON users.user_id = scan.user_id
						WHERE admin_id = ? AND emotion = ?`;
				
			let [result2] = await connection.execute(txtSQL2,[admin_id, emotionCount[i]]);
	
			emotionCount[i + 1] = result2[0]['COUNT(*)'];	
	
		}
		
		return formatres(res,emotionCount,200);
	} catch (e){
		//return formatres(res, e, 500);
		return formatres(res, 'Uxexpected Error', 500);
	}
}


let getUserStat = async (res,query) => {

	// get the expected variable
	let admin_id = query.admin_id;
	let user_id = query.user_id;
	
	//error trap
	if (admin_id == undefined || admin_id == ""){
		return formatres(res,"The key admin_id is missing or incorrect.",400);
	}
	if (user_id == undefined || user_id == ""){
		return formatres(res,"The key user_id is missing or incorrect.",400);
	}
		
	try{
		//work and return the result
		let txtSQL = `SELECT COUNT(*) FROM users 
					JOIN scan ON users.user_id = scan.user_id 
					WHERE admin_id = ? AND users.user_id = ?;`;
			
		let [result] = await connection.execute(txtSQL,[admin_id, user_id]);
		
		let sum = result[0]['COUNT(*)'];
		
		let emotionPerc = ["Angry", "0.00%", "Disgusted", "0.00%", "Scared", "0.00%", "Happy", "0.00%", "Neutral", "0.00%", "Sad", "0.00%", "Surprised", "0.00%"];
	
		if(sum == 0){
			return formatres(res, emotionPerc, 200);
		}
		
		for(let i=0; i<emotionPerc.length; i+=2){
			let txtSQL2 = `SELECT COUNT(*) FROM users
						JOIN scan
						ON users.user_id = scan.user_id
						WHERE admin_id = ? AND users.user_id = ? AND emotion = ?`;
				
			let [result2] = await connection.execute(txtSQL2,[admin_id, user_id, emotionPerc[i]]);
	
			emotionPerc[i + 1] = (( result2[0]['COUNT(*)'] / sum) * 100).toFixed(2) + '%';	
	
		}
	
		return formatres(res,emotionPerc,200);
	
	} catch (e){
		//return formatres(res, e, 500);
		return formatres(res, 'Uxexpected Error', 500);
	}
}


let deleteUser = async (res,body) =>{
	
	let user_id = body.user_id;
	
	//error trap
	if (user_id == undefined || user_id == ""){
		return formatres(res,"The key user_id is missing or incorrect.",400);
	}
	
	try{
		//work and return the result
		let txtSQL = "DELETE FROM users WHERE user_id = ?";
			
		let [result] = await connection.execute(txtSQL,[user_id]);
		
		return formatres(res,"Success",200);
		
	} catch (e){
		//return formatres(res, e, 500);
		return formatres(res, 'Uxexpected Error', 500);
	}
}


let getUser = async (res,query) => {

	// get the expected variable
	let admin_id = query.admin_id;
	
	//error trap
	if (admin_id == undefined || admin_id == ""){
		return formatres(res,"The key admin_id is missing or incorrect.",400);
	}
	
	try{
		//work and return the result
		let txtSQL = "SELECT * FROM users WHERE admin_id = ?";
			
		let [result] = await connection.execute(txtSQL,[admin_id]);
		
		return formatres(res,result,200);
		
	} catch (e){
		//return formatres(res, e, 500);
		return formatres(res, 'Uxexpected Error', 500);
	}
}


let postAdmin = async (res, body) => {
	
	// get the data
	let firstname = body.firstname;
	let lastname = body.lastname;
	let username = body.username;
	let password = body.password;
	let email = body.email;
	
	// test the data (error trap
	if (firstname == undefined || firstname == ""){
		return formatres(res,"The key firstname is missing or incorrect.",400);
	}
	if (lastname == undefined || lastname == ""){
		return formatres(res,"The key lastname is missing or incorrect.",400);
	}
	if (username == undefined || username == ""){
		return formatres(res,"The key username is missing or incorrect.",400);
	}
	if (password == undefined || password == ""){
		return formatres(res,"The key password is missing or incorrect.",400);
	}
	if (email == undefined || email == ""){
		return formatres(res,"The key email is missing or incorrect.",400);
	}

	try{
		let txtSQL00 = `SELECT username FROM
						(SELECT username FROM users
						UNION ALL
						SELECT username FROM admin)
						AS combo
						WHERE username = ?`;
		let [double] = await connection.execute(txtSQL00,[username]);
		
		let result2;
		if(double.length > 0){
			result2 = "This username has been taken. Try another one.";
		} else {
			// work with the data
			let txtSQL = `INSERT INTO admin (firstname, lastname, username, password, email) 
				VALUES (?,?,?,?,?)`;
			let [result] = await connection.execute(txtSQL,[firstname, lastname, username, password, email]);
			result2 = result.insertId;
		}
	
		// return a formatted response
		return formatres(res,result2,200);
	
	} catch (e){
		//return formatres(res, e, 500);
		return formatres(res, 'Uxexpected Error', 500);
	}
}


let postScan = async (res, body) => {

	// get the data
	let user_id = body.user_id;
	let emotion = body.emotion;

	// test the data (error trap)
	if (user_id == undefined || user_id == ""){
		return formatres(res,"The key user_id is missing or incorrect.",400);
	}
	if (emotion == undefined || emotion == ""){
		return formatres(res,"The key emotion is missing or incorrect.",400);
	}
	
	try{
		// work with the data
		let txtSQL = `INSERT INTO scan(user_id, emotion) VALUES 
		(?, ?)`;
		
		let [result] = await connection.execute(txtSQL,[user_id, emotion]);
		
		let scan_id = result.insertId;
		
		let txtSQL2 = `SELECT * FROM scan WHERE scan_id = ? `;
		
		let [result2] = await connection.execute(txtSQL2,[scan_id]);
		
		// return a formatted response
		return formatres(res, result2, 200); 
		
	} catch (e){
		//return formatres(res, e, 500);
		return formatres(res, 'Uxexpected Error', 500);
	}
}


let postUser = async (res, body) => {
	
	// get the data
	let firstname = body.firstname;
	let lastname = body.lastname;
	let admin_id = body.admin_id;
	
	// test the data (error trap
	if (firstname == undefined || firstname == ""){
		return formatres(res,"The key firstname is missing or incorrect.",400);
	}
	if (lastname == undefined || lastname == ""){
		return formatres(res,"The key lastname is missing or incorrect.",400);
	}
	
	if (admin_id == undefined || admin_id == ""){
		return formatres(res,"The key admin_id is missing or incorrect.",400);
	}
	
	try{
		firstname = firstname.trim()
		lastname = lastname.trim()
		
		let username = firstname[0].toLowerCase() + lastname.toLowerCase();
		let duplicate = true;
		
		while (duplicate) {
			let txtSQL00 = `SELECT username FROM
							(SELECT username FROM users
							UNION ALL
							SELECT username FROM admin)
							AS combo
							WHERE username = ?`;
			let [double] = await connection.execute(txtSQL00,[username]);
			
			if(double.length > 0){
				console.log("duplicate");
				let double_username = double[0]['username'];
				let lastChar = double_username[double_username.length - 1];
				
				if(isNaN(lastChar)){
					username += 1;
					console.log('Add 1:  ' + username);
				} else {
					let lastCharNew = parseInt(lastChar) + 1;
					username = double_username.slice(0, -1) + lastCharNew;
					console.log("Increase one : " + username);
				}
			} else{
				duplicate = false;
			}
		}
	
		// Returns a random integer from 1 to 50:
		let password_id = Math.floor(Math.random() * 50) + 1;
		
		let txtSQL0 = `SELECT word FROM password WHERE password_id = ?`;
		let [word] = await connection.execute(txtSQL0,[password_id]);
		
		// Returns a random integer from 0 to 1000:
		let number = Math.floor(Math.random() * 1001);
		
		let password = word[0]["word"] + number;
		
		// work with the data
		let txtSQL = `INSERT INTO users (firstname, lastname, username, password, admin_id) VALUES 
		(?, ?, ?, ?, ?)`;
		
		let [result] = await connection.execute(txtSQL,[firstname, lastname, username, password, admin_id]);
		
		let user_id = result.insertId;
		
		let txtSQL2 = `SELECT * FROM users WHERE user_id = ? `;
		
		let [result2] = await connection.execute(txtSQL2,[user_id]);
		
		// return a formatted response
		return formatres(res, result2, 200);
	} catch (e){
		//return formatres(res, e, 500);
		return formatres(res, 'Uxexpected Error', 500);
	}
}


let getAuth = async (res,query) => {

	// get the expected variable
	let username = query.username;
	let password = query.password;
	
	//error trap
	if (username == undefined || username == "" ){
		return formatres(res,"The key username is missing or incorrect.",400);
	}
	if (password == undefined || password == "" ){
		return formatres(res,"The key password is missing or incorrect.",400);
	}
	
	try{
		//work and return the result
		let txtSQL = `SELECT user_id, firstname, lastname, username, admin_id, datetime 
					FROM users WHERE username = ? AND password = ? `;
			
		let [result] = await connection.execute(txtSQL,[username, password]);
		
		let txtSQL2 = `SELECT admin_id, firstname, lastname, username, email, datetime 
						FROM admin WHERE username = ? AND password = ? `;
		
		let [result2] = await connection.execute(txtSQL2,[username, password]);
		
		let result3;
		
		if(result.length > 0) {
			result3 = result;
			console.log('users');
		}
		
		if(result2.length > 0) {
			result3 = result2;
			console.log('admin')
		}
		
		return formatres(res,result3,200);
	} catch (e){
		//return formatres(res, e, 500);
		return formatres(res, 'Uxexpected Error', 500);
	}
}


// do not delete this handy little supporting function
let formatres = async (res, output, statusCode) => {
	
	// kill the global database connection
	if (connection != undefined &&  
		typeof(connection)=='object' &&  
		typeof(connection.end())=='object'  ){
		await connection.end();
	}

	res.statusCode = statusCode;
	res.body = JSON.stringify(output);
	return res;	
}

// do not delete this handy little supportng function
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

// My Routing Function **********************************

let myRoutingFunction = (res,method,path,query,body) => {

	// conditional statements go here.
	// look at the path and method and return the output from the 
	// correct supporting function.

	// Simple GET request with no features specified results
	// in a list of features / instructions
	if (method == "GET" && path == ""){
		return formatres(res, features, 200);
	}
	
	// working on feature 9
	if (method == "GET" && path == "scan"){
		return getScan(res,query);
	}
	
	// working on feature 8
	if (method == "GET" && path == "allstat"){
		return getAllStat(res,query);
	}
	
	// working on feature 7
	if (method == "GET" && path == "userstat"){
		return getUserStat(res,query);
	}
	
	// working on feature 6
	if (method == "DELETE" && path == "users"){
		return deleteUser(res,body);
	}
	
	// working on feature 5
	if (method == "GET" && path == "users"){
		return getUser(res,query);
	}
	
	// working on feature 4
	if (method == "POST" && path == "admin"){
		return postAdmin(res,body);
	}
	
	// working on feature 3
	if (method == "POST" && path == "scan"){
		return postScan(res,body);
	}
	
	// working on feature 2
	if (method == "POST" && path == "users"){
		return postUser(res,body);
	}
	
	// working on feature 1
	if (method == "GET" && path == "auth"){
		return getAuth(res,query);
	}
	
	return(res);
}


// HTTP event handler ****************************************

// Students should not have to change the code here.
// Students should be able to read and understand the code here.

exports.handler = async (request) => {

	connection = await mysql.createConnection(dboptions);	

	// identify the method (it will be a string)
	let method = request["httpMethod"];
	
	// identify the path (it will also be a string)
	let fullpath = request["path"];
	
	// we clean the full path up a little bit
	if (fullpath == undefined || fullpath == null){ fullpath = ""};
	let pathitems = fullpath.split("/");
	let path = pathitems[2];
	if (path == undefined || path == null){ path = ""};
	
	// identify the querystring ( we will convert it to 
	//   a JSON object named query)
	let query = request["queryStringParameters"];
	if (query == undefined || query == null){ query={} };
	
	// identify the body (we will convert it to 
	//   a JSON object named body)
	let body = qs.parse(request["body"]);
	if (body == undefined || body == null){ body={} };

	// Create the default response object that will include 
	// the status code, the headers needed by CORS, and
	// the string to be returned formatted as a JSON data structure.
    let res = {
        'statusCode': 400,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true  
        },
        'body': JSON.stringify("Feature not found."),
    };

	// run all the parameters through my routing function
	// and return the result
	return myRoutingFunction(res,method,path,query,body);
    
    //*** this is a good place to test one supporting function at a time
    //body={"username":"fred","password":"123456","email":"freddy@test.com"};
    //return postUser(res,body);
    
    //body={"firstname":"Rose", "lastname":"Park", "admin_id": 1};
    //return postUser(res,body);
    
    //body={"user_id":"6","emotion":"Happy"};
    //return postScan(res,body);
    
    //body={"firstname":"Alex", "lastname":"Smith", "username":"asmith", "password":"scary395", "email":"alex@gmail.com"};
    //return postAdmin(res,body);
    
    //query={"username":"jkim", "password":"bp2024"};
    //return getAuth(res,query);
    
	//query={"username":"lli", "password":"sad123"};
    //return getAuth(res,query);
	
	//query={"admin_id":"2"};
    //return getUser(res,query);
    
    //query={"admin_id":"2", user_id:"8"};
    //return getUserStat(res,query);
    
	//query={"admin_id":"299", user_id:"899"};
    //return getUserStat(res,query);
    
    //query={"admin_id":"2"};
    //return getAllStat(res,query);
	
	//query={"user_id":"1"};
    //return getScan(res,query);    
    
    
};