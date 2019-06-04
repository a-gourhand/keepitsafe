console.log("Booting server...")

/* === NPM DEPENDANCIES === */
const express    		 = require('express')            // Server framework
const bodyParser 		 = require('body-parser')        // HTTP JSON parser for express
const path			 		 = require('path')
const fs 	    	 		 = require('fs')

/* === INTERNAL DEPENDANCIES === */
const config     		 = require('./config')			 // Configuration file
const db        		 = require('./db')				 	 // DB connection
const pug_helper 		 = require('./pug_helper')
const projectFactory = require('./projectFactory')

/* === DB CONNECTION === */
db.connect();

/* === EXPRESS CONFIG === */
const app = express();

app.set('view engine', 'pug');												//Setting Pug as the template engine used by Express
app.set("views", path.join(__dirname, "views"));			//Telling Express where to find Pug templates
app.locals.basedir = path.join(__dirname, 'views');

app.locals.pug_helper = pug_helper
app.locals.openedProjects = []

app.use(bodyParser.json());														
app.use(bodyParser.urlencoded({ extended: true }));

//Defining public folders
app.use('/',express.static(__dirname + '/public'));
app.use('/choicesjs/',express.static(__dirname + '/node_modules/choices.js/public/assets'));
app.use('/jquery/',express.static(__dirname + '/node_modules/jquery/dist'));

//Setup of the index webpage
app.get('/', function (req, res) {
	res.render('index',{title: 'index', base_route: "/",openedProjects:app.locals.openedProjects, locale:require('./structures/default/locale/fr-FR.json')});
});

//Opening every project
fs.readdirSync('./structures/').forEach(file => {
  if(file!=="default"){
		new projectFactory.Project(app,file)
	}
});

/* === OPENED PORTS === */
app.listen(config.PORT, function(){
    console.log('Your node js server is running on PORT:',config.PORT);
});
