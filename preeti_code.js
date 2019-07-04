/*------------STEP 1: Setting Connection to Sql database using Tedious module------------------------*/


//require modules for api
const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
var fs = require('fs');
var path= require('path')
var cors = require('cors');

//require modules for tedious coonection
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES; //for different datatypes in tedious

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

// Create connection to database
/*var config = {
  userName: 'admin_opc', 
  password: 'Qwerty@123', 
  server: 'opcclient.database.windows.net',
  options: {
      database: 'opcclient',
	  encrypt:true,
	  rowCollectionOnRequestCompletion: true
  }
}*/
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
	password="d6F3Efeq"
	
configPath = './config.json';
var parsed = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));

//decrypt function
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  return dec;
}

// Create connection to database
var config = {
		userName: decrypt(parsed.userName), 
		password: decrypt(parsed.password),
		server: decrypt(parsed.server),
		options: {
			database: decrypt(parsed.options.database),
			encrypt:true
		}
	}
//Plugging connection through tedious
var connection = new Connection(config);

// To connect and execute queries if connection goes through
connection.on('connect', function(err) {
if (err){
fs.appendFile(path.join('\Logging_Error.log'),err+" " +Date()+"\n",function(err){if(err) console.log(err);}); 
}
else {
fs.appendFile(path.join('\Logging_Error.log'),"Successfully connected at "+Date()+"\n",
function(err){
	if(err) 
		console.log(err);
		});
}
});

var array1=[];
var jsonObj;

/*---------------------------------------------STEP 2: Executing Sql Query------------------------*/

/*--------------------------------------------------PATIENT API------------------------------------------------------*/
//Select patient details
router.get('/patient/details', function (req, res) {
   function executeSelectStatement() {
		try{	   
        request = new Request("Select p.id, p.age, p.contact_no, p.email, p.name, d.id as disease_id, p.Comments as comment  from PATIENT p  INNER JOIN DISEASE d ON p.disease_id=d.id", function(err, rowCount, rows) {  
        if (err) { 
		error=true;
			}
		else {
            console.log(rowCount + ' row(s) returned');
            }          			 
		//Now parse the data from each of the row and populate the array.	
			for(var i=0; i < rowCount; i++)
				{
				var rowObject = {};
				var singleRowData = rows[i];
				for(var j =0; j < singleRowData.length; j++)
						{
							var tempColName = singleRowData[j].metadata.colName;
							var tempColData = singleRowData[j].value;
							rowObject[tempColName] = tempColData;
						
				}
				console.log(rowObject);
				jsonArray.push(rowObject);	
				}
					 
					
		});
				
	   request.on('requestCompleted', function () {
		if(error)
			{
				fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err){
					if(err) console.log(err);
						else
					res.status(500).json({"message":"Some error happened ! Try Again"});
						});	
				
			}
			else
			{
				fs.appendFile(path.join('\Logging_Error.log'),"Successfully retreived data"+" " +Date()+"\n",function(err){if(err) console.log(err);
				else res.send(jsonArray); });
				
			}      		
    			
		  });		
			
    //Executing Sql Statement request with connection
     connection.execSql(request);
   }catch(err)
	{
	fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err){
					if(err) console.log(err);
						else
					res.status(500).json({"message":"Some error happened ! Try Again"});
						});	
	}	
   }
	var error=false;	  
	var jsonArray = [];
	executeSelectStatement();
      
});	

//Select patient details by id
router.get('/patient/byid/:id', function (req, res) {
   function executeSelectStatement() {	   
	var iD=parseInt(req.params.id);	     	 
        request = new Request("Select * from PATIENT  WHERE id= ' "+ iD + " ' FOR JSON AUTO ; ", function(err, rowCount, rows) {  
        if (err) { 
		error=true;
			}
		else {
            console.log(rowCount + ' row(s) returned');
            }			
        }); 
	try{		
        var result ="";  
        request.on('row', function(columns) {  
            columns.forEach(function(column) {  
              if (column.value === null) {  
                console.log('NULL');  
              } else {  
                result+= column.value + " "; 
				
              }  
            });			
		    array1=result;
			jsonObj= JSON.parse(array1);
			console.log(array1);
            result ="";  
        });
			
		request.on('requestCompleted', function () {
			if(error)
			{
				fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err){
					if(err) console.log(err);
						else
					res.status(500).json({"message":"Some error happened ! Try Again"});
						});	
			}
			else
			{	
			fs.appendFile(path.join('\Logging_Error.log'),"Successfully retreived data"+" " +Date()+"\n",
			function(err){
				if(err) console.log(err);
				else
				res.send(jsonObj);
			});		
					
			}  		
               
			});			
        //Executing Sql Statement request with connection
        connection.execSql(request); 
	}catch(err)
	{
		fs.appendFile(path.join('\Logging_Error.log'),err+" " +Date()+"\n",
				function(err){
					if(err) console.log(err);
						else
					res.status(500).json({"message":"Some error happened ! Try Again"});	
				});		
	  }
   }	  
	var error=false;	  
	executeSelectStatement();
     
});	
 
