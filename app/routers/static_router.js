const fs 	    = require('fs')
const render    = require('../render.js')

function createRouting(project){

    /* === WEBPAGES SETUP === */
    project.router.get('/form', function (req, res) {
        render.renderPage(res,'formulaire',{title: 'form'},project)
    });

    project.router.get('/search', function (req, res) {
        render.renderPage(res,'search',{title: 'search'},project)
    });

    project.router.get('/', function (req, res) {
        render.renderPage(res,'index',{title: 'index'},project)
    });

    /* === POST DESC ===*/
    project.router.post('/help', function(req,res) {

        fs.readFile('structures/'+project.projectName+'/saved/descriptions.json', "utf-8",function(err, contents) {
            let fileobj = {}
            try{
                fileobj = JSON.parse(contents)
            } catch(err){
                console.log(err)
            }
            Object.keys(req.body).forEach(key => fileobj[key]=req.body[key])
            project.descriptions = {...fileobj}
            fs.writeFile('structures/'+project.projectName+'/saved/descriptions.json', JSON.stringify(fileobj), "utf-8",function(err,contents){
                console.log(err)
            })
        });
    })
}





module.exports = {
    createRouting: createRouting
}