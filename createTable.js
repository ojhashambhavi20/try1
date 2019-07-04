
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var async = require('async');
var fs=require('fs');
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
function Insert() {	
		request = new Request(
		//"insert into priorityDetails(priorityName,priorityDescription) values('P6','Grain lower than threshold') ",
		"select * from emailDetails",
		//"drop table priorityDetails",
		//"insert into emailDetails(emailId,pId) values('sankyyshammzzz0220@gmail.com',3)",
		//"create table emailDetails(EmailserialNo int primary key identity(1,1),emailId varchar(50),pId int foreign key references priorityDetails(priorityId))",
		//"create table priorityDetails(priorityId int primary key identity(1,1), priorityName varchar(20),priorityDescription varchar(50))",
		//"create table RoomDetails(roomId int primary key identity(1,1), roomName varchar(20),roomDescription varchar(50))",
		//"create table SensorDetails(sensorId int primary key identity(100,1), sensorName varchar(20),sensorDescription varchar(50),rId int foreign key references RoomDetails(roomId),highTh_Temp float,lowTh_Temp float,highTh_Rh float,lowTh_Rh float,highTh_Grain float,lowTh_Grain float,testMode bit)",
		//"create table AlarmDetails(alarmId int primary key identity(500,1),alarmMessage varchar(50),sId int foreign key references SensorDetails(sensorId),alarmTimeGeneration datetime)",
		//"create table Room_THG_Info(THG_InfoId int primary key identity(1000,1), THG_TS datetime,Temperature float,Relative_Humidity float,Grain float,s_infoId int foreign key references SensorDetails(sensorId))",
		//"insert into RoomDetails(roomName,roomDescription) values('ODC1','Life Sciences ODC1') ",
		//"insert into SensorDetails(sensorName,sensorDescription,rId,highTh_Temp,lowTh_Temp,highTh_Rh,lowTh_Rh,highTh_Grain,lowTh_Grain,testMode) values('sensor1','Right side of the room',1,32.0,20.0,80.0,60.0,90.0,70.0,0) ",
		//"insert into AlarmDetails(alarmMessage,sId,alarmTimeGeneration) values('Temperature is lower than threshold',100,'2019-04-16T15:29:35.000Z') ",
		//"insert into Room_THG_Info(THG_TS,Temperature,Relative_Humidity,Grain,s_infoId) values('2019-04-16T15:29:35.000Z',25.34,60.43,72.23,100) ",
		//"select * from  Room_THG_Info",
		function(err, rowCount, rows) {
			if (err) {
				throw err;
			} else {	
				console.log(rowCount + ' row(s) returned');
				//console.log('Table Created');
			}		
		}
	);
    request.on('row', function(columns) {
        columns.forEach(function(column) {
            if (column.value === null) {
                console.log('NULL');
            } else{console.log(column.value);
            }
        });		
    });
	request.on('requestCompleted',function(){
		connection.close();
	});
    connection.execSql(request);
	
}
connection.on('connect', function(err) {
  if (err){
    console.log(err);
  }else {
    console.log('Connected');
    async.waterfall
	([
       Insert
    ])
  }
});




