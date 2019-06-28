const mongoose   		 = require('mongoose')
const fs 	    	 	 = require('fs')
const expressRouter 	 = require('express').Router

const routers    		 = require('./routers/generic_router')
const staticRouters  	 = require('./routers/static_router')

class Project {
	constructor(app_,projectName_){

		//Load all required files
		try {
			this.checkDirectory('./structures/'+projectName_+'/locale')
			this.checkDirectory('./structures/'+projectName_+'/saved')
			this.metadata 		= require('./structures/'+projectName_+'/metadata.json')
			this.locale    		= require('./structures/'+projectName_+'/locale/fr-FR.json')
			this.schema 		= require('./structures/'+projectName_+'/schema.json')
			this.defaultSchema 	= require('./structures/default/schema.json')
			this.defaultLocale 	= require('./structures/default/locale/fr-FR.json')
		} catch(err){
			if(err.code=="ENOENT") console.log("File dependancies not found : ",err.path)
			else console.error(err)
			return
		}

		//Set all values for this structure
		this.app 			= app_
		this.projectName 	= projectName_
		this.router    		= expressRouter();	
		this.mergedLocale 	= { 
			"schema" : {...this.defaultLocale.schema, ...this.locale.schema},
			"website" : this.defaultLocale.website 
		}
		this.mergedSchema  	= {
			...this.schema,
			...this.defaultSchema
		};
		this.Model 			= mongoose.model(this.metadata.model_name, new mongoose.Schema(this.mergedSchema))
		this.descriptions   = this.requireOrEmpty('./structures/'+projectName_+'/saved/descriptions.json')
		this.choices   		= this.requireOrEmpty('./structures/'+projectName_+'/saved/choices.json')

		//Save the list of opened projects for the list on the main web page
		app_.locals.openedProjects.push({"name":this.metadata.project_name,"route":this.metadata.base_route})
		//Create routes for this structure
		routers.createRouting(this)
		staticRouters.createRouting(this)
		//Attach the completed router to the main Express App
		app_.use(this.metadata.base_route+'/', this.router);
		
	}

	//Ressources that are needed for the render with the view engine
	get renderSettings(){
		return { base_route:	this.metadata.base_route,
				 data_route:	this.metadata.data_route,
				 schema:		this.mergedSchema,
				 locale:		this.mergedLocale
				}
	}

	//Charge un fichier s'il existe
	requireOrEmpty(path){
		try {
			if (fs.existsSync(path)) {
			  return require(path)
			}
			return {}
		  } catch(err) {
			console.error(err)
		  }			  
	}

	//Vérifie si un dossier existe et le créé dans le cas contraire
	checkDirectory(path){
		if (!fs.existsSync(path)){
			fs.mkdirSync(path);
		}
	}

}

module.exports = {
	Project : Project
}