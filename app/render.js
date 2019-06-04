
function renderPage(res,template,obj,project){
  let specificObj = {}
  specificObj.descriptions = project.descriptions
  switch(template){
    case "index" :
      specificObj.openedProjects = project.app.locals.openedProjects
      break
    case "form" :
      break
    case "search" :
      break
    case "default" :
      break
  }

  res.render(template,{...obj, ...project.renderSettings, ...specificObj})
}

module.exports = {
  renderPage: renderPage
}