//insert patient details
router.post('/patient/addnew', function (req, res){	
function executeInsertStatement() {
try{	
var age=req.body.age;
var contact_no=req.body.contact_no;
var email=req.body.email;
var name=req.body.name;
var disease_id=req.body.disease_id;
var Comments=req.body.comment;

     request = new Request("INSERT INTO PATIENT (age, contact_no, email, name,disease_id, Comments) VALUES ('"+age+"','"+contact_no+"','"+email+"','"+name+"','"+disease_id+"','"+Comments+"');", 
		function(err) {  
         if (err) {
			 error=true;
			}  
        });  
         
        request.on('requestCompleted', function() {
			if(error)
			{
				fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err){
					if(err) console.log(err);
						else
					res.status(500).json({"message":"Some error happened ! Try Again"});
				});
			}
			else
			{
			fs.appendFile(path.join('\Logging_Error.log'),"Patient details Successfully Inserted"+" " +Date()+"\n",function(err){
				if(err)
					console.log(err); 
				else  
					res.status(201).json({"message" :"New Patient Details Inserted"});
				});
			
			}      		
              
            });
        		
       connection.execSql(request);
	}catch(err)
	{
		fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err){
					if(err) console.log(err);
						else
					res.status(500).json({"message":"Some error happened ! Try Again"});
				});
	}		
  }
var error=false;	
executeInsertStatement();	
});

//update patient details
router.put('/patient/update/:id', function (req, res){	
function executeUpdateStatement() { 
var iD=parseInt(req.params.id);
try{
	var age=req.body.age;
	var contact_no=req.body.contact_no;
	var email=req.body.email;
	var name=req.body.name;
	var disease_id=req.body.disease_id;
	var Comments=req.body.comment;

  request = new Request("UPDATE PATIENT SET age=' "+age+" ', contact_no='"+contact_no+"' , email='"+email+"', name='"+ name +"', disease_id= '"+disease_id+"', Comments=' "+ Comments +" ' WHERE id=' "+iD+"' ;", 
		function(err) {  
         if (err) { 
		 error=true;
			}  
        });  
        
        request.on('requestCompleted', function() {
			if(error)
			{
				fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err){
					if(err) console.log(err);
						else
					res.status(500).json({"message":"Some error happened ! Try Again"});
				});
			}
			else
			{
				fs.appendFile(path.join('\Logging_Error.log'),"Patient Successfully Updated"+" " +Date()+"\n",function(err){
					if(err) console.log(err);
					else res.status(201).json({"message" :" Patient Details Updated"});
					});
				 
			}      		
            
            });		
        connection.execSql(request); 
	}catch(err)
	{
		fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err){
					if(err) console.log(err);
						else
					res.status(500).json({"message":"Some error happened ! Try Again"});
				});
	}		
}
	var error=false;	
	executeUpdateStatement();
});	

//deleting a patient
router.delete('/patient/delete/:id', function (req, res){
function executeDeleteStatement() {
try{	
var iD = parseInt(req.params.id);
        request = new Request("DELETE FROM PATIENT WHERE id= ' "+ iD + " ';",
		function(err){  
         if (err) {
			 error=true;
			}  
        });  
                
        request.on('requestCompleted', function() { 
		if(error)
			{
				fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err){
					if(err) console.log(err);
						else
					res.status(500).json({"message":"Some error happened ! Try Again"});
				});
			}
			else
			{
				fs.appendFile(path.join('\Logging_Error.log'),"Patient Deleting"+" " +Date()+"\n",function(err){
					if(err) console.log(err);
					else res.status(204).json({"message" :" Patient Details Deleted"});
					});
				 
			}      				
              
            }); 
             
        connection.execSql(request);  
}
catch(err)
{
	fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err){
					if(err) console.log(err);
						else
					res.status(500).json({"message":"Some error happened ! Try Again"});
				});
}
}
    var error=false;	
	executeDeleteStatement();
});	
/*--------------------------------------------------DISEASE API------------------------------------------------------*/
//Select disease details
router.get('/disease/details', function (req, res) {
   function executeSelectStatement() {  	 
        request = new Request("Select * from DISEASE FOR JSON AUTO", function(err, rowCount, rows) {  
        if (err) { 
		error=true;
			}
		else {
            console.log(rowCount + ' row(s) returned');
            }			
        });
	try{		
        var result ="";  
        request.on('row', function(columns) {  
            columns.forEach(function(column) {  
              if (column.value === null) {  
                console.log('NULL');  
              } else {  
                result+= column.value + " "; 
				
              }  
            });			
		    array1=result;
			jsonObj= JSON.parse(array1);
			console.log(array1);
            result ="";  
        }); 
	
		request.on('requestCompleted', function () {
			if(error)
			{
				fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err){
					if(err) console.log(err);
						else
					res.status(500).json({"message":"Some error happened ! Try Again"});
				});
			}
			else
			{
				fs.appendFile(path.join('\Logging_Error.log'),"Successfully retreived data"+" " +Date()+"\n",function(err){
					if(err) console.log(err);
					else {
						res.send(jsonObj);
						jsonObj = [];
					}
					});	
				
					
			}        
			});			
    //Executing Sql Statement request with connection
        connection.execSql(request);
	}catch(err)
	  {
		  fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err){
					if(err) console.log(err);
						else
					res.status(500).json({"message":"Some error happened ! Try Again"});
				});
	  }	
 }
	var error=false;	  
	executeSelectStatement();
      
});	

