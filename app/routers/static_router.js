const fs 	    = require('fs')
const render    = require('../render.js')

function createRouting(project){

    /* === WEBPAGES SETUP === */
    project.router.get('/form', function (req, res) {
        render.renderPage(res,'form',{title: 'form'},project)
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

    project.router.get('/locale', function(req,res){
        res.json(project.mergedLocale)
    })

    project.router.get('/choices', function(req,res){
        let payload = {title:'choices'}
        if(req.query.key){
            if(project.choices[req.query.key]){
                let choicesSet = {}
                choicesSet[req.query.key] = project.choices[req.query.key]
                payload = {...payload, choicesSet:choicesSet}
            } else {
                let choicesSet = {}
                choicesSet[req.query.key] = {}
                payload = {...payload, choicesSet:choicesSet}
            }
            
        } else {
            payload = {...payload, choicesSet:project.choices}
        }
        if(req.accepts('html')){
            render.renderPage(res,'choices',payload,project)
        } else {
            res.json(project.choices)
        }
        
    })

    project.router.post('/choices', function(req,res){
        console.log(req.body)
        console.log(req.body.test)
        fs.readFile('structures/'+project.projectName+'/saved/choices.json', "utf-8",function(err, contents) {
            let fileobj = {}
            try{
                fileobj = JSON.parse(contents)
            } catch(err){
                console.log(err)
            }
            Object.keys(req.body).forEach(key => fileobj[key]=req.body[key])
            project.choices = {...fileobj}
            fs.writeFile('structures/'+project.projectName+'/saved/choices.json', JSON.stringify(fileobj), "utf-8",function(err,contents){
                if(err) console.log(err)
                let payload = {title:'choices'}
                if(Object.keys(req.body)==1){
                    let choicesSet = {}
                    choicesSet[req.body[0]] = project.choices[req.body[0]]
                    payload = {...payload, choicesSet:choicesSet}
                } else {
                    payload = {...payload, choicesSet:project.choices}
                }
                render.renderPage(res,'choices',payload,project)
            })
        });
    })
}





module.exports = {
    createRouting: createRouting
}