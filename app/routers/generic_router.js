const uuidv1        = require('uuid/v1')
const jp            = require('jsonpath')

const pug_helper    = require('../pug_helper')
const render        = require('../render.js')

//FOR COLLECTIONS OF DOCUMENTS
function createCollectionRouting(project){

    /* === MIDDLEWARE === */
    project.router.use(project.metadata.data_route, (req, res, next)=>{
        switch(req.method){
            case "POST":
                next()
                break
            case "PUT":
                res.status(400)
                break
            default :
                
                var nodes = pug_helper.getLeavesAndData(req.query)
                //console.log("nodes", nodes)
                var clean = pug_helper.removeEmpty(nodes)
                //console.log("clean",clean)
                var nodeProps = pug_helper.getNodeProps(clean, project.schema)
                //console.log("props", nodeProps)
                var parsedData = pug_helper.parseData(nodeProps)
                //console.log("parsed", parsedData)
                var searchReadyObj = pug_helper.prepareObjForSearch(parsedData)
                console.log("search", searchReadyObj)
            
                project.Model.find(searchReadyObj, (err,results)=>{
                    console.log("found", results)
                    if(err)
                        res.status(500).send(err)
                    else {
                        req.results = results;
                        next()
                    }
                })
        }
    })

    /* === CRUD === */

    project.router.route(project.metadata.data_route)
    .get((req, res) => {
        if(req.accepts('html')){
            let payload = { title: 'results', data:JSON.stringify(req.results) }
            render.renderPage(res,'results_list',payload,project)
        } else {
            res.json(req.results)
        }
    })
    .post((req,res) => {
        req.body.creation_date = new Date()
        req.body.last_modification = new Date()
        req.body.uuid = uuidv1()

        console.log("body : ")
        console.log(req.body)

        let nodes = pug_helper.getLeavesAndData(req.body)
        let nodesWProps = pug_helper.getNodeProps(nodes,project.schema)
        let parsedData = pug_helper.parseData(nodesWProps)

        parsedData.forEach(function(e){
            jp.apply(req.body,e.path,function(f){
                return e.value
            })
        })

        let newObject = new project.Model(req.body);
        newObject.save()

        if(req.accepts('html')){
            let payload = {title: 'results', data:JSON.stringify(req.body)}
            render.renderPage(res,'results',payload,project)
        } else {
            res.status(201).send(newObject)
        }
    })
    .put((req,res) => {
        res.status(500)
    })
    .patch((req,res)=>{
        req.results.forEach(function(e){
            if(req.body._id){
                delete req.body._id;
            }
            for( let p in req.body ){
                e[p] = req.body[p]
            }
            e.save()
        })
        if(req.results.length==1){
            res.json(req.result[0])
        } else {
            res.status(204).send("Updated "+req.result.length+" elements.")
        }
    })
    .delete((req,res)=>{
        try{
            req.results.forEach(function(e){
                e.remove(err => {
                    if(err) throw err
                })
            })
            res.status(204).send('Removed '+req.results.length+" elements.")
        } catch (err) {
            res.status(500).send(err)
        }
        
    })
}

//FOR SINGLE DOCUMENTS
function createResourceRouting(project){

    /* === MIDDLEWARE === */

    project.router.use(project.metadata.data_route+'/:req_id', (req, res, next)=>{
        if(req.body._method){
            req.method = req.body._method
            delete req.body._method
        }
        switch(req.method){
            case "POST":
                res.status(400)
                break
            case "PUT":
                next()
                break
            default :
                project.Model.findById( req.params.req_id, (err,result)=>{
                    if(err)
                        res.status(500).send(err)
                    else {
                        //console.log("RESSOURCE")
                        //console.log(result)
                        req.result = result;
                        next()
                    }
                })
        }
    })

    /* === CRUD === */

    project.router.route(project.metadata.data_route+'/:req_id')
    .get((req, res) => {

        if(req.accepts('html')){
            let payload = {title: 'results', data:JSON.stringify(req.result)}
            render.renderPage(res,'results',payload,project)
        } else {
            res.json(req.results)
        }
    })
    .post((req,res) => {
        let result = new  project.Model(req.body);
        result.save()
        res.status(201).send(result)
    })
    .put((req,res) => {
       
        if(req.body._id) delete req.body._id;
        if(req.body.__v) delete req.body.__v;
        req.body.last_modification = new Date()

        let nodes = pug_helper.getLeavesAndData(req.body)
        let nodesWProps = pug_helper.getNodeProps(nodes,project.schema)
        let parsedData = pug_helper.parseData(nodesWProps)

        parsedData.forEach(function(e){
            jp.apply(req.body,e.path,function(f){
                return e.value
            })
        })

        project.Model.findOneAndUpdate({_id:req.params.req_id}, req.body, {new:true}, function (err, updated) {
            if(req.accepts('html')){
                let payload = {title: 'results', data:JSON.stringify(updated)}
                render.renderPage(res,'results',payload,project)
            } else {
                res.json(results)
            }
          });
    })
    .patch((req,res)=>{
        if(req.body._id) delete req.body._id;
        if(req.body.__v) delete req.body.__v;
        
        for( let p in req.body ){
            req.result[p] = req.body[p]
        }
        req.result.save()

        res.json(req.result)
    })
    .delete((req,res)=>{
        try{
            req.result.remove(err => {
                            if(err) throw err
                        })
            res.status(204)
        } catch (err) {
            res.status(500).send(err)
        }
        
    })
}

function createRouting(project){
    createCollectionRouting(project)
    createResourceRouting(project)

}

module.exports = {
    createRouting: createRouting
}
