var debug=process.argv[2];

//importing modules
const express = require('express');
const app = express();
const path = require('path');
const helmet = require('helmet');
const router = express.Router();
const bodyParser = require('body-parser');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var Excel = require('exceljs');
var expressJSON = require('express-json');
var fs=require('fs');
const PDFDocument = require('pdfkit');
app.use(expressJSON());
app.use(bodyParser.json());
app.use(helmet());
require('dotenv').config();


//to decrypt db credentials
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
	password=process.env.password
	
//read encrypted credentials from file
var fs=require('fs'),
configPath = './config.json';
var parsed = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));

//decrypt function
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  return dec;
}

//function for detailed logging
function detaillog(message)
{
	if(debug=="true")
		fs.appendFile(path.join(process.env.file),message+" at time: "+Date()+"\n",function(err){if(err) console.log(err)});	//log success in file
}
function log(message)
{
	fs.appendFile(path.join(process.env.file),message+" at time: "+Date()+"\n",function(err){if(err) console.log(err)});	//log success in file
}

//API method
router.post('/reportpdf',(req, res) =>
{
//connect to db
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
	var connection = new Connection(config);
	function Read() 
	{	
		try
		{
			var sensorid=req.body.sid;
			console.log(sensorid);
			var to=req.body.toDate;
			var from=req.body.fdate;
			
			console.log(to);
			console.log(from);

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
			console.log(sens);			
			
			const doc = new PDFDocument;			
			try
			{
				res.writeHead(200, {
									'Content-Type': 'application/pdf',
									'Access-Control-Allow-Origin': '*',
									'Content-Disposition': 'attachment; filename=report.pdf'
								  });
				doc.pipe(res);
				
				//fetch data
				const querytest = "select * from Room_THG_Info where s_infoId in "+ sens +" and THG_TS > '" +from+"' and THG_TS < '"+to+ "'"; 				
				request = new Request(
					querytest,
					function(err, rowCount, rows) {
					if (err) 
					{
						console.log(err);
					} 
					else 
					{	
							console.log(rowCount + ' row(s) returned');
							console.log('Successfully executed query');
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
					//console.log(rows);
					try
					{
						console.log(row);
						//console.log("ID: ",row.Id);
						//console.log("Name: ",row.Name);
						//console.log("Location: ",row.Location);
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
						console.log(err);
					}			
				});	
				request.on('requestCompleted', function () {	
					console.log('Downloaded File');
					doc.end();			
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
			res.status(500).send("Error");	//send error to front end
		}
	}
	connection.on('connect', function(err) 
	{
		if (err)
		{
			console.log(err);
		}
		else 
		{
			console.log('Successfully connected at');
			Read();
		}
	});
})
app.use('/', router);

app.use(express.static(__dirname+'/scripts'));	//to display static html page
app.listen(process.env.port || 8005);
console.log('Running at Port 8005');

//handle default express errors
app.use(function (err, req, res, next) 
{
  log(err.stack)
  res.status(500).send('Something broke!')
})