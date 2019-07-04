//require modules for API
const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
var fs = require('fs');
var path= require('path')
var cors = require('cors');
var debug=process.argv[2];

//require modules for tedious coonection
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES; //for different datatypes in tedious

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
require('dotenv').config();

function detaillog(message)
{
	if(debug=="true")
		fs.appendFile(path.join(process.env.file),JSON.stringify(message)+" at time: "+Date()+"\n",function(err){if(err) console.log(err)});	//log success in file
}
function log(message)
{
	fs.appendFile(path.join(process.env.file),message+" at time: "+Date()+"\n",function(err){if(err) console.log(err)});	//log success in file
}


// Create connection to database
var config = {
  userName: 'admin_opc', 
  password: 'Qwerty@123', 
  server: 'opcclient.database.windows.net',
  options: {
      database: 'opcclient',
	  encrypt:true,
	  rowCollectionOnRequestCompletion: true
  }
}
//Plugging connection through tedious
var connection = new Connection(config);

// To connect and execute queries if connection goes through
connection.on('connect', function(err) {
	if (err)
	{
		log(err);
	}
	else
	{
		log('Successfully Connected');
	}
});

/*--------------------------------------------------SENSOR API------------------------------------------------------*/
//Select sensor details
router.get('/sensors', function (req, res) {
   function executeSelectStatement()
   {
		try{	   
				request = new Request("Select * from SensorDetails", function(err, rowCount, rows) {  
				if (err)
				{ 
					error=true;
				}
				else 
				{
					detaillog(rowCount + ' row(s) returned');
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
					//rowObject1=JSON.stringify(rowObject[i]);
					detaillog(rowObject);
					jsonArray.push(rowObject);	
				}
					 
					
				});
				
				request.on('requestCompleted', function () {
				if(error)
				{
					fs.appendFile(path.join('\API.json'),"Something Wrong with the request"+" " +Date()+"\n",
					function(err)
					{
						if(err) console.log(err);
						else
						res.status(500).json({"message":"Some error happened ! Try Again"});
					});	
				
				}
				else
				{
					fs.appendFile(path.join('\API.json'),"Successfully retreived data"+" " +Date()+"\n",function(err){if(err) console.log(err);
					else res.send(jsonArray); });
					
				}      		
    			
				});		
			
					//Executing Sql Statement request with connection
					connection.execSql(request);
			}
		catch(err)
		{
			fs.appendFile(path.join('\API.json'),"Something Wrong with the request"+" " +Date()+"\n",
			function(err)
			{
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


//Add sensor details
router.post('/addsensors', function (req, res){	
	function executeInsertStatement()
	{
		try{	
			//getting values from UI
			var sensorName=req.body.sensorName;
			var sensorDescription=req.body.sensorDescription;
			var rId=req.body.rId;
			var highTh_Temp=req.body.highTh_Temp;
			var lowTh_Temp=req.body.lowTh_Temp;
			var highTh_Rh=req.body.highTh_Rh;
			var lowTh_Rh=req.body.lowTh_Rh;
			var highTh_Grain=req.body.highTh_Grain;
			var lowTh_Grain=req.body.lowTh_Grain;
			var testMode=req.body.testMode;
			request = new Request("INSERT INTO SensorDetails (sensorName,sensorDescription,rId,highTh_Temp,lowTh_Temp,highTh_Rh,lowTh_Rh,highTh_Grain,lowTh_Grain,testMode) VALUES ('"+sensorName+"','"+sensorDescription+"','"+rId+"','"+highTh_Temp+"','"+lowTh_Temp+"','"+highTh_Rh+"','"+lowTh_Rh+"','"+highTh_Grain+"','"+lowTh_Grain+"','"+testMode+"');", function(err) {  
			if (err)		
			{
			 error=true;
			}  
			});         
			request.on('requestCompleted', function() 
			{ 
				if(error)
				{
					fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
					function(err)
					{
						if(err) console.log(err);
						else
						res.status(500).json({"message":"Some error happened ! Try Again"});
					});
				}
				else
				{
					fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
					function(err)
					{
						if(err) console.log(err);
						else
						res.status(201).json({"message" :"New Sensor Details Inserted"});
					});
				   
				}              
            }); 
			//Executing Sql Statement request with connection			
			connection.execSql(request);
		}
		catch(err)
		{
			fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
			function(err)
			{
				if(err) console.log(err);
				else
				res.status(500).json({"message":"Some error happened ! Try Again"});
			});
		}
	} 
var error=false; 
executeInsertStatement();	
});


//Update sensor details
router.put('/sensorUpdate/:sensorId', function (req, res){	
	function executeUpdateStatement()
	{ 
		var iD=parseInt(req.params.sensorId);
		try{
			var highTh_Temp=req.body.highTh_Temp;
			var lowTh_Temp=req.body.lowTh_Temp;
			var highTh_Rh=req.body.highTh_Rh;
			var lowTh_Rh=req.body.lowTh_Rh;
			var highTh_Grain=req.body.highTh_Grain;
			var lowTh_Grain=req.body.lowTh_Grain;
			var testMode=req.body.testMode;

			request = new Request("UPDATE SensorDetails SET highTh_Temp=' "+highTh_Temp+" ', lowTh_Temp='"+lowTh_Temp+"' , highTh_Rh='"+highTh_Rh+"', lowTh_Rh='"+ lowTh_Rh +"', highTh_Grain= '"+highTh_Grain+"', lowTh_Grain=' "+ lowTh_Grain +" ', testMode=' "+ testMode +" ' WHERE sensorId=' "+iD+"' ;", 
			function(err) 
			{  
				if (err)
				{ 
					error=true;
				}  
			});  
        
			request.on('requestCompleted', function() {
			if(error)
			{
				fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err)
				{
					if(err) console.log(err);
					else
					res.status(500).json({"message":"Some error happened ! Try Again"});
				});
			}
			else
			{
				fs.appendFile(path.join('\API.json'),"Sensor Successfully Updated"+" " +Date()+"\n",
				function(err)
				{
					if(err) console.log(err);
					else res.status(201).json({"message" :" Sensor Details Updated"});
				});
				 
			}      		
            
            });	
			//Executing Sql Statement request with connection				
			connection.execSql(request); 
		}
		catch(err)
		{
			fs.appendFile(path.join('\API.json'),"Something Wrong with the request"+" " +Date()+"\n",
			function(err)
			{
				if(err) console.log(err);
				else
				res.status(500).json({"message":"Some error happened ! Try Again"});
			});
		}		
	}
var error=false;	
executeUpdateStatement();
});	

//Count the number of sensors for a particular room
router.get('/sensorPerRoom', function (req, res) {
   function executeSelectStatement()
   {
		try{	   
			request = new Request("Select rs.*, r.roomName  from (Select s.rId, count(s.sensorId) as sensorCount from SensorDetails as s  group by s.rId) as rs INNER JOIN  RoomDetails as r  ON r.roomId=rs.rId", function(err, rowCount, rows) {  
			if (err)
			{ 
				error=true;
			}
			else
			{
				detaillog(rowCount + ' row(s) returned');
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
				detaillog(rowObject);
				jsonArray.push(rowObject);	
			}
					 
			});
				
			request.on('requestCompleted', function () {
			if(error)
			{
				fs.appendFile(path.join('\API.json'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err)
				{
					if(err) console.log(err);
					else
					res.status(500).json({"message":"Some error happened ! Try Again"});
				});	
				
			}
			else
			{
				fs.appendFile(path.join('\API.json'),"Successfully retreived data"+" " +Date()+"\n",function(err){if(err) console.log(err);
				else res.send(jsonArray); });
			}      		
    			
			});		
			
			//Executing Sql Statement request with connection
			connection.execSql(request);
		}
		catch(err)
		{
			fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
			function(err)
			{
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


/*--------------------------------------------------ROOM API------------------------------------------------------*/
//Select room details
router.get('/rooms', function (req, res) {
	function executeSelectStatement() {
		try{	   
			request = new Request("Select * from RoomDetails", function(err, rowCount, rows) { 
			if (err) 
			{ 
				error=true;
			}
			else
			{
				detaillog(rowCount + ' row(s) returned');
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
				detaillog(rowObject);
				jsonArray.push(rowObject);	
			}
					 
					
			});
				
			request.on('requestCompleted', function () {
			if(error)
			{
				fs.appendFile(path.join('\API.json'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err)
				{
					if(err) console.log(err);
					else
					res.status(500).json({"message":"Some error happened ! Try Again"});
				});	
			
			}
			else
			{
				fs.appendFile(path.join('\API.json'),"Successfully retreived data"+" " +Date()+"\n",function(err){if(err) console.log(err);
				else res.send(jsonArray); });
				
			}      		
    			
			});		
			
			//Executing Sql Statement request with connection
			connection.execSql(request);
		}
		catch(err)
		{
			fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
			function(err)
			{
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

//Add room details

router.post('/addrooms', function (req, res){	
	function executeInsertStatement() 
	{
		try{	
			var roomName=req.body.roomName;
			var roomDescription=req.body.roomDescription;
			request = new Request("INSERT INTO RoomDetails (roomName,roomDescription) VALUES ('"+roomName+"','"+roomDescription+"');", function(err) {  
				if (err)
				{
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
				function(err)
				{
					if(err) console.log(err);
					else
					res.status(201).json({"message" :"New Room Details Inserted"});
				});
					   
			}              
			});    
			//Executing Sql Statement request with connection
			connection.execSql(request);
		}		
		catch(err)
		{
			fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
			function(err)
			{
				if(err) console.log(err);
				else
				res.status(500).json({"message":"Some error happened ! Try Again"});
			});
		}
	} 
var error=false; 
executeInsertStatement();	
});


/*--------------------------------------------------ALARM API------------------------------------------------------*/
//Select alarm details
router.get('/alarms', function (req, res) {
	function executeSelectStatement() 
	{
		try{	   
			request = new Request("Select * from AlarmDetails order by alarmTimeGeneration desc", function(err, rowCount, rows) {  
			if (err)
			{ 
				error=true;
			}
			else 
			{
				detaillog(rowCount + ' row(s) returned');
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
				detaillog(rowObject);
				jsonArray.push(rowObject);	
			}
					 
					
			});
				
			request.on('requestCompleted', function ()
			{
				if(error)
				{
					fs.appendFile(path.join('\API.json'),"Something Wrong with the request"+" " +Date()+"\n",
					function(err)
					{
						if(err) console.log(err);
						else
						res.status(500).json({"message":"Some error happened ! Try Again"});
					});	
				
				}
				else
				{
					fs.appendFile(path.join('\API.json'),"Successfully retreived data"+" " +Date()+"\n",function(err){if(err) console.log(err);
					else res.send(jsonArray); });
				
				}      		
    			
			});		
			
			//Executing Sql Statement request with connection
			 connection.execSql(request);
		}
		catch(err)
		{
			fs.appendFile(path.join('\Logging_Error.log'),"Something Wrong with the request"+" " +Date()+"\n",
			function(err)
			{
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


/*--------------------------------------------------RANDOMLY GENERATED ROOM SENSOR DATA API------------------------------------------------------*/
//Select randomly generated data details
router.get('/THG_Info', function (req, res) {
	function executeSelectStatement() 
	{
		try{	   
			request = new Request("Select * from Room_THG_Info", function(err, rowCount, rows) {  
			if (err) 
			{ 
				error=true;
			}
			else 
			{
				detaillog(rowCount + ' row(s) returned');
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
				detaillog(rowObject);
				jsonArray.push(rowObject);	
			}
					 
					
			});
				
			request.on('requestCompleted', function ()
			{
				if(error)
				{
					fs.appendFile(path.join('\API.json'),"Something Wrong with the request"+" " +Date()+"\n",
					function(err)
					{
						if(err) console.log(err);
						else
						res.status(500).json({"message":"Some error happened ! Try Again"});
					});	
				
				}
				else
				{
					fs.appendFile(path.join('\API.json'),"Successfully retreived data"+" " +Date()+"\n",function(err){if(err) console.log(err);
					else res.send(jsonArray); });
				
				}      		
    			
			});		
			
			//Executing Sql Statement request with connection
			 connection.execSql(request);
		}
		catch(err)
		{
			fs.appendFile(path.join('\API.json'),"Something Wrong with the request"+" " +Date()+"\n",
			function(err)
			{
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


/*--------------------------------------------------FETCH LAST ONE HOUR DATA API------------------------------------------------------*/
//Fetching Last one hour details
router.get('/hourData', function (req, res) {
	function executeSelectStatement() 
	{
		try{
			request = new Request('Select * from Room_THG_Info where THG_TS > DATEADD(hour, -1, GETUTCDATE())', function(err, rowCount, rows) {
			if (err)
			{ 
				error=true;
			}
			else 
			{
				detaillog(rowCount + ' row(s) returned');
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

			request.on('requestCompleted', function ()
			{
				if(error)
				{
					fs.appendFile(path.join('\API.json'),"Something Wrong with the request"+" " +Date()+"\n",
					function(err){
					if(err) console.log(err);
					else
					res.status(500).json({"message":"Some error happened ! Try Again"});
				}); 

			}
			else
			{
				fs.appendFile(path.join('\API.json'),"Successfully retreived data"+" " +Date()+"\n",function(err){if(err) console.log(err);
				else res.send(jsonArray); });
			}           
			});       

			//Executing Sql Statement request with connection
			connection.execSql(request);
		}
		catch(err)
		{
			fs.appendFile(path.join('\API.json'),"Something Wrong with the request+" +Date()+"\n",
			function(err)
			{
				if(err) console.log(err);
				else
				res.status(500).json({message:"Some error happened ! Try Again"});
			}); 
		}

	}
var error=false;
var jsonArray = [];
executeSelectStatement();

});






app.use('/', router);
app.listen(process.env.port || 8000);
console.log('Running at Port 8080');