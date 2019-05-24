console.log("Booting server...")

/* === NPM DEPENDANCIES === */
const express    = require('express')            // Server framework
const bodyParser = require('body-parser')        // HTTP JSON parser for express
const mongoose   = require('mongoose')			 // MongoDB Object modelling
const pug				 = require('pug')
const path			 = require('path')

/* === INTERNAL DEPENDANCIES === */
const config     = require('./config')			 // Configuration file
const db         = require('./db')				 // DB connection
const routers    = require('./routers/generic_router')
const locale		 = require('./locale/fr-FR')
const pug_helper = require('./pug_helper')

/* === DB CONNECTION === */
db.connect();

/* === EXPRESS CONFIG === */
const app = express();

app.set('view engine', 'pug');
app.set("views", path.join(__dirname, "views"));
app.locals.basedir = path.join(__dirname, 'views');
app.locals.pug_helper = pug_helper
app.locals.routers = routers
app.locals.openedProjects = []

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/',express.static(__dirname + '/public'));
app.use('/choicesjs/',express.static(__dirname + '/node_modules/choices.js/public/assets'));


/* === ROUTER SETUP === */


function openProject(app_, projectName_){

	const router    = app_.locals.routers.createRouter();
	const metadata  = require('./structures/'+projectName_+'/metadata.json')
	const locale    = require('./structures/'+projectName_+'/locale/fr-FR.json')
	const schema 		= require('./structures/'+projectName_+'/schema.json')
	const defaultSchema 	= require('./structures/default/schema.json')
	const mergedSchema  	= {
		...schema,
		...defaultSchema
	};
	const Model     			= mongoose.model(metadata.model_name, new mongoose.Schema(mergedSchema))
	const renderSettings  = {data_route: metadata.data_route, base_route: metadata.base_route, schema:mergedSchema,locale:locale}

	app_.locals.openedProjects.push({"name":metadata.project_name,"route":metadata.base_route})
	app_.use(metadata.base_route+'/', router);
	app_.locals.routers.createRouting(router,metadata.base_route, metadata.data_route, Model, mergedSchema)

	/* === WEBPAGES SETUP === */
	router.get('/form', function (req, res) {
	  res.render('formulaire', {...renderSettings,...{title: 'form'}});
	});

	router.get('/search', function (req, res) {
	  res.render('search', {...renderSettings,...{title: 'search'}});
	});

	router.get('/', function (req, res) {
	  res.render('index', {...renderSettings,...{title: 'index', openedProjects:app_.locals.openedProjects}});
	});
}

app.get('/', function (req, res) {
	res.render('index',{title: 'index', base_route: "/",openedProjects:app.locals.openedProjects, locale:require('./structures/default/locale/fr-FR.json')});
});

openProject(app,"thesaurus")
openProject(app,"keepitsafe")

/* === OPENED PORTS === */
app.listen(config.PORT, function(){
    console.log('Your node js server is running on PORT:',config.PORT);
});
