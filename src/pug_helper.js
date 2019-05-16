const jp      = require('jsonpath')

const concat = (x,y) =>
  x.concat(y)

const flatMap = (f,arr) =>
  arr.map(f).reduce(concat, [])

Array.prototype.flatMap = function(f) {
  return flatMap(f,this)
}

const isEmpty = (obj_) => 
  Object.keys(obj_).length === 0 && obj_.constructor === Object

Object.defineProperty(Object.prototype, 'isEmpty', {
  value: function(f) {  return isEmpty(this) },
  enumerable: false
});

const removeEmpty = (nodes_={}) => {
  return nodes_.filter(e => e.value!='')
}

function getObjProperty(object_,propList_){
  if(propList_.length > 1)
    return getObjProperty(object_[propList_.shift()],propList_)
  else {
    return object_[propList_.shift()]
  }
}

function setObjProperty(object_,propList_,value_){
  if(propList_.length > 1)
    setObjProperty(object_[propList_.shift()],propList_)
  else {
    object_[propList_.shift()] = value_
  }
}

function pathToArray(path_){
  return path_.split(new RegExp("[\\[\\]$.]+",'g'))
}

function propListToString(propList_){
  let keystring = propList_[0]
  if(propList_.length > 1)
    keystring += "[" + propList_.slice(1).join("][") + "]"
  return keystring
}

function getLeaves(data_){
  let pathLists = jp.paths(data_,'$..*').flatMap(e => jp.stringify(e))
  return pathLists.filter(e => pathLists.filter(f => e!==f).every(f => !f.includes(e)))
}

function getLeavesAndData(data_){
  let pathLists = jp.nodes(data_,'$..*').map(function(e){ return {"path" : jp.stringify(e.path), "value" : e.value }})
  return pathLists.filter(e => pathLists.filter(f => e.path!==f.path).every(f => !f.path.includes(e.path)))
}

function getNodeProps(nodes_, schema_){
  return nodes_.map(e => {
    return {...e, "props" : jp.query(schema_,e.path)[0]}
  })
}

function prepareObjForSearch(nodes_){
  let searchObj = {}
  nodes_.forEach(e => {
    let temp
    switch (e.props.type) {
      case "String" :
        temp = {'$regex' : e.value, '$options' : 'i'}
        break
      case undefined :
        if(Array.isArray(e.props)){
          temp ={ '$in': e.value.map(e => new RegExp(e,"i")) }
        }
        break
      default :
        break
    }

    searchObj[e.path.replace("$.","")] = temp
  })
  return searchObj
}

function parseData(nodes_){
  return nodes_.map(function(e){
    if(Array.isArray(e.props) && e.value !== ""){
      console.log("PARSE",e.value)
      return {...e, "value" : JSON.parse(e.value)}
    }
    return e
  })
}

module.exports = {
    parseData:parseData,
    removeEmpty:removeEmpty,
    pathToArray:pathToArray,
    getObjProperty: getObjProperty,
    setObjProperty:setObjProperty,
    getLeaves:getLeaves,
    getLeavesAndData:getLeavesAndData,
    propListToString: propListToString,
    getNodeProps:getNodeProps,
    prepareObjForSearch:prepareObjForSearch
}