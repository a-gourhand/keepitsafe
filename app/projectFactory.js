const mongoose   		 = require('mongoose')
const fs 	    	 	 = require('fs')
const expressRouter 	 = require('express').Router

const routers    		 = require('./routers/generic_router')
const staticRouters  	 = require('./routers/static_router')

class Project {
	constructor(app_,projectName_){

		try {
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
		console.log(this.descriptions)
	
		app_.locals.openedProjects.push({"name":this.metadata.project_name,"route":this.metadata.base_route})
		routers.createRouting(this)
		staticRouters.createRouting(this)
		app_.use(this.metadata.base_route+'/', this.router);
		
	}

	get renderSettings(){
		return { base_route:	this.metadata.base_route,
				 data_route:	this.metadata.data_route,
				 schema:		this.mergedSchema,
				 locale:		this.mergedLocale
				}
	}

	
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

}

module.exports = {
	Project : Project
}