//Select disease details by id
router.get('/disease/byid/:id', function (req, res) {
   function executeSelectStatement() {	   
	var iD=parseInt(req.params.id);  
        request = new Request("Select * from DISEASE  WHERE id= ' "+ iD + " ' FOR JSON AUTO ; ", function(err, rowCount, rows) {  
        if (err) {
			errro=true;
			}
		else {
            console.log(rowCount + ' row(s) returned');
            }			
        }); 
	try{		
        var result ="";  
        request.on('row', function(columns) {  
            columns.forEach(function(column) {  
              if (column.value === null) {  
                console.log('NULL');  
              } else {  
                result+= column.value + " "; 
				
              }  
            });			
		    array1=result;
			jsonObj= JSON.parse(array1);
			console.log(array1);
            result ="";  
        });
	
		request.on('requestCompleted', function () {
			if(error)
			{
				fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err){
					if(err) console.log(err);
						else
					res.status(500).json({"message":"Some error happened ! Try Again"});
				});
			}
			else
			{
			fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",function(err){if(err) console.log(err);
				else res.send(jsonObj);});		
			
			 
			}      		
               
			});		
        //Executing Sql Statement request with connection
        connection.execSql(request); 
	}catch(err)
		{
		fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err){
					if(err) console.log(err);
						else
					res.status(500).json({"message":"Some error happened ! Try Again"});
				});
		}
 }
	var error=false;	  
	executeSelectStatement();
     
});

//insert disease details
router.post('/disease/addnew', function (req, res){	
function executeInsertStatement() {
try{	
var name=req.body.name;
    request = new Request("INSERT INTO DISEASE (name) VALUES ('"+name+"');", function(err) {  
         if (err) {
			 error=true;
			}  
        });         
    request.on('requestCompleted', function() { 
	if(error)
			{
				fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err){
					if(err) console.log(err);
						else
					res.status(500).json({"message":"Some error happened ! Try Again"});
				});
			}
			else
			{
				fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err){
					if(err) console.log(err);
						else
					res.status(201).json({"message" :"New Disease Details Inserted"});
				});
			   
			}              
            });    
connection.execSql(request);
}catch(err)
{
fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err){
					if(err) console.log(err);
						else
					res.status(500).json({"message":"Some error happened ! Try Again"});
				});
}
} 
var error=false; 
executeInsertStatement();	
});

//update disease details
router.put('/disease/update/:id', function (req, res){	
function executeUpdateStatement() {
var iD=parseInt(req.params.id);
try{
var name=req.body.name;
    request = new Request("UPDATE DISEASE SET name='"+ name +"' WHERE id=' "+iD+"' ;", function(err) {  
         if (err) { 
		 errro=true;
			}  
        });         
    request.on('requestCompleted', function() {  
	if(error)
			{
				fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err){
					if(err) console.log(err);
						else
					res.status(500).json({"message":"Some error happened ! Try Again"});
				});
			}
			else
			{
				fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err){
					if(err) console.log(err);
						else
					 res.status(201).json({"message" :"Disease Details Updated"});
				});				
			  
			}      		
              
            });        
		
    connection.execSql(request); 
}catch(err)
{
fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err){
					if(err) console.log(err);
						else
					res.status(500).json({"message":"Some error happened ! Try Again"});
				});				
}	
}
var error=false;  
executeUpdateStatement();
});	

//deleting a disease
router.delete('/disease/delete/:id', function (req, res){	
function executeDeleteStatement() {
try{	
var iD = parseInt(req.params.id);
    request = new Request("DELETE FROM DISEASE WHERE id= ' "+ iD + " ';",
		function(err){  
         if (err) { 
		 error=true;
			}  
        });                  
    request.on('requestCompleted', function() {  
	if(error)
			{
				fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err){
					if(err) console.log(err);
						else
					res.status(500).json({"message":"Some error happened ! Try Again"});
						});	
			}
			else
			{
				fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err){
					if(err) console.log(err);
						else
					 res.status(201).json({"message" :"Disease Details Deleted"});
						});	
              
			}      		
              
        });             
 connection.execSql(request);
}catch(err)
	{
	fs.appendFile(path.join('\Logging_Error.log'),err+" " +Date()+"\n",
				function(err){
					if(err) console.log(err);
						else
					res.status(500).json({"message":"Some error happened ! Try Again"});
						});	
	}						
} 

var error=false;  
executeDeleteStatement();
});	

app.use('/', router);
app.listen(process.env.port || 3000);
console.log('Running at Port 3000');