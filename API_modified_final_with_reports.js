//require modules for API
const express = require('express');
const app = express();
require('dotenv').config();
const router = express.Router();
const bodyParser = require('body-parser');
var path= require('path');
var fs = require('fs');
var Excel = require('exceljs');
const PDFDocument = require('pdfkit');





var cors = require('cors');
var debug=process.argv[2];

//require modules for tedious coonection
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES; //for different datatypes in tedious

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

//console.log(debug);
function detaillog(message)
{
	if(debug=="true")
		fs.appendFile(path.join(process.env.file),JSON.stringify(message)+" at time: "+Date()+"\n",function(err){if(err) console.log(err)});	//log success in file
}
function log(message)
{
	fs.appendFile(path.join(process.env.file),message+" at time: "+Date()+"\n",function(err){if(err) console.log(err)});	//log success in file
}
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
var config ={
					authentication:
					{
						type:"default",
						options:
						{
							userName: decrypt(parsed.userName),
							password: decrypt(parsed.password)			
						}
					},
					server: decrypt(parsed.server),
					options: 
					{
						database: decrypt(parsed.options.database),
						encrypt:true
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
				});				
				//Now parse the data from each of the row and populate the array.	
				request.on('row', function(columns) {
					var row = {};
					columns.forEach(function(column) 
					{
						if (column.value === null) 
						{
							detaillog('NULL');
						} 
						else 
						{
							row[column.metadata.colName] = column.value;  
							//row column data corresponding to column value  
							
						}
					});
					jsonArray.push(row);
				});	
				request.on('requestCompleted', function () {
				if(error)
				{
					fs.appendFile(path.join('\API1.json'),"Something Wrong with the request"+" " +Date()+"\n",
					function(err)
					{
						if(err) console.log(err);
						else{
						res.status(500).json({"message":"Some error happened ! Try Again"});
						connection.close();
						reconnect();
						}
					});	
				
				}
				else
				{
					fs.appendFile(path.join('\API1.json'),"Successfully retreived data"+" " +Date()+"\n",function(err){if(err) console.log(err);
					else res.send(jsonArray); });
					
				}      		
    			
				});		
			
					//Executing Sql Statement request with connection
					connection.execSql(request);
			}
		catch(err)
		{
			fs.appendFile(path.join('\API1.json'),"Something Wrong with the request"+" " +Date()+"\n",
			function(err)
			{
				if(err) console.log(err);
				else
				{
					res.status(500).json({"message":"Some error happened ! Try Again"});
					connection.close();
					reconnect();
				}
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
					fs.appendFile(path.join('\API1.json'),"Something Wrong with the request"+" " +Date()+"\n",
					function(err)
					{
						if(err) console.log(err);
						else
						{
							res.status(500).json({"message":"Some error happened ! Try Again"});
							connection.close();
							reconnect();
						}
					});
				}
				else
				{
					fs.appendFile(path.join('\API1.json'),"Something Wrong with the request"+" " +Date()+"\n",
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
			fs.appendFile(path.join('\API1.json'),"Something Wrong with the request"+" " +Date()+"\n",
			function(err)
			{
				if(err) console.log(err);
				else{
				res.status(500).json({"message":"Some error happened ! Try Again"});
				connection.close();
				reconnect();
				}
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
				fs.appendFile(path.join('\API1.json'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err)
				{
					if(err) console.log(err);
					else
					{
						res.status(500).json({"message":"Some error happened ! Try Again"});
						connection.close();
						reconnect();
					}
				});
			}
			else
			{
				fs.appendFile(path.join('\API1.json'),"Sensor Successfully Updated"+" " +Date()+"\n",
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
			fs.appendFile(path.join('\API1.json'),"Something Wrong with the request"+" " +Date()+"\n",
			function(err)
			{
				if(err) console.log(err);
				else{
				res.status(500).json({"message":"Some error happened ! Try Again"});
				connection.close();
				reconnect();
				}
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
		console.log(err);
				error=true;
			}
			else
			{
				detaillog(rowCount + ' row(s) returned');
            }          			 
			//Now parse the data from each of the row and populate the array.	
			});
			request.on('row', function(columns) {
					var row = {};
					columns.forEach(function(column) 
					{
						if (column.value === null) 
						{
							detaillog('NULL');
						} 
						else 
						{
							row[column.metadata.colName] = column.value;  
							//row column data corresponding to column value  
							
						}
					});
					jsonArray.push(row);
			});			
				
			request.on('requestCompleted', function () {
			if(error)
			{
				fs.appendFile(path.join('\API1.json'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err)
				{
					if(err) console.log(err);
					else
					{
						res.status(500).json({"message":"Some error happened ! Try Again"});
						connection.close();
						reconnect();
					}
				});	
				
			}
			else
			{
				fs.appendFile(path.join('\API1.json'),"Successfully retreived data"+" " +Date()+"\n",function(err){if(err) console.log(err);
				else res.send(jsonArray); });
			}      		
    			
			});		
			
			//Executing Sql Statement request with connection
			connection.execSql(request);
		}
		catch(err)
		{
			fs.appendFile(path.join('\API1.json'),"Something Wrong with the request"+" " +Date()+"\n",
			function(err)
			{
				if(err) console.log(err);
				else{
				res.status(500).json({"message":"Some error happened ! Try Again"});
				connection.close();
				reconnect();
				}
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
				console.log(err);
				error=true;
			}
			else
			{
				//console.log(rowCount + ' row(s) returned');
				detaillog(rowCount + ' row(s) returned');
				
            }          			 
			//Now parse the data from each of the row and populate the array.
			});
			request.on('row', function(columns) {
					var row = {};
					columns.forEach(function(column) 
					{
						if (column.value === null) 
						{
							detaillog('NULL');
						} 
						else 
						{
							row[column.metadata.colName] = column.value;  
							//row column data corresponding to column value  
							
						}
					});
					jsonArray.push(row);
					//console.log(jsonArray);
			});					
				
			request.on('requestCompleted', function () {
			if(error)
			{
				console.log(error);
				
				fs.appendFile(path.join('\API1.json'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err)
				{
					if(err) console.log(err);
					else{
					res.status(500).json({"message":"Some error happened ! Try Again"});
					connection.close();
					reconnect();
					
					}
				});	
	
			}
			else
			{
				fs.appendFile(path.join('\API1.json'),"Successfully retreived data"+" " +Date()+"\n",function(err){
					if(err) console.log(err);
					else 
					{
					res.send(jsonArray);
					
					}
				});
				
			}      		
    			
			});		
			
			//Executing Sql Statement request with connection
			connection.execSql(request);
			
		}
		catch(err)
		{
			fs.appendFile(path.join('\API1.json'),"Something Wrong with the request in last catch"+" " +Date()+"\n",
			function(err)
			{
				if(err) console.log(err);
				else{
				res.status(500).json({"message":"Some error happened in last catch! Try Again"});
				connection.close();
				reconnect();
				}
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
				fs.appendFile(path.join('\API1.json'),"Something Wrong with the request"+" " +Date()+"\n",
				function(err){
					if(err) console.log(err);
					else
					{
						res.status(500).json({"message":"Some error happened ! Try Again"});
						connection.close();
						reconnect();
					}
				});
			}
			else
			{
				fs.appendFile(path.join('\API1.json'),"Something Wrong with the request"+" " +Date()+"\n",
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
			fs.appendFile(path.join('\API1.json'),"Something Wrong with the request"+" " +Date()+"\n",
			function(err)
			{
				if(err) console.log(err);
				else{
				res.status(500).json({"message":"Some error happened ! Try Again"});
				connection.close();
				reconnect();
				}
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
			});
			request.on('row', function(columns) {
					var row = {};
					columns.forEach(function(column) 
					{
						if (column.value === null) 
						{
							detaillog('NULL');
						} 
						else 
						{
							row[column.metadata.colName] = column.value;  
							//row column data corresponding to column value  
							
						}
					});
					jsonArray.push(row);
			});	
			request.on('requestCompleted', function ()
			{
				if(error)
				{
					fs.appendFile(path.join('\API1.json'),"Something Wrong with the request"+" " +Date()+"\n",
					function(err)
					{
						if(err) console.log(err);
						else
						{
							res.status(500).json({"message":"Some error happened ! Try Again"});
							connection.close();
							reconnect();
						}
					});	
				
				}
				else
				{
					fs.appendFile(path.join('\API1.json'),"Successfully retreived data"+" " +Date()+"\n",function(err){if(err) console.log(err);
					else res.send(jsonArray); });
				
				}      		
    			
			});		
			
			//Executing Sql Statement request with connection
			 connection.execSql(request);
		}
		catch(err)
		{
			fs.appendFile(path.join('\API1.json'),"Something Wrong with the request"+" " +Date()+"\n",
			function(err)
			{
				if(err) console.log(err);
				else{
				res.status(500).json({"message":"Some error happened ! Try Again"});
				connection.close();
				reconnect();
				}
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
			});
			request.on('row', function(columns) {
					var row = {};
					columns.forEach(function(column) 
					{
						if (column.value === null) 
						{
							detaillog('NULL');
						} 
						else 
						{
							row[column.metadata.colName] = column.value;  
							//row column data corresponding to column value  
							
						}
					});
					jsonArray.push(row);
			});	
				
			request.on('requestCompleted', function ()
			{
				if(error)
				{
					fs.appendFile(path.join('\API1.json'),"Something Wrong with the request"+" " +Date()+"\n",
					function(err)
					{
						if(err) console.log(err);
						else
						{
							res.status(500).json({"message":"Some error happened ! Try Again"});
							connection.close();
							reconnect();
						}
					});	
				
				}
				else
				{
					fs.appendFile(path.join('\API1.json'),"Successfully retreived data"+" " +Date()+"\n",function(err){if(err) console.log(err);
					else res.send(jsonArray); });
				
				}      		
    			
			});		
			
			//Executing Sql Statement request with connection
			 connection.execSql(request);
		}
		catch(err)
		{
			fs.appendFile(path.join('\API1.json'),"Something Wrong with the request"+" " +Date()+"\n",
			function(err)
			{
				if(err) console.log(err);
				else{
				res.status(500).json({"message":"Some error happened ! Try Again"});
				connection.close();
				reconnect();
				}
			});	
		}	
	}
var error=false;	  
var jsonArray = [];
executeSelectStatement();
      
});	


/*--------------------------------------------------FETCH LAST ONE HOUR DATA API------------------------------------------------------*/
//Fetching Last one hour details
router.get('/hourData/:id', function (req, res) {
	var RoomId=parseInt(req.params.id);
	function executeSelectStatement() 
	{
		try{
			
			//request = new Request('Select * from Room_THG_Info where THG_TS > DATEADD(hour, -1, GETUTCDATE())', function(err, rowCount, rows) {
			request = new Request("Select * from Room_THG_Info where s_infoId IN(select sensorId from SensorDetails where rId='"+RoomId+"') and THG_TS > DATEADD(hour, -30, GETUTCDATE()) ", function(err, rowCount, rows) {
			if (err)
			{ 
				error=true;
			}
			else 
			{
				detaillog(rowCount + ' row(s) returned');
			}

			//Now parse the data from each of the row and populate the array.
			});
			request.on('row', function(columns) {
					var row = {};
					columns.forEach(function(column) 
					{
						if (column.value === null) 
						{
							detaillog('NULL');
						} 
						else 
						{
							row[column.metadata.colName] = column.value;  
							//row column data corresponding to column value  
							
						}
					});
					jsonArray.push(row);
			});	

			request.on('requestCompleted', function ()
			{
				if(error)
				{
					fs.appendFile(path.join('\API1.json'),"Something Wrong with the request"+" " +Date()+"\n",
					function(err){
					if(err) console.log(err);
					else
					{
						res.status(500).json({"message":"Some error happened ! Try Again"});
						connection.close();
						reconnect();
					}
				}); 

			}
			else
			{
				fs.appendFile(path.join('\API1.json'),"Successfully retreived data"+" " +Date()+"\n",function(err){if(err) console.log(err);
				else res.send(jsonArray); });
			}           
			});       

			//Executing Sql Statement request with connection
			connection.execSql(request);
		}
		catch(err)
		{
			fs.appendFile(path.join('\API1.json'),"Something Wrong with the request+" +Date()+"\n",
			function(err)
			{
				if(err) console.log(err);
				else{
				res.status(500).json({"message":"Some error happened ! Try Again"});
				connection.close();
				reconnect();
				}
			}); 
		}

	}
var error=false;
var jsonArray = [];
executeSelectStatement();

});

router.post('/reportexcel',(req, res) =>
{
	//connect to databasese
	var connection = new Connection(config);
	
	//function to generate report
	function report() 
	{		
		try
		{
			//accept parameters from user
			var sensorid=req.body.sid;			
			var to=req.body.toDate;
			var from=req.body.fdate;
			
			detaillog(sensorid);
			detaillog(to);
			detaillog(from);

			//build query to convert array of sensorids 
			var sens="(";			
			for (var i=0; i<sensorid.length;i++)
			{
				sens=sens+sensorid[i];
				if(i<(sensorid.length)-1)
				{
					sens=sens+",";
				}
			}
			sens=sens+")";
			detaillog(sens);
			
			var workbook = new Excel.Workbook(); 	//create workbook 
			var sheet = workbook.addWorksheet("Sales", { columns: true });	//create worksheet
			log('Workbook created');
			try
			{
				res.setHeader('Content-Type', 'application/application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');	//set MIME type
				res.setHeader("Content-Disposition", "attachment; filename=" + "Data.xlsx");
				var filePath ='report.xlsx';		//specify file name
				detaillog("Filepath: "+filePath);
				sheet.columns = [					//add headers
					{ header: 'THG_InfoId', key: 'THG_InfoId' },
					{ header: 'THG_TS', key: 'THG_TS' },
					{ header: 'Temperature', key: 'Temperature' },
					{ header: 'Relative_Humidity', key: 'Relative_Humidity' },
					{ header: 'Grain', key: 'Grain' },
					{ header: 's_infoId', key: 's_infoId' }
				];
				
				//fetch data		
				const querytest = "select * from Room_THG_Info where s_infoId in "+ sens +" and THG_TS > '" +from+"' and THG_TS < '"+to+ "'order by s_infoId";
				request = new Request(
					querytest,
					function(err, rowCount, rows) {
					if (err) 
					{
						log(err);
					} 
					else 
					{	
							detaillog(rowCount + ' row(s) returned');
							detaillog('Successfully executed query');
					}		
				});
				request.on('row', function(columns) {
					var row = {};
					columns.forEach(function(column) 
					{
						if (column.value === null) 
						{
							detaillog('NULL');
						} 
						else 
						{
							row[column.metadata.colName] = column.value;            //row column data corresponding to column value    
						}
						
					});	
					detaillog(row);
					try
					{
						sheet.addRow({THG_InfoId: row.THG_InfoId,THG_TS:row.THG_TS, Temperature:row.Temperature, Relative_Humidity:row.Relative_Humidity, Grain:row.Grain, s_infoId:row.s_infoId});		//add a particular row to worksheet
						log('Row added successfully in sheet');
					}
					catch(err)
					{
						log(err);
					}			
				});	
				request.on('requestCompleted', function () {	
					log('Downloaded File');
					workbook.xlsx.write(res).then(function()	//save excel file created
					{	
						res.end();		//send excel file to front end
					});				
				});	
				connection.execSql(request);	//execute query
			}
			catch(e)
			{
				console.log(e);
			}
		}
		catch(e)
		{	
			console.log(e);
			res.status(500).send("Error");
						//send error to front end
		}
	}
	connection.on('connect', function(err) 
	{
		if (err)
		{
			log(err);
		}
		else 
		{
			log('Successfully connected at');
			report();
		}
	});
})

router.post('/reportpdf',(req, res) =>
{
	//connect to db
	var connection = new Connection(config);
	
	//function to generate report
	function report()
	{	
		try
		{
			//accept parameters from user
			var sensorid=req.body.sid;			
			var to=req.body.toDate;
			var from=req.body.fdate;
			
			detaillog(sensorid);
			detaillog(to);
			detaillog(from);

			//build query to convert array of sensorids 
			var sens="(";			
			for (var i=0; i<sensorid.length;i++)
			{
				sens=sens+sensorid[i];
				if(i<(sensorid.length)-1)
				{
					sens=sens+",";
				}
			}
			sens=sens+")";
			detaillog(sens);		
			
			const doc = new PDFDocument;	//create new pdf document			
			try
			{
				//set MIME type
				res.writeHead(200, {
									'Content-Type': 'application/pdf',
									'Access-Control-Allow-Origin': '*',
									'Content-Disposition': 'attachment; filename=report.pdf'
								  });
				doc.pipe(res);
				
				//fetch data
				const querytest = "select * from Room_THG_Info where s_infoId in "+ sens +" and THG_TS > '" +from+"' and THG_TS < '"+to+ "' order by s_infoId"; 				
				request = new Request(
					querytest,
					function(err, rowCount, rows) {
					if (err) 
					{
						log(err);
					} 
					else 
					{	
							detaillog(rowCount + ' row(s) returned');
							detaillog('Successfully executed query');
					}		
				});
				request.on('row', function(columns) {
					var row = {};
					columns.forEach(function(column) 
					{
						if (column.value === null) 
						{
							log('NULL');
						} 
						else 
						{
							row[column.metadata.colName] = column.value;            //row column data corresponding to column value    
						}
					});
					detaillog(row);
					try
					{
						doc.text('THG Info Id: '+row.THG_InfoId);
						doc.text('THG Timestamp: '+row.THG_TS);
						doc.text('Temperature: '+row.Temperature);
						doc.text('Relative Humidity: '+row.Relative_Humidity);
						doc.text('Grain: '+row.Grain);
						doc.text('Sensor Id: '+row.s_infoId);
						doc.text('--------------------------------------------------------------');
						
					}
					catch(err)
					{
						log(err);
					}			
				});	
				request.on('requestCompleted', function () {	
					log('Downloaded File');
					doc.end();			
				});	
				connection.execSql(request);	//execute query
			}
			catch(e)
			{
				log(e);
			}
		}
		catch(e)
		{	
			log(e);
			res.status(500).send("Error");	//send error to front end
		}
	}
	connection.on('connect', function(err) 
	{
		if (err)
		{
			log(err);
		}
		else 
		{
			log('Successfully connected at');
			report();
		}
	});
})

router.post('/reportcsv',(req, res) =>
{
	//connect to database
	var connection = new Connection(config);
	
	//function to generate report
	function report() 
	{	
		try
		{
			//accept parameters from user
			var sensorid=req.body.sid;			
			var to=req.body.toDate;
			var from=req.body.fdate;
			
			detaillog(sensorid);
			detaillog(to);
			detaillog(from);

			//build query to convert array of sensorids 
			var sens="(";			
			for (var i=0; i<sensorid.length;i++)
			{
				sens=sens+sensorid[i];
				if(i<(sensorid.length)-1)
				{
					sens=sens+",";
				}
			}
			sens=sens+")";
			detaillog(sens);
			
			var workbook = new Excel.Workbook(); 	//create workbook 
			var sheet = workbook.addWorksheet("Sales", { columns: true });	//create worksheet
			console.log('Workbook created');
			try
			{
				res.setHeader('Content-disposition', 'attachment; filename=Data.csv');	//set MIME type
				res.set('Content-Type', 'text/csv');
				var filePath ='report.csv';		//specify file name
				detaillog("Filepath: "+filePath);
				sheet.columns = [					//add headers
					{ header: 'THG_InfoId', key: 'THG_InfoId' },
					{ header: 'THG_TS', key: 'THG_TS' },
					{ header: 'Temperature', key: 'Temperature' },
					{ header: 'Relative_Humidity', key: 'Relative_Humidity' },
					{ header: 'Grain', key: 'Grain' },
					{ header: 's_infoId', key: 's_infoId' }
				];
				
				//fetch data
				const querytest = "select * from Room_THG_Info where s_infoId in "+ sens +" and THG_TS > '" +from+"' and THG_TS < '"+to+ "'order by s_infoId"; 		
				request = new Request(
					querytest,
					function(err, rowCount, rows) {
					if (err) 
					{
						log(err);
					} 
					else 
					{	
							detaillog(rowCount + ' row(s) returned');
							detaillog('Successfully executed query');
					}		
				});
				request.on('row', function(columns) {
					var row = {};
					columns.forEach(function(column) 
					{
						if (column.value === null) 
						{
							console.log('NULL');
						} 
						else 
						{
							row[column.metadata.colName] = column.value;            //row column data corresponding to column value    
						}
						
					});	
					detaillog(row);
					try
					{
						sheet.addRow({THG_InfoId: row.THG_InfoId,THG_TS:row.THG_TS, Temperature:row.Temperature, Relative_Humidity:row.Relative_Humidity, Grain:row.Grain, s_infoId:row.s_infoId});		//add a particular row to worksheet
						log('Row added successfully in sheet');
					}
					catch(err)
					{
						log(err);
					}			
				});	
				request.on('requestCompleted', function () {	
					log('Downloaded File');
					workbook.csv.write(res).then(function()	//save excel file created
					{	
						res.end();		//send excel file to front end
					});				
				});	
				connection.execSql(request);	//execute query
			}
			catch(e)
			{
				log(e);
			}
		}
		catch(e)
		{	
			log(e);
			res.status(500).send("Error");	//send error to front end
			connection.close();
			reconnect();
		}
	}
	connection.on('connect', function(err) 
	{
		if (err)
		{
			log(err);
		}
		else 
		{
			log('Successfully connected at');
			report();
		}
	});
})

function reconnect()
{
	console.log('Reconnecting.....');
	connection = new Connection(config);
	connection.on('connect', function(err) {
		if (err)
		{
			console.log(err);
		}
		else
		{
			console.log('Successfully Connected');
		}
	});
}
app.use('/', router);
app.listen(process.env.port || 8000);
console.log('Running at Port 8000');