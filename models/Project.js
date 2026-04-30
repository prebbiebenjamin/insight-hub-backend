const {DataTypes}=require("sequelize");
const sequelize=require("../config/db");

const Project=sequelize.define("Project",{

title:{
type:DataTypes.STRING,
allowNull:false
},

description:{
type:DataTypes.TEXT
},

student:{
type:DataTypes.STRING
},

department:{
type:DataTypes.STRING
},

supervisor:{
type:DataTypes.STRING
},

approved:{
type:DataTypes.BOOLEAN,
defaultValue:false
},

status:{
type:DataTypes.ENUM(
"pending",
"approved",
"rejected"
),
defaultValue:"pending"
}

});

module.exports=Project;