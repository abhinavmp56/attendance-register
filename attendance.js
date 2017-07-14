const express=require('express');
const app=express();
var session=require('express-session');
var mongojs=require('mongojs');
var date=require('current-date');
app.use(express.static('public'))
app.use(session({
	secret:"secret",
	uid:""
}))
var sess={
	uid:""
}
var bodyParser=require('body-parser')
app.use(bodyParser());
app.set('view engine','ejs');
app.use(express.static("public"));
var db = mongojs('mongodb://[dburl]', ['admin','teacher','student','attendance','attendances']);
app.set("port",process.env.PORT||7000);

app.get("/",function(req,res){
 	if(req.session.uid&&req.session.type=="admin")
 		res.redirect('/adminhome')
 	else
 		if(req.session.uid&&req.session.type=="teacher")
 			res.redirect('/teacherhome')
else
 		res.render('login');
 	
})


app.get("/teacherlogin",function(req,res){
if(req.session.uid&&req.session.type=="admin")
 		res.redirect('/adminhome')
 	else
 		if(req.session.uid&&req.session.type=="teacher")
 			res.redirect('/teacherhome')
else
res.render('login2');

})


app.get("/adminhome",function(req,res){
		if(req.session.uid)
{
	if(req.session.type=="admin")
  {
	db.attendance.find({"Date":date('date'),"Name":req.session.uid},function(err,result1){
			var asd=JSON.stringify(result1)
			p=(asd.match(/present/g) || []).length;
			a=(asd.match(/absent/g) || []).length;

var res1={
	"present":p,
	"absent":a
}
var res3=[]

	var rest={}
	
	
db.attendances.find({"Date":date('date')},function(err,result2){
	for(var i=0;i<result2.length;i++){
var asd=JSON.stringify(result2[i])
			np=(asd.match(/present/g) || []).length;
			na=(asd.match(/absent/g) || []).length;
			
rest={
	"Name":result2[i].TeacherName,
	"present":np,
	"absent":na
}
res3.push(rest)

}

var res2 = {

"result1":res1,
"result2":res3
}

res.render('home',{result:res2});


})







})
	}
else
{
	if(req.session.type=="teacher")
		res.redirect('/teacherhome')
}
}
else
res.redirect('/')

		

})


app.get("/teacherhome",function(req,res){

	
	db.attendances.find({"Date":date('date'),"Name":req.session.uid},function(err,result1){
			var asd=JSON.stringify(result1)
			p=(asd.match(/present/g) || []).length;
			a=(asd.match(/absent/g) || []).length;
	if(req.session.uid)
{
	if(req.session.type=="teacher")
  {
var res1={
	"present":p,
	"absent":a
}
res.render('home2',{res1});
}
else
{
	if(req.session.type=="admin")
		res.redirect('/adminhome')
}
}
else
res.redirect('/teacherlogin')

})
		



})


app.get("/adminsignout",function(req,res){

	req.session.destroy(function(err){
	if(err)
	console.log(err);
	else	
	res.render('login');
})

})


app.get("/adminadd",function(req,res){

	if(req.session.uid)
{
	if(req.session.type=="admin")
  {
	res.render('add');
}
else
{
	if(req.session.type=="teacher")
		res.redirect('/teacheradd')
}
}
else
res.redirect('/')


})

app.get("/adminatt",function(req,res){
	if(req.session.uid)
{
	if(req.session.type=="admin")
  {
	db.attendance.find({"Date":date('date'),"Name":req.session.uid},function(err,result){
	if(result.length==0)
	db.teacher.find({},function(err,result1){
    res.render('attendance',{log:"new",teach:result1});
	})
    else
    res.render('attendance',{log:"update",teach:result});
})
	}
else
{
	if(req.session.type=="teacher")
		res.redirect('/teacheratt')
}
}
else
res.redirect('/')
})



app.get("/teachersignout",function(req,res){

	req.session.destroy(function(err){
	if(err)
	console.log(err);
	else	
	res.render('login2');
})


})




app.get("/teacheradd",function(req,res){
if(req.session.uid)
{
	if(req.session.type=="teacher")
  {
	res.render('add2');
}
else
{
	if(req.session.type=="admin")
		res.redirect('/adminadd')
}
}
else
res.redirect('/teacherlogin')

})


