const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");
const pool = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/* =========================
SERVE FRONTEND
========================= */


/* serve frontend files */
app.use(express.static(path.join(__dirname,"frontend")));

/* homepage */
app.get("/",(req,res)=>{
res.sendFile(
path.join(__dirname,"frontend","index.html")
);
});

/* project details page */
app.get("/details.html",(req,res)=>{
res.sendFile(
path.join(__dirname,"frontend","details.html")
);
});



/* =========================
AUTH
========================= */

app.post("/register", async(req,res)=>{
try{

const {name,email,password}=req.body;

const hashedPassword=
await bcrypt.hash(password,10);

const user=
await pool.query(
`
INSERT INTO users
(name,email,password)

VALUES($1,$2,$3)

RETURNING id,name,email,role
`,
[
name,
email,
hashedPassword
]
);

res.json(user.rows[0]);

}catch(err){
console.error(err);
res.status(500).send("Registration error");
}
});


app.post("/login", async(req,res)=>{
try{

const {email,password}=req.body;

const user=
await pool.query(
`
SELECT * FROM users
WHERE email=$1
`,
[email]
);

if(user.rows.length===0){
return res.send("User not found");
}

const valid=
await bcrypt.compare(
password,
user.rows[0].password
);

if(!valid){
return res.send("Wrong password");
}

res.json(user.rows[0]);

}catch(err){
console.error(err);
res.status(500).send("Login error");
}
});



/* =========================
SUBMIT PROJECT
(All new submissions pending)
========================= */

app.post("/projects",async(req,res)=>{
try{

const{
user_id,
title,
description,
department,
supervisor,
year,
technology,
pdf_url,
video_url
}=req.body;


const result=
await pool.query(
`
INSERT INTO projects(

user_id,
title,
description,
department,
supervisor,
year,
technology,
pdf_url,
video_url,
status

)

VALUES(

$1,$2,$3,$4,$5,$6,$7,$8,$9,
'pending'

)

RETURNING *
`,
[
user_id,
title,
description,
department,
supervisor,
year,
technology,
pdf_url,
video_url
]
);

res.json(result.rows[0]);

}catch(err){
console.error(err);
res.status(500).send("Submission error");
}
});



/* =========================
PUBLIC SEES APPROVED ONLY
========================= */

app.get("/projects",async(req,res)=>{
try{

const result=
await pool.query(
`
SELECT
p.*,
u.name as student

FROM projects p
JOIN users u
ON p.user_id=u.id

WHERE status='approved'
`
);

res.json(result.rows);

}catch(err){
console.error(err);
res.status(500).send("Fetch error");
}
});



/* =========================
SINGLE PROJECT DETAILS
========================= */

app.get("/projects/:id",async(req,res)=>{
try{

const result=
await pool.query(
`
SELECT
p.*,
u.name as student

FROM projects p
JOIN users u
ON p.user_id=u.id

WHERE p.id=$1
`,
[
req.params.id
]
);

res.json(result.rows[0]);

}catch(err){
console.error(err);
res.status(500).send("Project details error");
}
});



/* =========================
BOOKMARKS
========================= */

app.post("/bookmark",async(req,res)=>{

const{
user_id,
project_id
}=req.body;

await pool.query(
`
INSERT INTO bookmarks
(user_id,project_id)

VALUES($1,$2)
`,
[
user_id,
project_id
]
);

res.send("Bookmarked");

});



app.get("/bookmarks/:userId",
async(req,res)=>{

const result=
await pool.query(
`
SELECT p.*
FROM bookmarks b

JOIN projects p
ON b.project_id=p.id

WHERE b.user_id=$1
`,
[
req.params.userId
]
);

res.json(result.rows);

});



/* =========================
COMMENTS
========================= */

app.post("/comments",
async(req,res)=>{

const{
user_id,
project_id,
comment
}=req.body;

const result=
await pool.query(
`
INSERT INTO comments
(user_id,project_id,comment)

VALUES($1,$2,$3)

RETURNING *
`,
[
user_id,
project_id,
comment
]
);

res.json(result.rows[0]);

});


app.get("/comments/:projectId",
async(req,res)=>{

const result=
await pool.query(
`
SELECT
c.*,
u.name

FROM comments c
JOIN users u
ON c.user_id=u.id

WHERE c.project_id=$1
ORDER BY id DESC
`,
[
req.params.projectId
]
);

res.json(result.rows);

});



/* =========================
ACCESS REQUESTS
========================= */

app.post("/request-access",
async(req,res)=>{

const{
user_id,
project_id,
message
}=req.body;

await pool.query(
`
INSERT INTO access_requests
(user_id,project_id,message)

VALUES($1,$2,$3)
`,
[
user_id,
project_id,
message
]
);

res.send("Request sent");

});



/* =========================
ADMIN MODERATION
========================= */

/* pending submissions */

app.get("/admin/pending",
async(req,res)=>{

const result=
await pool.query(
`
SELECT
p.*,
u.name as student

FROM projects p
JOIN users u
ON p.user_id=u.id

WHERE status='pending'
`
);

res.json(result.rows);

});


/* approve */

app.put("/admin/approve/:id",
async(req,res)=>{

await pool.query(
`
UPDATE projects
SET status='approved'
WHERE id=$1
`,
[
req.params.id
]
);

res.send("Approved");

});


/* reject */

app.put("/admin/reject/:id",
async(req,res)=>{

await pool.query(
`
UPDATE projects
SET status='rejected'
WHERE id=$1
`,
[
req.params.id
]
);

res.send("Rejected");

});


/* edit */

app.put("/admin/edit/:id",
async(req,res)=>{

const{
title,
description,
department,
technology
}=req.body;

await pool.query(
`
UPDATE projects

SET
title=$1,
description=$2,
department=$3,
technology=$4

WHERE id=$5
`,
[
title,
description,
department,
technology,
req.params.id
]
);

res.send("Updated");

});


/* delete */

app.delete("/admin/delete/:id",
async(req,res)=>{

await pool.query(
`
DELETE FROM projects
WHERE id=$1
`,
[
req.params.id
]
);

res.send("Deleted");

});



/* =========================
START SERVER
========================= */

app.listen(PORT,()=>{
console.log(
`Server running on port ${PORT}`
);
});