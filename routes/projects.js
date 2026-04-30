const router=require("express").Router();
const Project=require("../models/Project");
const auth=require("../middleware/auth");


/* -------------------------
SUBMIT PROJECT
(All submissions start pending)
--------------------------*/

router.post(
"/submit",
auth,
async(req,res)=>{

const project=
await Project.create({

title:req.body.title,
description:req.body.description,
student:req.body.student,
department:req.body.department,
supervisor:req.body.supervisor,

status:"pending",
approved:false

});

res.json(project);

}
);



/* -------------------------
PUBLIC ONLY SEES APPROVED
--------------------------*/

router.get(
"/",
async(req,res)=>{

const projects=
await Project.findAll({

where:{
status:"approved"
}

});

res.json(projects);

}
);



/* -------------------------
GET SINGLE PROJECT
--------------------------*/

router.get(
"/:id",
async(req,res)=>{

const project=
await Project.findByPk(
req.params.id
);

res.json(project);

}
);



/* -------------------------
ADMIN VIEW PENDING SUBMISSIONS
--------------------------*/

router.get(
"/admin/pending",
auth,
async(req,res)=>{

const pending=
await Project.findAll({

where:{
status:"pending"
}

});

res.json(pending);

}
);



/* -------------------------
ADMIN APPROVE
--------------------------*/

router.put(
"/admin/approve/:id",
auth,
async(req,res)=>{

await Project.update(

{
status:"approved",
approved:true
},

{
where:{
id:req.params.id
}
}

);

res.json({
message:"Project approved"
});

}
);



/* -------------------------
ADMIN REJECT
--------------------------*/

router.put(
"/admin/reject/:id",
auth,
async(req,res)=>{

await Project.update(

{
status:"rejected",
approved:false
},

{
where:{
id:req.params.id
}
}

);

res.json({
message:"Project rejected"
});

}
);



/* -------------------------
ADMIN EDIT CONTENT
--------------------------*/

router.put(
"/admin/edit/:id",
auth,
async(req,res)=>{

await Project.update(

{

title:req.body.title,
description:req.body.description,
department:req.body.department,
supervisor:req.body.supervisor

},

{
where:{
id:req.params.id
}
}

);

res.json({
message:"Project updated"
});

}
);






router.delete(
"/admin/delete/:id",
auth,
async(req,res)=>{

await Project.destroy({

where:{
id:req.params.id
}

});

res.json({
message:"Project deleted"
});

}
);


module.exports=router;