app.get("/teacheratt",function(req,res){
if(req.session.uid)
{
	if(req.session.type=="teacher")
  {  db.attendances.find({"Date":date('date'),"Name":req.session.uid},function(err,result){
  	if(result.length==0)
  	db.student.find({},function(err,result1){
      res.render('attendance2',{log:"new",stud:result1,
      	branch:req.session.branch});
  	})
      else
      res.render('attendance2',{log:"update",stud:result});
  })}
else
{
	if(req.session.type=="admin")
		res.redirect('/adminatt')
}
}
else
res.redirect('/teacherlogin')
})



app.post("/adminlogin",function(req,res){

	var id=req.body.adminid;
	var pass=req.body.adminpass
	var user={
		"UserID":id,
		"Password":pass
	}
	db.admin.find(user,function(err,result){

		if(result.length>0)
		{
			req.session.uid=result[0].UserID;
			
			req.session.type="admin";
			res.redirect('/adminhome');
		}
		else{
			console.log("incorrect credentials");
			res.send('incorrect credentials');
			//res.render('login');
		}
	})

})


app.post("/teachlogin",function(req,res){

	var id=req.body.teacherid;
	var pass=req.body.teacherpass
	var user={
		"UserID":id,
		"Password":pass
	}
	db.teacher.find(user,function(err,result){

		if(result.length>0)
		{
			req.session.uid=result[0].UserID;
			req.session.name=result[0].Name;
			req.session.branch= result[0].Branch;
			req.session.type="teacher";
			res.redirect('/teacherhome');
		}
		else{
			console.log("incorrect credentials");
			res.send('incorrect credentials')
			//res.render('login2');
		}
	})


})


app.post("/addteach",function(req,res){

	var id=req.body.teacherid;
	var pass=req.body.teacherpass;
	var name=req.body.teachname;
	var dob=req.body.dob;
	var gender=req.body.gender;
	var branch=req.body.Branch;
	var user4={
		"UserID":id,
		"Password":pass,
		"Name":name,
		"DOB":dob,
		"Gender":gender,
		"Branch":branch
	}
	var user={
	             "Name":req.session.uid,
	             "Date":date('date'),
                 "TeacherLog":[]
                }
                          

            db.attendance.find({},function(err,result){
            	if(result.length!=0)
                 for(var i=0;i<result[0].TeacherLog.length;i++){
			         
			         var user1={
		                 "TeacherName":result[0].TeacherLog[i].TeacherName,
		                 "ID":result[0].TeacherLog[i].ID,
		                 "Type":result[0].TeacherLog[i].Type,
		                 "Attendance":result[0].TeacherLog[i].Attendance
	                    }

	                 user.TeacherLog.push(user1);
	                 

                    }
                    
                    var user2={
                    	"TeacherName":name,
		                 "ID":id,
		                 "Type":"student",
		                 "Attendance":"present"
                    }
                    user.TeacherLog.push(user2);
	             db.attendance.update({"Date":date('date'),"Name":req.session.uid},	user)
	         })
	             
	db.teacher.insert(user4,function(err,result){
		if(err)
		{
			console.log(err);
			res.render('add');
		}
		else
		{
			console.log("added to database");
			res.redirect('/adminhome');
		}
	})


})


app.post("/addstudent",function(req,res){

	var name=req.body.studname;
	var dob=req.body.dob;
	var gender=req.body.gender;
	var branch=req.body.Branch;
	var user4={
		"Name":name,
		"DOB":dob,
		"Gender":gender,
		"Branch":branch
	}
	{
        	var user={
	             "Name":req.session.uid,
	             "Date":date('date'),
                 "StudentLog":[]
                }
            var l=req.body.lengths
            db.attendances.find({},function(err,result){
            	if(result.length!=0)
                 for(var i=0;i<result[0].StudentLog.length;i++){
			         
			         var user1={
		                 "StudentName":result[0].StudentLog[i].StudentName,
		                 "Type":"student",
		                 "Attendance":result[0].StudentLog[i].Attendance
	                    }
	                 user.StudentLog.push(user1);

                    }
                    var user2={
		                 "StudentName":name,
		                 "Type":"student",
		                 "Attendance":"present"
	                    }
	                    user.StudentLog.push(user2);
	             db.attendances.update({"Date":date('date'),"Name":req.session.uid},user)
	             
            })

        }
	db.student.insert(user4,function(err,result){
		if(err)
		{
			console.log(err);
			res.render('add2');
		}
		else
		{
			console.log("added to database");
			res.redirect('/teacherhome');
		}
	})

})
 

app.post("/attteach",function(req,res){
		
	var id;
	var att;
db.attendance.find({"Date":date('date'),"Name":req.session.uid},function(err,result){
	if(result.length==0)
		{
			var user={
	             "Name":req.session.uid,
	             "Date":date('date'),
                 "TeacherLog":[]
                }
            var l=req.body.lengths
            db.teacher.find({},function(err,result){
                 for(var i=0;i<l;i++){
			         id=result[i].UserID;
			         var asdasdasd=req.body[id]
			         att="absent";
			         if(asdasdasd=="present")
				         att="present";
			         var user1={
		                 "TeacherName":result[i].Name,
		                 "ID":id,
		                 "Type":"teacher",
		                 "Attendance":att
	                    }
	                 user.TeacherLog.push(user1);

                    }
	             db.attendance.insert(user,function(err,result1){
	             	res.redirect('adminhome')
 
                    })
            })
        }
    else
        {
        	var user={
	             "Name":req.session.uid,
	             "Date":date('date'),
                 "TeacherLog":[]
                }
            var l=req.body.lengths
            db.teacher.find({},function(err,result){
                 for(var i=0;i<l;i++){
			         id=result[i].UserID;
			         var asdasdasd=req.body[id]
			         att="absent";
			         if(asdasdasd=="present")
				         att="present";
			         var user1={
		                 "TeacherName":result[i].Name,
		                 "ID":id,
		                 "Type":"teacher",
		                 "Attendance":att
	                    }
	                 user.TeacherLog.push(user1);

                    }
	             db.attendance.update({"Date":date('date'),"Name":req.session.uid},	user)
	             	res.redirect('/adminhome')
 
                    
            })

        }
    })
})



app.post("/attstudent",function(req,res){

	var id;
	var att;
db.attendances.find({"Date":date('date'),"Name":req.session.uid},function(err,result){
	if(result.length==0)
	    { 
			var user={
	             "Name":req.session.uid,
	             "TeacherName":req.session.name,
	             "Date":date('date'),
                 "StudentLog":[]
                }
            var l=req.body.lengths
            db.student.find({},function(err,result){
                 for(var i=0;i<l;i++){
			         id=result[i].Name;
			         branch=result[i].Branch;
			         if(branch==req.session.branch){


			         var asdasdasd=req.body[id]
			         att="absent";
			         if(asdasdasd=="present")
				         att="present";
			         var user1={
		                 "StudentName":result[i].Name,
		                 "Type":"student",
		                 "Attendance":att,
		                 "Branch":branch
	                    }
	                 user.StudentLog.push(user1);
 }
                    }
	             db.attendances.insert(user,function(err,result1){
	             	res.redirect('teacherhome')
 
                    })
            })
        }
    else
        {
        	var user={
	             "Name":req.session.uid,
	             "TeacherName":req.session.name,
	             "Date":date('date'),
                 "StudentLog":[]
                }
            var l=req.body.lengths
            db.student.find({},function(err,result){
                 for(var i=0;i<l;i++){
			         id=result[i].Name;
			         var asdasdasd=req.body[id]
			         att="absent";
			         if(asdasdasd=="present")
				         att="present";
			         var user1={
		                 "StudentName":result[i].Name,
		                 "Type":"student",
		                 "Attendance":att
	                    }
	                 user.StudentLog.push(user1);

                    }
	             db.attendances.update({"Date":date('date'),"Name":req.session.uid},user)
	             res.redirect("/teacherhome")
            })

        }
    })
})



app.listen(app.get('port'), function () 
	{
  			console.log('Open!!');
	})